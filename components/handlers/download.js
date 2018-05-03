'use strict';

const Promise = require('bluebird');

const { FileNotFoundError } = require('../errors');
const logging = require('../logging').getWrapperForModule('download');

/**
 * Creates route handler for /<base-url>/:hash/:filename.
 * @param {Storage} storage - Storage to use for serving files
 * @param {Metadata} metadataStorage - Metadata storage
 * @param {Object} options - options (with CACHE_DURATION field)
 * @return {Function} Express handler
 */
module.exports = function (storage, metadataStorage, options) {
  const CACHE_DURATION = options.CACHE_DURATION;
  return function (request, response) {
    let hash = request.params.hash;

    let getStream = (record) => {
      return Promise.join(Promise.resolve(record), storage.get(hash));
    };

    let sendResponse = (record, stream) => {
      response.writeHead(200, {
        'Cache-Control': `private, max-age=${CACHE_DURATION}`,
        'Content-Type': record.mimetype || 'application/octet-stream',
        'Last-Modified': new Date().toUTCString(),
      });

      stream.pipe(response);
    };

    let send304Response = (mtime) => {
      response.writeHead(304, {
        'Last-Modified': mtime,
      });

      response.end();
    };

    let handleError = (error) => {
      console.log(error);
      if (error instanceof FileNotFoundError) {
        response.sendStatus(404);
      } else {
        response.sendStatus(500);
        logging.error(error);
      }
    };

    let modifiedSince = request.headers['if-modified-since'];
    if (modifiedSince) {
      return send304Response(Number(modifiedSince));
    } else {
      return metadataStorage
        .getRecord(hash)
        .then(getStream)
        .spread(sendResponse)
        .catch(handleError);
    }
  }
};
