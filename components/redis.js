'use strict';

const Promise = require('bluebird');
const redis = require('redis');

const settings = require('./settings');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

let redisClient = redis.createClient(
  settings.redis.url,
  settings.redis.options
);

module.exports = redisClient;
