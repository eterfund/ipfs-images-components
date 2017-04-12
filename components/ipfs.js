'use strict';

const fs = require('fs');
const ipfsAPI = require('ipfs-api');

const FileNotFoundError = require('./errors').FileNotFoundError;
const logging = require('./logging').getWrapperForModule('ipfs');
const settings = require('./settings');

/**
 * Represents an interface to interact with IPFS daemon to download and upload
 * attachments.
 */
class Ipfs {
  /**
   * constructor for Ipfs class.
   */
  constructor() {
    this.ipfs = ipfsAPI(settings.ipfs.url);
  }

  /**
   * Serves attachment to the client.
   * @param  {String} hash IPFS hash.
   * @return {Promise}     Readable Stream of attachment.
   */
  serve(hash) {
    logging.verbose(`Serving attachment for ${hash}`);

    return this.ipfs.files.cat(hash).then((stream) => {
      if (!(stream && stream.pipe))
        throw new FileNotFoundError('No file or stream provided');

      return stream;
    });
  }

  /**
   * Uploads attachment to IPFS.
   * @param  {File}     file Multipart/form-data file.
   * @return {Promise}       IPFS hash of uploaded attachment.
   */
  upload(file) {
    logging.verbose(`Uploading '${file.originalFilename}' to IPFS`);

    let files = [{
      path: file.path,
      content: fs.createReadStream(file.path),
    }];

    let hash;
    return this.ipfs.files.add(files).then((res) => {
      hash = res;
      return this.ipfs.pin.add(hash);
    }).then(() => {
      return Promise.resolve(hash);
    });
  }
}

module.exports = Ipfs;