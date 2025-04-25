"use strict";
const mongoose = require("mongoose");
let DOCUMENT_NAME = "Discount";
let COLLECTION_NAME = "Discounts";

// Declare the Schema of the Mongo model
const discountSchema = new mongoose.Schema(
  {
    discount_name: {
      type: String,
      required: true,
    },
    discount_description: {
      type: String,
      default: "No description",
    },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discount_value: {
      type: Number,
      required: true,
    },
    discount_code: {
      type: String,
      required: true,
    },
    discount_start_date: {
      type: Date,
      required: true,
    },
    discount_end_date: {
      type: Date,
      required: true,
    },
    // max number of times the discount can be used
    discount_max_uses: {
      type: Number,
      default: 0,
    },
    // number of times the discount has been used
    discount_uses_count: {
      type: Number,
      default: 0,
    },
    discount_users_used: {
      type: Array,
      default: [],
    },
    discount_shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
    discount_max_uses_per_user: {
      type: Number,
      default: 0,
    },
    discount_minimum_order_value: {
      type: Number,
      default: 0,
    },
    discount_is_active: {
      type: Boolean,
      default: true,
    },
    discount_applies_to: {
      type: String,
      enum: ["all", "specific"],
      default: "all",
    },
    discount_product_ids: {
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
module.exports = mongoose.model(DOCUMENT_NAME, discountSchema);
