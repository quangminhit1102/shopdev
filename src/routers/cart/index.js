"use strict";

const express = require("express");
const cartController = require("../../controllers/cart.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticateV2 } = require("../../auth/authUtils");
const router = express.Router();

// Authentication middleware - required for all cart operations
router.use(authenticateV2);

/**
 * Cart API Endpoints
 * POST /  - Add product to cart
 * PUT /   - Update cart
 * DELETE /- Delete cart
 * GET /   - Get user's cart
 */

// Cart endpoints with async error handling
router.post("/", asyncHandler(cartController.addToCart));
router.put("/", asyncHandler(cartController.updateCart));
router.delete("/", asyncHandler(cartController.deleteCart));
router.get("/", asyncHandler(cartController.getCart));

module.exports = router;
