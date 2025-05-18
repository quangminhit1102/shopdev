"use strict";
const mongoose = require("mongoose");
let DOCUMENT_NAME = "Order";
let COLLECTION_NAME = "Orders";

// Order status enum
const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned'
};

// Tracking status enum
const TRACKING_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED_BY_USER: 'cancelled_by_user',
  CANCELLED_BY_SHOP: 'cancelled_by_shop',
  RETURNED: 'returned'
};

// Declare the Schema of the Mongo model
const orderSchema = new mongoose.Schema(
  {
    order_userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
    order_checkout: {
      total_price: { type: Number, required: true },
      total_applied_discount: { type: Number, default: 0 },
      shipping_fee: { type: Number, default: 0 },
    },
    order_shipping: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postal_code: { type: String },
      phone: { type: String, required: true },
    },
    order_payment: {
      payment_method: { 
        type: String, 
        required: true,
        enum: ['credit_card', 'debit_card', 'cod', 'paypal']
      },
      payment_status: { 
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
      },
      payment_date: { type: Date }
    },
    order_products: {
      type: [{
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        old_price: { type: Number },
        product_name: { type: String, required: true }
      }],
      required: true,
      _id: false
    },    order_tracking_number: {
      type: String
    },
    order_status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING
    },
    order_trackingStatus: {
      type: String,
      enum: Object.values(TRACKING_STATUS),
      default: TRACKING_STATUS.PENDING
    },
    order_note: { type: String },
    cancellation_reason: { type: String },
    cancellation_date: { type: Date },
    modified_date: { type: Date },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

// Indexes
orderSchema.index({ order_userId: 1, createdAt: -1 });
orderSchema.index({ order_tracking_number: 1 }, { unique: true, sparse: true });

// Static constants
orderSchema.statics.ORDER_STATUS = ORDER_STATUS;
orderSchema.statics.TRACKING_STATUS = TRACKING_STATUS;

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, orderSchema);
