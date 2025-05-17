"use strict";

const express = require("express");
const orderController = require("../../controllers/order.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticateV2 } = require("../../auth/authUtils");
const router = express.Router();

// Authentication required for all order routes
router.use(authenticateV2);

// Order endpoints
router.get("/", asyncHandler(orderController.getOrdersByUser));
router.get("/:id", asyncHandler(orderController.getOneOrderByUser));
router.post("/:id/cancel", asyncHandler(orderController.cancelOrder));
router.patch("/:id", asyncHandler(orderController.updateOrder));

module.exports = router;
