'use strict';
let logger = require('../helpers/logger').instance
let redisClient = require('../helpers/redisClient').instance;

/**
 *
 * @param {RedisClient} redisClient
 * @param {Logger} logger
 * @constructor
 */
function Consumer(redisClient, logger) {
  this.redisClient = redisClient;
  this.logger = logger;
  this.intervalId = null;
  // receiving interval in miliseconds
  this.interval = null;

  this.handleMessage = () => {
    return this.redisClient.retrieveMessage()
      .then(messge => {
        if (messge == null) {
          console.log("No messges in queue at current moment");

          return messge;
        }
        if (this.isFailedMessage()) {
          this.redisClient.sendErrorMessage(messge);
        } else {
          console.log("Message received:" + messge);
        }

        return true;
      }).catch(error => {
        logger.error(error);

        return false;
      })
  }

  this.isFailedMessage = () => {
    return Math.random() > 0.85;
  }

  this.generateInterval = () => {
    this.interval = Math.random() * 1000;

    return this.interval;
  }

  this.run = () => {
    let interval = this.generateInterval();
    this.intervalId = setInterval(() => {
      this.handleMessage();
    }, interval);

    this.logger.info('Consumer started on process: ' + process.pid);

    return this.intervalId;
  }

  this.terminate = () => {
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.interval = null;
  }
}

module.exports = {
  instance: new Consumer(redisClient, logger),
  constructor: Consumer
};
