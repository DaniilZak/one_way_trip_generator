'use strict';
require('dotenv').load();
let redisClient = require("./app/helpers/redisClient").instance;
let generator = require("./app/modules/generator").instance;
let consumer = require("./app/modules/consumer").instance;
let logger = require('./app/helpers/logger').instance;
let argumentParser = require('./app/helpers/argumentsParser');

if (argumentParser.isGettingErrorMode(process.argv)) {
  logger.readOutFailedMessages().then(() => {
    process.exit();
  });
} else {

  redisClient.on('error', (error) => {
    if (error.code == 'ETIMEDOUT' || error.code == 'ECONNREFUSED') {
      console.log(
        'Failed to connect to redis server, ' +
        'check redis config in .env file in project' +
        ' root folder'
      );
    } else {
      console.log('Unexpected redis error: ' + error);
    }

    process.exit();
  });

  redisClient.on('generator_mode', () => {
    generator.run();
    console.log('Generator started at process: ' + process.pid);
  });

  redisClient.on('consumer_mode', () => {
    consumer.run();
    console.log('Consumer started at process: ' + process.pid);
  });

  redisClient.on('generator_down', () => {
    consumer.terminate();
    generator.run();

    console.log('Restarted as generator at process: ' + process.pid);
  });
}
