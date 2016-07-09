'use strict';
/**
 *  A class for parsing client list retrieved from redis into object
 */
function clientListParser() {
  /**
   *
   * @param {string} clientString
   * @returns {{}}
   */
  this.parseClientString = (clientString) => {
    let properties = clientString.split(' ');
    let result = {};

    properties.forEach((property) => {
      property = property.split('=');

      result[property[0]] = property[1];
    });

    return result;
  }

  this.parseClientList = (list) => {
    list = list.split('\n');

    return list.map(this.parseClientString);
  }
}


module.exports = new clientListParser();
