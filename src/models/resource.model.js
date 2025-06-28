"use strict";
const { model, Schema } = require("mongoose");
const DOCUMENT_NAME = "Resource";
const COLLECTION_NAME = "Resources";
const userSchema = new Schema(
  {
    src_name: { type: String, required: true }, // Resource name
    src_slug: { type: String, required: true }, // Resource slug
    src_description: { type: String, default: "" }, // Resource description
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);
module.exports = model(DOCUMENT_NAME, userSchema);
