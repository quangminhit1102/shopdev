"use strict";
const { required } = require("joi");
const mongoose = require("mongoose");
let DOCUMENT_NAME = "notification";
let COLLECTION_NAME = "notifications";

// Notification types example
// ORDER-001: Order successfully
// ORDER-002: Order shipped
// ORDER-003: Order delivered
// PROMO-001: New product promotion
// SHOP-001: New product added

// Declare the Schema of the Mongo model
const notificationSchema = new mongoose.Schema(
  {
    notification_type: {
      type: String,
      required: true,
      enum: ["ORDER-001", "ORDER-002", "PROMO-001", "SHOP-001"], // Example types
    },
    notification_senderId: {
      type: Number,
      required: true,
    },
    notification_receiverId: {
      type: Number,
      required: true,
    },
    notification_content: {
      type: String,
      required: true,
    },
    notification_status: {
      type: String,
      required: true,
      enum: ["unread", "read"], // Example statuses
      default: "unread",
    },
    notification_options: {
      type: Object,
      default: {}, // Additional options can be stored as an object
    },
  },
  {
    Collection: COLLECTION_NAME,
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, notificationSchema);
