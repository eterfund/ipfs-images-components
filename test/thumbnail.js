'use strict';

const chai = require('chai');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

const settings = require('../components/settings');
const IpfsStorage = require('../components/storage-backends/ipfs');
const Thumbnail = require('../components/thumbnail');

chai.should();
Promise.promisifyAll(fs);

// ipfs daemon and redis must be running
describe('Thumbnail', () => {
  const thumbnail = new Thumbnail(new IpfsStorage(settings.ipfs.url));

  // hash must exist
  const hash = 'QmTP9aq4Af53gRSCfPZJPCQrJt6J7dWyu9xoypG1ToFBBK';
  const size = Number(
    settings.thumbnails.sizes[0]
  );

  describe('#serve(hash, size)', () => {
    it('should return stream of thumbnail or image if failed', (done) => {
      thumbnail.serve(hash, size).then((stream) => {
        stream.should.be.an.instanceof(require('stream').Readable);
        stream._read.should.be.a('function');
        stream._readableState.should.be.an('object');
        done();
      }).catch((error) => {
        done(error);
      });
    });

    it('should save thumbnails on disk if cache is enabled', (done) => {
      let thumbPath = thumbnail.getThumbsPath(hash, size);

      thumbnail.serve(hash, size).then(() => {
        let promise = fs.statAsync(thumbPath);

        if (settings.thumbnails.cache)
          promise.should.be.fullfilled.notify(done);
        else
          promise.should.be.rejected.notify(done);
      }).catch((error) => {
        done(error);
      });
    });
  });

  describe('#create(inputStream, hash, size)', () => {
    // file 'cat.png' must be in the test directory
    let inputStream = fs.createReadStream(path.join(__dirname, 'cat.png'));

    it('should return stream of thumbnail', (done) => {
      thumbnail.create(inputStream, hash, size).then((stream) => {
        stream.should.be.an.instanceof(require('stream').Readable);
        stream._read.should.be.a('function');
        stream._readableState.should.be.an('object');
        done();
      }).catch((error) => {
        done(error);
      });
    });
  });
});
