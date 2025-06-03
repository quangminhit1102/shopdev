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

const getNotificationsByUser = async ({ userId, type = "ALL", isRead = 0 }) => {
  const match = {
    notification_receiverId: userId,
  };
  if (type !== "ALL") {
    match.notification_type = type;
  }

  if (isRead === 1) {
    match.notification_status = "read";
  } else if (isRead === 0) {
    match.notification_status = "unread";
  }

  const notifications = await Notification.aggregate([
    {
      $match: match,
    },
    {
      $sort: { createdAt: -1 }, // Sort by creation date, newest first
    },
    {
      $project: {
        _id: 1,
        notification_type: 1,
        notification_senderId: 1,
        notification_receiverId: 1,
        notification_content: {
          $concat: [
            {
              $substr: ["$notification_option.shop_name", 0, -1],
            },
            notification_content,
            {
              $substr: ["$notification_option.product_name", 0, -1],
            },
          ],
        },
        notification_status: 1,
        notification_options: 1,
        createdAt: 1,
      },
    },
  ]);
  return notifications;
};

module.exports = {
  pushNotification,
  NOTIFICATION_TYPES,
  getNotificationsByUser,
};
