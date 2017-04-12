'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');

const Metadata = require('../components/metadata');

chai.should();
chai.use(require('chai-as-promised'));

// redis must be running
describe('Metadata', () => {
  const metadata = new Metadata();
  const hash = 'QmTP9aq4Af53gRSCfPZJPCQrJt6J7dWyu9xoypG1ToFBBK';
  const mimetype = 'image/png';
  const size = '247223';

  describe('#addRecord(hash, mimetype, size)', () => {
    it('should add record', () => {
      metadata.addRecord(hash, mimetype, size).should.be.fullfilled;
    });
  });

  describe('#getRecord(hash)', () => {
    it('should get record', (done) => {
      metadata.getRecord(hash).then((record) => {
        record.mimetype.should.be.equal(mimetype);
        record.size.should.be.equal(size);
        done();
      }).catch((error) => {
        done(error);
      });
    });
  });

  describe('#addRecord(hash, mimetype, size) && #getRecord(hash)', () => {
    it('should add record and get it back', (done) => {
      metadata.addRecord(hash, mimetype, size).then(() => {
        return metadata.getRecord(hash);
      }).then((record) => {
        record.mimetype.should.be.equal(mimetype);
        record.size.should.be.equal(size);
        done();
      }).catch((error) => {
        done(error);
      });
    });
  });
});
