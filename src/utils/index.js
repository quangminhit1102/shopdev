"use strict";

const _ = require("lodash");

/**
 *
 * @param {*} field
 * @param {*} object
 * @returns {Object} - Returns an object containing only the specified fields from the original object.
 */
const getObjectInformation = (field = [], object = {}) => {
  return _.pick(object, field);
};

module.exports = { getObjectInformation };
