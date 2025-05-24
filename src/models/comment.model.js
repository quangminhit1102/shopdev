"use strict";
const { required } = require("joi");
const mongoose = require("mongoose");
let DOCUMENT_NAME = "Comment";
let COLLECTION_NAME = "Comments";

// Declare the Schema of the Mongo model
const commentSchema = new mongoose.Schema(
  {
    comment_productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: true,
    },
    comment_userId: {
      type: Number,
      required: true,
      default: 1,
    },
    comment_content: {
      type: String,
      required: true,
      default: "No content",
    },
    comment_left: {
      type: Number,
      required: true,
      default: 0,
    },
    comment_right: {
      type: Number,
      required: true,
      default: 0,
    },
    comment_parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: DOCUMENT_NAME,
      default: null,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    Collection: COLLECTION_NAME,
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, commentSchema);
