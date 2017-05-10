'use strict';

const Promise = require('bluebird');

const FileNotFoundError = require('./errors').FileNotFoundError;
const logging = require('./logging').getWrapperForModule('metadata');
const redis = require('./redis');
const settings = require('./settings');

/**
 * Represents an interface to interact with Redis to add and get records.
 */
class Metadata {
  /**
   * Constructor for Metadata class.
   */
  constructor() {
    this.prefix = settings.redis.prefix.attachments;
    this.index = settings.redis.index.datetime;
  }

  /**
   * Adds record for attachments to Redis.
   * @param  {String} hash     IPFS hash of attachment.
   * @param  {String} mimetype MIME type of attachment.
   * @param  {Number} size     Size of attachment.
   * @return {Promise[]}       Array of array of numbers of added records and
   *                           array of numbers of elements added to the set.
   */
  addRecord(hash, mimetype, size) {
    let record = String(this.prefix + hash);
    let timestamp = Date.now();

    logging.verbose(`Add record ${record} to Redis`);

    return Promise.join(
      redis.hmsetAsync(record, [
        'datetime', timestamp,
        'mimetype', mimetype,
        'size', size,
      ]),
      redis.zaddAsync(this.index, [
        timestamp, hash,
      ])
    );
  }

  /**
   * Gets record for attachment from Redis.
   * @param  {String}  hash IPFS hash of attachment.
   * @return {Promise}      Record for attachment.
   */
  getRecord(hash) {
    let record = String(this.prefix + hash);
    logging.verbose(`Get record ${record} from Redis`);

    return redis.hgetallAsync(record).then((data) => {
      if (!data)
        throw new FileNotFoundError(`Record ${record} not found in Redis`);

      return data;
    });
  }

  /**
   * Deletes record for attachment from Redis.
   * @param  {String}  hash IPFS hash of attachment.
   * @return {Promise}      Resolves if deleted, otherwise rejects.
   */
  delRecord(hash) {
    let record = String(this.prefix + hash);
    logging.verbose(`Delete record ${record} from Redis`);

    return Promise.join(
      redis.delAsync(this.prefix + hash),
      redis.zremAsync(this.index, hash)
    );
  }
}

module.exports = Metadata;
