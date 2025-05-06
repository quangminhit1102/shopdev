"use strict";
const mongoose = require("mongoose");
let DOCUMENT_NAME = "Cart";
let COLLECTION_NAME = "Carts";

// Declare the Schema of the Mongo model
const cartSchema = new mongoose.Schema(
  {
    cart_state: {
      type: String,
      required: true,
      enum: ["active", "completed", "failed", "pending"],
      default: "active",
    },
    cart_products: {
      type: Array,
      required: true,
      default: [],
    },
    /*
        [
            {
                productId: "productId",
                shopId: "shopId",
                quantity: 1,
                name: "product name",
                price: 100,
            }   
        ]
    */
    cart_count_product: {
      type: Number,
      required: true,
      default: 0,
    },
    cart_userId: {
      type: Number,
      required: true,
    },
  },
  {
    Collection: COLLECTION_NAME,
    timeseries: {
      createdAt: "createdOn", // createdOn is the field name for the creation date
      updatedAt: "modifiedOn", // modifiedOn is the field name for the last update date
    },
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, cartSchema);
