"use strict";
const { model, Schema } = require("mongoose");
const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "Users";
const userSchema = new Schema(
  {
    user_slug: { type: String },
    user_name: { type: String, default: "*" },
    user_password: { type: String, default: "*" },
    user_salt: { type: String, default: "*" },
    user_email: { type: String, required: true },
    user_phone: { type: String, default: "*" },
    user_sex: { type: String, default: "*" },
    user_avatar: { type: String, default: "*" },
    user_date_of_birth: { type: Date, default: null },
    user_role: { type: String, default: "user" },
    user_status: {
      type: String,
      default: "pending",
      enum: ["pending", "active", "block"],
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);
module.exports = model(DOCUMENT_NAME, userSchema);
