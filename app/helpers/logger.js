'use strict';

let winston = require('winston');
let config = require('./../config/config');
let redisClient = require('./redisClient').instance;

winston = new (winston.Logger)({

  transports: [
    new (winston.transports.File)({
      name: 'info-file',
      filename: 'logs/' + process.pid + '_' + config.logger.infoLogFile,
      level: 'info'
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: 'logs/' + process.pid + config.logger.errorLogFile,
      level: 'error'
    }),
  ]
});

/**
 *
 * @param {RedisClient} redisClient
 * @constructor
 */
function Logger(redisClient) {
  this.redisClient = redisClient;

  this.readOutFailedMessages = () => {
    return this.redisClient.retrieveFailedMessages().then(messages => {
      if (messages.length <= 0) {
        console.log('No failed message exists');
      } else {
        console.log("Failed messages: ");

        let lastMessage = messages.pop();

        messages.forEach((message, index) => {
          process.stdout.write(message + ',');
          if ((index + 1) % 10 === 0) {
            process.stdout.write("\n");
          }
        });

        process.stdout.write(lastMessage + "\n");

      }
    }).catch(error => {
      this.error(error);
    });
  }
}

Logger.prototype = winston;

module.exports = {
  instance: new Logger(redisClient),
  constructor: Logger
};
