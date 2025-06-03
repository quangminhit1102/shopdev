"use strict";

const NotificationService = require("../services/notification.service");
const { OK } = require("../core/success.response");

/**
 * NotificationController handles HTTP requests related to notifications.
 */
class NotificationController {
  /**
   * Get a list of notifications for the current user.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  static async getNotificationsByUser(req, res) {
    // Assumes req.user._id is set by authentication middleware
    const notifications = await NotificationService.getNotificationsByUser({
      user_id: req.user._id,
      ...req.query,
    });
    new OK({
      message: "Get notifications successfully",
      metadata: notifications,
    }).send(res);
  }
}

module.exports = NotificationController;
