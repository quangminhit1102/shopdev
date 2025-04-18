"use strict";

const express = require("express");
const AccessController = require("../../controllers/product.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const router = express.Router();
const { authenticateV2 } = require("../../auth/authUtils");

// Authentication
router.use(authenticateV2);

router.post("/create", asyncHandler(AccessController.createProduct));

router.post("/publish", asyncHandler(AccessController.publishProduct));
router.post("/unpublish", asyncHandler(AccessController.unPublishProduct));

router.get(
  "/draft/all",
  asyncHandler(AccessController.findAllDraftProductsOfShop)
);

router.get(
  "/publish/all",
  asyncHandler(AccessController.findAllPublishedProductsOfShop)
);

module.exports = router;
