'use strict';

const Promise = require('bluebird');

const FileNotFoundError = require('../errors').FileNotFoundError;
const logging = require('../logging').getWrapperForModule('download_thumb');

/**
 * Creates route handler for /<base-url>/thumb/:size/:hash.
 * @param {Thumbnail} thumbnail - Thumbnail storage
 * @param {Metadata} metadataStorage - Metadata storage
 * @param {Object} options - Options (with CACHE_DURATION field)
 * @return {Function} Express handler
 */
module.exports = function (thumbnail, metadataStorage, options) {
  const CACHE_DURATION = options.CACHE_DURATION;
  return function (request, response) {
    let size = Number(request.params.size);
    let hash = request.params.hash;

    let getStream = (record) => {
      return Promise.join(Promise.resolve(record), thumbnail.serve(hash, size));
    };

    let sendResponse = (record, stream) => {
      response.writeHead(200, {
        'Cache-Control': `private, max-age=${CACHE_DURATION}`,
        'Content-Type': 'image/jpeg',
        'Last-Modified': Date.now(),
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
