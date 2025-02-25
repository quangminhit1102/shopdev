"use strict";

const mongoose = require("mongoose"); // Erase if already required
let DOCUMENT_NAME = "Shop";
let COLLECTION_NAME = "Shops";

// Declare the Schema of the Mongo model
var shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    verify: {
      type: mongoose.Schema.Types.Boolean,
      default: false,
    },
    // roles: {
    //   type: array,
    //   default: [],
    // },
  },
  {
    timestamps: true,
    Collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, shopSchema);
