'use strict';

const fs = require('fs-extra');
const multiparty = require('multiparty');
const Promise = require('bluebird');

const logging = require('../logging').getWrapperForModule('upload');

Promise.promisifyAll(multiparty, {
  multiArgs: true,
});

/**
 * Creates route handler for uploading.
 * @param {Storage} storage - Storage to use for serving files
 * @param {Metadata} metadataStorage - Metadata storage
 * @param {Object} options - Options (with MAX_FILE_SIZE field)
 * @return {Function} Express handler
 */
module.exports = function (storage, metadataStorage, options) {
  const MAX_FILE_SIZE = options.MAX_FILE_SIZE;
  return function (request, response) {
    let file;
    let filename;
    let mimetype;
    let hash;
    let size;
    let tmpPath;

    let parseForm = () => {
      let form = new multiparty.Form();

      return form.parseAsync(request).spread((fields, files) => {
        if (typeof files.file !== 'object' || typeof files.file[0] !== 'object')
          throw new Error('Invalid input');

        file = files.file[0];
        filename = file.originalFilename;
        mimetype = file.headers['content-type'] || 'text/plain';
        size = file.size;
        tmpPath = file.path;

        if (size > MAX_FILE_SIZE) throw new Error('File is too big');
      });
    };

    let uploadToIpfs = () => {
      return storage.add(file);
    };

    let addMetadata = (hash) => {
      return metadataStorage.addRecord(hash, mimetype, size);
    };

    let deleteFile = () => {
      return fs.unlink(tmpPath);
    };

    let sendResponse = () => {
      response.json({
        id: hash,
        filename: filename,
        mime: mimetype,
      });
    };

    let handleError = (error) => {
      response.sendStatus(500);
      logging.error(error);
    };

    return parseForm()
      .then(uploadToIpfs)
      .then(addMetadata)
      .then(sendResponse)
      .catch(handleError)
      .then(deleteFile)
      .catch((error) => logging.error(error));
  };
};
