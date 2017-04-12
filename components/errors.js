'use strict';

/**
 * Represents custom error which is thrown when file is not found.
 */
class FileNotFoundError extends Error {
  /**
   * constructor for FileNotFoundError class.
   * @param  {String} message Error message.
   */
  constructor(message) {
    super();
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {};
module.exports.FileNotFoundError = FileNotFoundError;
