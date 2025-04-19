"use strict";

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

const { set } = require("lodash");
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
    product_slug: {
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
    // product_ratings
    product_ratingsAvg: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"],
      set: (value) => {
        return Math.round(value * 10) / 10; // Round to one decimal place
      },
    },
    product_variations: { type: Array, default: [] },
    // draft and published
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
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

// Add a slug before saving the product
// productSchema.pre("save", function (next) {
//   if (this.isModified("product_name")) {
//     this.product_slug = this.product_name.toLowerCase().replace(/ /g, "-");
//   }
//   next();
// });

// using slugify to create a slug from the product name
const slugify = require("slugify");
// Add a slug before saving the product
productSchema.pre("save", function (next) {
  // Check if the product_name field has been modified
  if (this.isModified("product_name")) {
    this.product_slug = slugify(this.product_name, {
      lower: true, // Convert to lower case
      strict: true, // Remove special characters
    });
  }
  next();
});

// Define the product types
// Clothing, Electronics, Furniture
const clothingSchema = new Schema({
  brand: {
    required: true,
    type: String,
  },
  size: {
    required: true,
    type: String,
  },
  material: {
    required: true,
    type: String,
  },
});

const electronicsSchema = new Schema({
  brand: {
    required: true,
    type: String,
  },
  model: {
    required: true,
    type: String,
  },
  warranty: {
    required: true,
    type: Number,
  },
});

const furnitureSchema = new Schema({
  brand: {
    required: true,
    type: String,
  },
  material: {
    required: true,
    type: String,
  },
  dimensions: {
    required: true,
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
