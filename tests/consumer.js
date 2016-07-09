'use strict';
let Consumer = require('../app/modules/consumer').constructor;
let RedisClient = require('../app/helpers/redisClient').constructor;
let Logger = require('../app/helpers/redisClient').constructor;

const chai = require('chai');
const spies = require('chai-spies');
const assert = chai.assert;
const expect = chai.expect;

chai.use(spies);

describe('Consumer', () => {
  let logger = new Logger();
  let redisClient = new RedisClient(logger);
  let consumer = new Consumer(redisClient, logger);

  redisClient.removeAllListeners();

  describe('#isFailedMessage', () => {
    it('should return boolean value', ()=> {
      let isFailed = consumer.isFailedMessage();
      assert(typeof isFailed === 'boolean');
    });
  });

  describe('#handleMessage', () => {
    redisClient.retrieveMessage = chai.spy(() => {
      return Promise.resolve(1)
    });
    redisClient.sendErrorMessage = chai.spy(() => {
      return Promise.resolve(true)
    });

    it('should read out valid message from queue', (done) => {
      consumer.isFailedMessage = chai.spy(() => {
        return false
      });

      consumer.handleMessage().then(() => {
        expect(redisClient.retrieveMessage).to.be.called();
        expect(consumer.isFailedMessage).to.be.called();
        expect(redisClient.sendErrorMessage).not.to.be.called();
        done();
      }).catch((error) => {
        done(error)
      });
    });

    it('should read out invalid messages and send it to errors queue', (done) => {
      consumer.isFailedMessage = chai.spy(() => {
        return true
      });

      consumer.handleMessage().then(() => {
        expect(redisClient.retrieveMessage).to.be.called();
        expect(redisClient.sendErrorMessage).to.be.called();
        done();

      }).catch((error) => {
        done(error)
      });
    });
  });
});
