"use strict";

const DOCUMENT_NAME = "spu";
const COLLECTION_NAME = "spus";
const { Schema, model } = require("mongoose");

const spuSchema = new Schema(
  {
    product_id: { type: String, default: "" },
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
    // product_type: {
    //   type: String,
    //   required: true,
    //   enum: ["Electronics", "Clothing", "Furniture"],
    // },
    product_categories: {
      type: Array,
      required: true,
      default: [],
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
    /*
      {
        attribute_id: 12345, // style [Korea, summer, spring, fashion]
        attribute_value: 
        [
          {
            value_id: 123
          }
        ]
      }
    */
    product_variations: { type: Array, default: [] },
    /* 
    tier_variations: 
    [ 
      {
        name: 'color'
        options: ['red', 'green']
        images: [],
      },
      {
        [
          name: 'size'
          options: ['M', 'S', 'L', 'XL']
          images: [],
        ]
      }
    ]    
    */

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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

// Create a text index for full-text search for product_name and product_description
spuSchema.index({ product_name: "text", product_description: "text" });

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
spuSchema.pre("save", function (next) {
  // Check if the product_name field has been modified
  if (this.isModified("product_name")) {
    this.product_slug = slugify(this.product_name, {
      lower: true, // Convert to lower case
      strict: true, // Remove special characters
    });
  }
  next();
});

module.exports = model(DOCUMENT_NAME, spuSchema);
