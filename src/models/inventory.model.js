"use strict";
const mongoose = require("mongoose");
let DOCUMENT_NAME = "Inventory";
let COLLECTION_NAME = "Inventories";

// Declare the Schema of the Mongo model
const inventorySchema = new mongoose.Schema(
  {
    inventory_product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    inventory_location: {
      type: String,
      default: "Unknown",
    },
    inventory_stock: {
      type: Number,
      required: true,
      min: [1, "Product quantity must be at least 1"],
      max: [1000, "Product quantity must be at most 1000"],
    },
    inventory_shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
    inventory_reservation: {
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
module.exports = {
  InventoryModel: mongoose.model(DOCUMENT_NAME, inventorySchema),
};
