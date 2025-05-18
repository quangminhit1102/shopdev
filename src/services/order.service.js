"use strict";

const { NotFoundError, BadRequestError } = require("../core/error.response");
const orderModel = require("../models/order.model");

class OrderService {
  /**
   * Get all orders by user ID
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array>} List of orders
   */
  static async getOrdersByUser(userId) {
    const orders = await orderModel
      .find({
        order_userId: userId,
      })
      .sort({ createdAt: -1 })
      .lean();

    return orders;
  }

  /**
   * Get one specific order by user ID and order ID
   * @param {string} userId - The ID of the user
   * @param {string} orderId - The ID of the order
   * @returns {Promise<Object>} The order details
   */
  static async getOneOrderByUser(userId, orderId) {
    const order = await orderModel
      .findOne({
        _id: orderId,
        order_userId: userId,
      })
      .lean();

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  /**
   * Cancel an order by user ID and order ID
   * Only orders in 'pending' state can be cancelled
   * @param {string} userId - The ID of the user
   * @param {string} orderId - The ID of the order
   * @returns {Promise<Object>} The cancelled order
   */
  static async cancelOrder(userId, orderId) {
    const order = await orderModel.findOne({
      _id: orderId,
      order_userId: userId,
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.order_status !== 'pending') {
      throw new BadRequestError('Order cannot be cancelled. Only pending orders can be cancelled.');
    }

    order.order_status = 'cancelled';
    order.order_trackingStatus = 'cancelled_by_user';
    order.cancellation_date = new Date();

    return await order.save();
  }

  /**
   * Update order by user ID and order ID
   * Limited updates are allowed based on order status
   * @param {string} userId - The ID of the user
   * @param {string} orderId - The ID of the order
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} The updated order
   */
  static async updateOrder(userId, orderId, updateData) {
    const order = await orderModel.findOne({
      _id: orderId,
      order_userId: userId,
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Only allow updates if order is in certain states
    const allowedStates = ['pending', 'confirmed'];
    if (!allowedStates.includes(order.order_status)) {
      throw new BadRequestError('Order cannot be updated in current status');
    }

    // Whitelist allowed update fields based on status
    const allowedUpdates = ['shipping_address', 'note'];
    const updates = {};

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedUpdates.includes(key)) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new BadRequestError('No valid update fields provided');
    }

    order.set(updates);
    order.modified_date = new Date();

    return await order.save();
  }
}

module.exports = OrderService;
