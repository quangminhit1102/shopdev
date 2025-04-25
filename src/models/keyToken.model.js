"use strict";
const mongoose = require("mongoose");
let DOCUMENT_NAME = "Key";
let COLLECTION_NAME = "Keys";
const keyTokenModel = require("./keyToken.model");

// Declare the Schema of the Mongo model
const keyTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    publicKey: {
      type: String,
    },
    privateKey: {
      type: String,
    },
    token: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    refreshTokensUsed: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    Collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, keyTokenSchema);
