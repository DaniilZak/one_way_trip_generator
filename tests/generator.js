let Generator = require('../app/modules/generator').constructor;
let RedisClient = require('../app/helpers/redisClient').constructor;
let Logger = require('../app/helpers/redisClient').constructor;

const chai = require('chai');
const spies = require('chai-spies');
const assert = chai.assert;
const expect = chai.expect;

chai.use(spies);

describe('Generator', () => {
  let logger = new Logger();
  let redisClient = new RedisClient(logger);
  let generator = new Generator(redisClient, logger);

  redisClient.removeAllListeners();

  describe('#generateMessage()', () => {
    it('should produce integer message', () => {
      let message = generator.generateMessage();
      assert(Number.isInteger(message));
    });
  });

  describe('#pushMessageToQueue()', () => {
    it('should send generated message to redis', () => {
      redisClient.sendMessage = chai.spy(redisClient.sendMessage);
      generator.generateMessage = chai.spy(generator.generateMessage);

      generator.pushMessageToQueue();
      expect(generator.generateMessage).to.have.been.called();
      expect(redisClient.sendMessage).to.have.been.called();
    });
  })
});
