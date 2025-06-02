"use strict";

const Notification = require("../models/notification.model");

const NOTIFICATION_TYPES = {
  "ORDER-001": "Your order has been successfully placed.",
  "ORDER-002": "Your order has been shipped.",
  "PROMO-001": "Check out our new product promotion!",
  "SHOP-001": "A new product has been added to the shop.",
  DEFAULT: "You have a new notification.",
};

/**
 * Creates a new notification
 * @param {Object} params - Notification parameters
 * @param {string} params.type - Type of notification
 * @param {number} params.senderId - ID of sender
 * @param {number} params.receiverId - ID of receiver
 * @param {Object} params.options - Additional options
 * @returns {Promise<Object>} Created notification
 */
const pushNotification = async ({
  type = "SHOP-001",
  senderId = 1,
  receiverId = 1,
  options = {},
}) => {
  const notification_content =
    NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.DEFAULT;

  const notification = await Notification.create({
    notification_type: type,
    notification_senderId: senderId,
    notification_receiverId: receiverId,
    notification_content,
    notification_status: "unread",
    notification_options: options,
  });

  return notification;
};

module.exports = {
  pushNotification,
  NOTIFICATION_TYPES,
};
