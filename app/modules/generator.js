'use strict';
let logger = require('../helpers/logger').instance
let redisClient = require('../helpers/redisClient').instance;

/**
 *
 * @param {RedisClient} redisClient
 * @param {Logger} logger
 * @constructor
 */
function Generator(redisClient, logger) {
  this.counter = 0;
  this.redisClient = redisClient;
  this.intervalId = null;
  this.logger = logger;

  this.generateMessage = () => {
    this.counter = this.counter || 0;

    return this.counter++
  }

  this.pushMessageToQueue = () => {
    var message = this.generateMessage();
    this.redisClient.sendMessage(message)
      .then(() => {
        console.log('Message sent: ' + message);
      })
      .catch((error) => {
        this.logger.error(error);
      });
  }

  this.run = () => {
    this.intervalId = setInterval(() => {
      this.pushMessageToQueue();
    }, 500);

    this.logger.info('Generator started on process: ' + process.pid);
  }

  this.terminate = () => {
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

module.exports = {
  instance: new Generator(redisClient, logger),
  constructor: Generator
};
