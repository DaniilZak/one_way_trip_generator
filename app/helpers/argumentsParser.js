'use strict'

module.exports = {
  /**
   *
   * @param {Array<number>} args
   * @returns {boolean}
   */
  isGettingErrorMode: (args) => {
    return args.indexOf('getErrors') !== -1;
  }
}
