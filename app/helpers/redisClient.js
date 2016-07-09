'use strict';
var redis = require('promise-redis')();
var config = require('../config/config');
var clientListParser = require('./clientListParser');
var connection = redis.createClient(config.redis);

function RedisClient() {
  this.messageQueue = 'messages';
  this.errorQueue = 'failed_messages';
  this.queueExpirationTime = 60;
  /**
   *
   * @param {number} message
   * @returns {Promise}
   */
  this.sendMessage = (message) => {
    return this.multi().rpush(this.messageQueue, message)
      // rewrite messages expiration time on each push
      .expire(this.messageQueue, this.queueExpirationTime)
      .exec();
  }

  this.sendErrorMessage = (message) => {
    return this.rpush(this.errorQueue, message)
  }

  this.retrieveMessage = () => {
    return this.lpop(this.messageQueue).then(message => {
      if (message === null) {
        this.confirmGeneratorIsDown();
      }

      return message;
    });
  }
  /**
   *
   * @returns {Promise.<Array>}
   */
  this.retrieveFailedMessages = () => {
    return this.lrange(this.errorQueue, 0, -1).then(messages => {
      this.del(this.errorQueue);
        return messages;
    });
  }

  this.initConnectionMode = () => {
    return this.checkGeneratorExistance().then((generatorExists) => {
      this.setConnectionName(generatorExists).then(() => {
        !generatorExists ? this.emit('generator_mode') : this.emit('consumer_mode');
      });
    });
  }

  this.confirmGeneratorIsDown = () => {
    return this.checkGeneratorExistance().then((generatorExists) => {
      this.setConnectionName(generatorExists).then(() => {
        if (!generatorExists) {
          this.emit('generator_down');
        }
      });
    });
  }

  this.checkGeneratorExistance = () => {
    return this.client('list').then(list => {
      list = clientListParser.parseClientList(list);

      let generatorExists = list.some((client) => {
        return client.name === 'GENERATOR';
      })

      return generatorExists;
    });
  }

  this.setConnectionName = (generatorExists) => {
    if (!generatorExists) {
      return this.client('setname', 'GENERATOR');
    }

    return this.client('setname', 'CONSUMER');
  };

  this.on('connect', this.initConnectionMode);

  this.on('error', (error) => {
    if (error.code == 'ETIMEDOUT' || error.code == 'ECONNREFUSED') {
      console.log('Failed to connect to database');
    }

    console.log('Unexpected database error: ' + error);
    process.exit();
  });

}

RedisClient.prototype = connection;

module.exports = {
  instance: new RedisClient(),
  constructor: RedisClient
};
