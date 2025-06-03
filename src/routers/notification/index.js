"use strict";

const express = require("express");
const NotificationController = require("../../controllers/notification.controller");
const asyncHandler = require("../helpers/asyncHandler");
const router = express.Router();

// GET /shopdev/notification - Get list of notifications for the current user
router.get("/", asyncHandler(NotificationController.getNotificationsByUser));

module.exports = router;
