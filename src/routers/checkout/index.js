const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authenticateV2 } = require("../../auth/authUtils");
const CheckoutController = require("../../controllers/checkout.controller");
const router = express.Router();

// // Authentication middleware - required for all cart operations
// router.use(authenticateV2);

router.post("review", asyncHandler(CheckoutController.checkoutReview));

module.exports = router;
