const fs = require('fs');
const ipfsAPI = require('ipfs-api');
const path = require('path');

const { FileNotFoundError } = require('../errors');
const logging = require('../logging').getWrapperForModule('ipfs');

/**
 * Represents an interface to interact with IPFS daemon to download and upload
 * attachments.
 */
class IpfsStorage {
  /**
   * constructor for Ipfs class.
   */
  constructor (url) {
    this.ipfs = ipfsAPI(url);
  }

  /**
   * Uploads attachment to IPFS.
   * @param  {File} file Multipart/form-data file.
   * @return {Promise<string>} IPFS hash of uploaded attachment.
   */
  add (file) {
    logging.verbose(`Uploading '${file.originalFilename}' to IPFS`);
    
    let files = [{
      path: path.basename(file.path),
      content: fs.createReadStream(file.path),
    }];

    let hash;
    return this.ipfs.files.add(files).then((res) => {
      hash = res[0].hash;

      return this.pin(hash);
    }).then(() => {
      return Promise.resolve(hash);
    });
  }

  /**
   * Unpins a file from IPFS - it will be deleted during next `ipfs repo gc`
   * 
   * @param {string} hash - Hash of file to delete
   * @return {Promise<void>}
   */
  delete (hash) {
    logging.verbose(`Unpinning object ${hash} from local storage`);
    return this.ipfs.pin.rm(hash);
  }

  /**
   * Gets file from IPFS.
   * @param  {String} hash IPFS hash.
   * @return {Promise<ReadableStream>} Readable Stream of attachment.
   */
  get (hash) {
    logging.verbose(`Serving attachment for ${hash}`);

    return this.ipfs.files.cat(hash).then((stream) => {
      if (!(stream && stream.pipe)) {
        throw new FileNotFoundError('No file or stream provided');
      }

      return stream;
    });
  }


  /**
   * Pins a file by hash.
   * @param  {String} hash IPFS hash.
   * @return {Promise<void>}
   */
  pin (hash) {
    logging.verbose(`Pinning object ${hash} to local storage`);
    return this.ipfs.pin.add(hash);
  }
}

module.exports = IpfsStorage;
