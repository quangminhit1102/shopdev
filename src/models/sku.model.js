"use strict";

const DOCUMENT_NAME = "sku";
const COLLECTION_NAME = "skus";
const { Schema, model, Types } = require("mongoose");

const skuSchema = new Schema(
  {
    sku_id: { type: String, required: true, unique: true }, // string "{spu_id}123456-{shop_id}"
    sku_tier_idx: {
      type: Array,
      default: [0, 0],
    },
    /*
      color = [red, green] = [0, 1]
      size = [S, M] = [0, 1]
    */
    sku_default: {
      type: Boolean,
      default: false,
    },
    sku_slug: {
      type: String,
      default: "",
    },
    // Whoever pays more gets to be on top
    sku_sort: {
      type: Number,
      default: 0,
    },
    sku_price: {
      type: String,
      required: true,
    },
    sku_stock: {
      type: Number,
      default: 0,
    },
    product_id: {
      type: String,
      required: true,
    },
    isDraft: {
      type: Boolean,
      default: true,
      index: true, // Create an index for faster queries
      select: false, // Do not include in queries by default
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true, // Create an index for faster queries
      select: false, // Do not include in queries by default
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

module.exports = model(DOCUMENT_NAME, skuSchema);
