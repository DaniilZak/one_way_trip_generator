'use strict';
let redis = require('promise-redis')();
let config = require('../config/config');
let clientListParser = require('./clientListParser');
let connection = redis.createClient(config.redis);

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
      this.confirmGeneratorIsAlive();

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
    console.log('Starting connection to redis...');
    return this.checkGeneratorExistance().then((generatorExists) => {
      this.setConnectionName(generatorExists).then(() => {
        !generatorExists ? this.emit('generator_mode') : this.emit('consumer_mode');
      });
    });
  }

  this.confirmGeneratorIsAlive = () => {
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

}

RedisClient.prototype = connection;

module.exports = {
  instance: new RedisClient(),
  constructor: RedisClient
};
