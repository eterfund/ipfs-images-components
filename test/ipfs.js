'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const path = require('path');
const Readable = require('stream').Readable;

const settings = require('../components/settings');
const IpfsStorage = require('../components/storage-backends/ipfs');

chai.should();
chai.use(require('chai-string'));

// ipfs daemon must be running
describe('Ipfs', () => {
  const ipfs = new IpfsStorage(settings.ipfs.url);

  describe('#get(hash)', () => {
    // hash of 'cat.png' must exist
    const hash = 'QmTeHHV878utbtigQ8FeNPJ1rNqNXEPHTN9KWwF78hMYpf';

    it('should return stream', (done) => {
      ipfs.get(hash).then((stream) => {
        stream.should.be.an.instanceof(Readable);
        stream._read.should.be.a('function');
        stream._readableState.should.be.an('object');
        done();
      }).catch((error) => {
        done(error);
      });
    });
  });

  describe('#add(file)', () => {
    // file 'cat.png' must be in the test directory
    const file = {
      path: path.join(__dirname, 'cat.png'),
      originalFilename: 'cat.png',
    };

    it('should return hash', function (done) {
      this.timeout(30000);
      ipfs.add(file).then((hash) => {
        hash = hash[0].hash;
        hash.should.startWith('Qm');
        hash.should.have.length(46);
        done();
      }).catch((error) => {
        done(error);
      });
    });
  });
});
