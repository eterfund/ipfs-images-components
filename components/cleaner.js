'use strict';

const Promise = require('bluebird');

const logging = require('./logging').getWrapperForModule('cleaner');
const Metadata = require('./metadata');
const redis = require('./redis');
const Ipfs = require('./storage-backends/ipfs');

/**
 * Represents a cleaner for attachments.
 */
class Cleaner {
  /**
   * Constructor for class cleaner.
   * @param  {Number} expire   Attachments expiration time in seconds.
   * @param  {Number} interval Cleaning interval in seconds.
   * @param  {String} index    Name of sorted set of attachments upload date.
   * @param  {String} prefix   Prefix for attachments keys.
   */
  constructor(expire, interval, index, prefix) {
    this.expire = expire;
    this.interval = interval;

    this.index = index;
    this.prefix = prefix;

    let days = this.interval / (60 * 60 * 24);
    logging.info(`Cleaner set to run each ${days} days`);
  }

  /**
   * Builds sorted set of datetimes of already uploaded attachments.
   * @return {Promise} Number of elements added to the set.
   */
  buildIndex() {
    logging.info('Building index for old attachments');

    return redis.keysAsync(this.prefix + '*').then((keys) => {
      this.hashes = keys.map((key) => key.split('_')[1]);
      logging.info(`Found ${this.hashes.length} attachments`);

      return Promise.map(keys, (key) => redis.hgetallAsync(key));
    }).each((record, index, length) => {
      if (length <= 0) throw new RangeError('List must not be empty');

      // Convert UTC string to UNIX timestamp
      if (isNaN(Number(record.datetime))) {
        record.datetime = new Date(record.datetime).getTime();
      }

      return redis.zaddAsync(this.index, [
        record.datetime, this.hashes[index],
      ]).then(() => {
        logging.info(`Added to index: ${this.hashes[index]}`);
      });
    });
  }

  /**
   * Deletes attachment for hash from both IPFS and Redis.
   * @param  {String}  hash IPFS hash of attachment.
   * @return {Promise}      Resolves if deleted, rejects otherwise.
   */
  delAttachment(hash) {
    logging.info(`Deleting attachment ${hash}`);

    let ipfs = new Ipfs();
    let metadata = new Metadata();

    return Promise.join(
      ipfs.unpin(hash)
    ).then(() => {
      logging.info(`Successfully unpinned attachment ${hash}`);
      return metadata.delRecord(hash);
    }).then(() => {
      logging.info(`Deleted metadata for ${hash}`);
    });
  }

  /**
   * Runs cleaner on the current set.
   * @return {Promise} Number of deleted attachments.
   */
  run() {
    let timestamp = Date.now() - this.expire * 1000;
    let date = new Date(timestamp).toUTCString();
    const ipfs = new Ipfs();

    logging.info(`Performing cleanup of attachments uploaded earlier
                  than '${date}'`);

    logging.info(`Loading list of local attachments (ipfs pin ls). Please be patient, this can take a lot of time`);

    return ipfs.getLocalObjects().then(hashes => {
      const hashSet = new Set(hashes);
      logging.info('Looking for outdated attachments...');
      return redis.zrangebyscoreAsync(this.index, [
        '-inf', timestamp,
      ]).then(list => {
        list = list.filter(hash => hashSet.has(hash));
        if (list.length <= 0) {
          logging.info('Nothing to clean');
          return Promise.resolve(list.length);
        }

        logging.info(`Deleting ${list.length} attachments`);

        return Promise.map(list, (hash) => {
          return this.delAttachment(hash);
        }).then(() => {
          logging.info(`Successfully deleted ${list.length} attachments`);
        });
      }).catch((error) => {
        logging.error(error);
      });
    });
  }
}

module.exports = Cleaner;
