"use strict";

const _ = require("lodash");

const getObjectInformation = (field = [], object = {}) => {
  return _.pick(object, field);
};

module.exports = { getObjectInformation };
