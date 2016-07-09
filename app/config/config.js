'use strict';

function _getEnv(key, defaultValue) {
  return process.env[key] || defaultValue;
}

const config = {
  redis: {
    host: _getEnv('REDIS_HOST', '127.0.0.1'),
    port: _getEnv('REDIS_PORT', 6379),
  },

  logger: {
    infoLogFile: _getEnv('LOG_INFO_FILE', 'info.log'),
    errorLogFile: _getEnv('LOG_ERROR_FILE', 'error.log')
  }
}

module.exports = config;