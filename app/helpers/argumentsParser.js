'use strict'

module.exports = {
  /**
   * 
   * @param {Array<number>} aruments
   * @returns {boolean}
   */
  isGettingErrorMode: (aruments) => {
    return aruments.indexOf('getErrors') !== -1;
  }
}
