'use strict';

const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');
const sharp = require('sharp');

const FileNotFoundError = require('./errors').FileNotFoundError;
const logging = require('./logging').getWrapperForModule('thumbnail');
const settings = require('./settings');

Promise.promisifyAll(fs);

const THUMB_DIMENSIONS = 128;

/**
 * Represents Thumbnail class.
 */
class Thumbnail {
  /**
   * Constructor for Thumbnail class.
   */
  constructor (storage) {
    this.cache = settings.thumbnails.cache;
    this.sizes = settings.thumbnails.sizes;
    this.storage = storage;

    if (this.cache) {
      logging.verbose('Thumbnail cache enabled');
    } else {
      logging.verbose('Thumbnail cache disabled');
    }
  }

  /**
   * Concatenates pieces to return path to directory for thumbnail.
   * @param  {String} hash File hash.
   * @param  {Number} size Size of thumbnail.
   * @return {String}      Path to directory for thumbnail.
   */
  getThumbsDir(hash, size) {
    // QmABHA5h..., 128 => /path/128/AB/
    return path.join(settings.thumbnails.path,
                     String(size),
                     hash.slice(0, 2),
                     hash.slice(2, 4));
  }

  /**
   * Concatenates pieces to return path to thumbnail.
   * @param  {String} hash File hash.
   * @param  {Number} size Size of thumbnail.
   * @return {String}      Path to thumbnail.
   */
  getThumbsPath(hash, size) {
    // QmABHA5h..., 128 => /path/128/AB/QmABHA5h...
    return path.join(this.getThumbsDir(hash, size),
                     hash);
  }

  /**
   * Serves thumbnail.
   * @param  {String} hash File hash.
   * @param  {Number} size Size of thumbnail.
   * @return {Promise}     Stream of thumbnail.
   */
  serve(hash, size) {
    if (this.sizes.indexOf(size) == -1) size = THUMB_DIMENSIONS;

    let core = function(hash, size) {
      logging.verbose(`Getting original image for ${hash} from storage`);
      return this.storage.get(hash).then((stream) => {
        return this.create(stream, hash, size).then((stream) => {
          logging.verbose(`Created ${size}x${size} thumbnail for ${hash}`);
          return stream;
        }).catch(() => {
          logging.verbose(`Failed to create ${size}x${size} thumbnail
                           for ${hash}`);
          return stream;
        });
      });
    };

    if (this.cache) {
      let thumbsDir = this.getThumbsDir(hash, size);
      let thumbPath = this.getThumbsPath(hash, size);

      return fs.statAsync(thumbPath).then(() => {
        logging.verbose(`Serving thumbnail for ${hash} from cache`);
        return fs.createReadStream(thumbPath);
      }).catch(() => {
        logging.verbose(`Thumbnail for ${hash} wasn't found on local drive`);
        return fs.ensureDirAsync(thumbsDir).then(() => {
          return core.call(this, hash, size);
        }).then((stream) => {
          if (!(stream && stream.pipe))
            throw new FileNotFoundError('No file or stream provided');

          logging.verbose(`Caching thumbnail for ${hash}`);
          let wstream = fs.createWriteStream(thumbPath);
          stream.pipe(wstream);

          logging.verbose(`Serving thumbnail for ${hash} to client`);
          return stream;
        });
      });
    } else {
      return core.call(this, hash, size).then((stream) => {
        logging.verbose(`Serving thumbnail for ${hash} to client`);
        return stream;
      });
    }
  }

  /**
   * Creates thumbnail for image.
   * @param  {Stream}  inputStream Stream of image.
   * @param  {String}  hash        Hash of thumbnail.
   * @param  {Number}  size        Size of thumbnail.
   * @return {Promise}             Stream of thumbnail.
   */
  create(inputStream, hash, size) {
    logging.verbose(`Creating ${size}x${size} thumbnail for ${hash}`);

    let resizer = sharp()
      .resize(size, size)
      .background({r: 255, g: 255, b: 255, alpha: 0})
      .flatten()
      .jpeg();

    let outputStream = inputStream.pipe(resizer);

    return new Promise((resolve, reject) => {
      resizer.on('end', resolve(outputStream));
      resizer.on('error', reject);
    });
  }
}

module.exports = Thumbnail;
