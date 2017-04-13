'use strict';

const Promise = require('bluebird');

const logging = require('./logging').getWrapperForModule('cleaner');
const redis = require('./redis');
const Ipfs = require('./ipfs');

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
   * Runs cleaner on the current set.
   * @return {Promise} Number of deleted attachments.
   */
  run() {
    let timestamp = Date.now() - this.expire * 1000;
    let date = new Date(timestamp).toUTCString();

    logging.info(`Performing cleanup of attachments uploaded earlier
                  than '${date}'`);

    return redis.zrangebyscoreAsync(this.index, [
      '-inf', timestamp,
    ]).then((list) => {
      if (list.length <= 0) {
        logging.info('Nothing to clean');
        return Promise.resolve(list.length);
      }

      logging.info(`Deleting ${list.length} attachments`);

      let ipfs = new Ipfs();

      return Promise.map(list, (hash) => {
        return Promise.join(
          redis.delAsync(this.prefix + hash),
          redis.zremAsync(this.index, hash),
          ipfs.unpin(hash)
        );
      }).then(() => {
        logging.info(`Successfully deleted ${list.length} attachments`);
      });
    }).catch((error) => {
      logging.error(error);
    });
  }
}

module.exports = Cleaner;
