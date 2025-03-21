"use strict";

const apiKeyModel = require("../models/apiKey.model");

const findAPIKey = async (key) => {
  return await apiKeyModel.findOne({ Key: key, status: true }).lean();
};

module.exports = {
  findAPIKey,
};
