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
    Key: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      required: true,
      enum: ["read", "write", "delete"],
    },
  },
  {
    timestamps: true,
    Collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, apiKeySchema);
