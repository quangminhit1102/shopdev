"use strict";
const { model, Schema } = require("mongoose");
const DOCUMENT_NAME = "template";
const COLLECTION_NAME = "templates";
const templateSchema = new Schema(
  {
    template_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    template_name: {
      type: String,
      required: true,
      trim: true,
    },
    template_status: {
      type: String,
      default: "active",
      enum: ["active", "inactive", "archived"],
    },
    template_html: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);
module.exports = model(DOCUMENT_NAME, templateSchema);
