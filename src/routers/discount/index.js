"use strict";

const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticateV2 } = require("../../auth/authUtils");
const discountController = require("../../controllers/discount.controller");

// Authentication required for all routes
router.use(authenticateV2);

// Routes
router.post("", asyncHandler(discountController.createDiscount));
router.get(
  "/:code/products",
  asyncHandler(discountController.getAllProductsByDiscountCode)
);
router.get("/shop", asyncHandler(discountController.getAllDiscountsByShop));
router.post("/verify", asyncHandler(discountController.verifyDiscountCode));
router.delete("/:code", asyncHandler(discountController.deleteDiscountCode));
router.post("/cancel", asyncHandler(discountController.cancelDiscountCode));

module.exports = router;
