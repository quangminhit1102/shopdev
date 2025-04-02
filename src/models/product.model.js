"use strict";

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

const { Schema, model } = require("mongoose");

const ProductType = {
  ELECTRONICS: "Electronics",
  CLOTHING: "Clothing",
  FURNITURE: "Furniture",
};

const productSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_thumb: {
      type: String,
    },
    product_description: {
      type: String,
    },
    product_price: {
      type: Number,
      required: true,
    },
    product_quantity: {
      type: Number,
    },
    product_type: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Furniture"],
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

// Define the product types
// Clothing, Electronics, Furniture
const clothingSchema = new Schema({
  brand: {
    type: String,
  },
  size: {
    type: String,
  },
  material: {
    type: String,
  },
});

const electronicsSchema = new Schema({
  brand: {
    type: String,
  },
  model: {
    type: String,
  },
  warranty: {
    type: Number,
  },
});

const furnitureSchema = new Schema({
  brand: {
    type: String,
  },
  material: {
    type: String,
  },
  dimensions: {
    type: String,
  },
});

module.exports = {
  Product: model(DOCUMENT_NAME, productSchema),
  Clothing: model("Clothing", clothingSchema),
  Electronics: model("Electronics", electronicsSchema),
  Furniture: model("Furniture", furnitureSchema),
  ProductType,
};
