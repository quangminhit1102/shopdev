"use strict";

const { Types } = require("mongoose");
const orderModel = require("../order.model");

class OrderRepository {
  static async createOrder({
    userId,
    checkout,
    shipping,
    payment,
    products
  }) {
    return await orderModel.create({
      order_userId: userId,
      order_checkout: checkout,
      order_shipping: shipping,
      order_payment: payment,
      order_products: products,
      order_tracking_number: `ORDER-${Date.now()}-${userId.slice(-6)}`
    });
  }

  static async findOrderById(orderId) {
    return await orderModel
      .findById(orderId)
      .lean();
  }

  static async findOrderByUser(userId, {
    limit = 50,
    page = 1,
    sort = 'ctime',
    status = null
  }) {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { createdAt: -1 } : { modifiedAt: -1 };
    
    const query = { order_userId: userId };
    if (status) {
      query.order_status = status;
    }

    return await orderModel
      .find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  static async findOneOrderByUser(orderId, userId) {
    return await orderModel
      .findOne({
        _id: orderId,
        order_userId: userId
      })
      .lean();
  }

  static async updateOrderStatus({
    orderId,
    userId,
    status,
    trackingStatus,
    reason = null
  }) {
    const update = {
      order_status: status,
      order_trackingStatus: trackingStatus,
      modified_date: new Date()
    };

    if (reason) {
      update.cancellation_reason = reason;
      update.cancellation_date = new Date();
    }

    return await orderModel.findOneAndUpdate(
      {
        _id: orderId,
        order_userId: userId
      },
      update,
      { new: true }
    );
  }

  static async updateOrderShipping(orderId, userId, shippingData) {
    return await orderModel.findOneAndUpdate(
      {
        _id: orderId,
        order_userId: userId,
        order_status: 'pending'
      },
      {
        order_shipping: shippingData,
        modified_date: new Date()
      },
      { new: true }
    );
  }

  static async findOrdersByTimeRange(userId, {
    startDate,
    endDate,
    status = null
  }) {
    const query = {
      order_userId: userId,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (status) {
      query.order_status = status;
    }

    return await orderModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean();
  }
}

module.exports = OrderRepository;
