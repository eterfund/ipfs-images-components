'use strict';

const ipfsAPI = require('ipfs-api');
const Promise = require('bluebird');

const logging = require('./logging').getWrapperForModule('ipfs');
const redis = require('./redis');
const settings = require('./settings');

const MAX_CONCURRENT_PINS = 100;

/**
 * Represents an interface to interact with IPFS daemon and Redis
 * to pin attachments.
 */
class Pin {
  /**
   * Constructor for Pin class.
   */
  constructor() {
    this.ipfs = ipfsAPI(settings.ipfs.url);
    this.prefix = settings.redis.prefix.attachments;
  }

  /**
   * Pins attachments to local storage for which there are records in Redis.
   * @return {Promise} Number of pinned attachments.
   */
  all() {
    logging.info('Pinning all attachments available in the database');

    return redis.keysAsync(this.prefix + '*').then((keys) => {
      let hashes = keys.map((key) => key.split('_')[1]);
      logging.info(`Found ${hashes.length} attachments`);

      let counter = 0;
      return Promise.map(hashes, (hash) => {
        return this.ipfs.pin.add(hash).then(() => {
          logging.info(`Pinned ${hash}, ${++counter}/${hashes.length}`);
        });
      }, {
        concurrency: MAX_CONCURRENT_PINS,
      });
    }).then(() => {
      logging.info('Successfully pinned all attachments');
    }).catch((error) => {
      throw error;
    });
  }
}

module.exports = Pin;
