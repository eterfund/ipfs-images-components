const Promise = require('bluebird');
const fs = require('fs-extra');
const crypto = require('crypto');
const path = require('path');
const logging = require('../logging').getWrapperForModule('filesystem');


const HASH_ALGORITHM = 'sha256';

class FilesystemStorage {
  /**
   * @param {string} basePath - A root directory for all stored files
   */
  constructor (basePath) {
    this.basePath = basePath;
  }

  /**
   * Uploads attachment to file storage.
   * @param {File} file Multipart/form-data file.
   * @return {Promise<string>} Hash of uploaded attachment.
   */
  add (file) {
    logging.verbose(`Uploading '${file.originalFilename}' to filesystem`);

    const hash = this.computeHash(file);
    const filePath = this.getFilePath(hash);

    return fs.outputFile(filePath, file).then(() => hash);
  }

  /**
   * Deletes a file.
   * 
   * @param {string} hash - Hash of file to delete
   * @return {Promise<void>}
   */
  delete (hash) {
    logging.verbose(`Deleting file ${hash} from filesystem`);
    
    const filePath = this.getFilePath(hash);
    return fs.remove(filePath);
  }

  /**
   * Gets file from IPFS.
   * @param  {String} hash IPFS hash.
   * @return {Promise<ReadableStream>} Readable Stream of attachment.
   */
  get (hash) {
    logging.verbose(`Serving attachment for ${hash} from filesystem`);

    const filePath = this.getFilePath(hash);
    return fs.readFile(filePath);
  }


  computeHash (file) {
    const hash = crypto.createHash(HASH_ALGORITHM);
    hash.update(file);
    return hash.digest('hex');
  }

  getFilePath (hash) {
    const dirName = hash.slice(0, 2);
    const fileName = hash.slice(2);
    return path.join(this.basePath, dirName, fileName);
  }
}