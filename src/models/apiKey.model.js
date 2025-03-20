"use strict";
const mongoose = require("mongoose");
let DOCUMENT_NAME = "APIKey";
let COLLECTION_NAME = "APIKeys";

// Declare the Schema of the Mongo model
var apiKeySchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    apiKey: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  {
    timestamps: true,
    Collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, apiKeySchema);
