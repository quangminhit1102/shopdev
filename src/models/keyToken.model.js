"use strict";
const mongoose = require("mongoose");
let DOCUMENT_NAME = "Key";
let COLLECTION_NAME = "Keys";

// Declare the Schema of the Mongo model
var keyTokenSchema = new mongoose.Schema(
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
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
    Collection: COLLECTION_NAME,
  }
);

const removeKeyById = async (keyStore) => {
  try {
    const key = await KeyTokenModel.findByIdAndRemove(keyStore);
    return key;
  } catch (error) {
    throw error;
  }
};

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, keyTokenSchema);
