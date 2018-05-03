'use strict';

const { FileNotFoundError } = require('../errors');
const logging = require('../logging').getWrapperForModule('del_attachment');

/**
 * Created route handler for deleting attachments
 * @param {Storage} storage - File storage
 * @return {Function} Express handler
 */
module.exports = function (storage) {
  return function (request, response) {
    let hash = request.params.hash;

    let sendResponse = () => {
      response.sendStatus(200);
    };

    let handleError = (error) => {
      if (error instanceof FileNotFoundError) {
        response.sendStatus(404);
      } else {
        response.sendStatus(500);
        logging.error(error);
      }
    };

    return storage
      .delete(hash)
      .then(sendResponse)
      .catch(handleError);
  };
};
