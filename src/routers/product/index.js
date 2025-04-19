"use strict";

const express = require("express");
const ProductController = require("../../controllers/product.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const router = express.Router();
const { authenticateV2 } = require("../../auth/authUtils");

// Authentication
router.use(authenticateV2);

router.post("/create", asyncHandler(ProductController.createProduct));

router.post(
  "/publish/:product_id",
  asyncHandler(ProductController.publishProduct)
);
router.post(
  "/unpublish/:product_id",
  asyncHandler(ProductController.unPublishProduct)
);

router.get(
  "/draft/all",
  asyncHandler(ProductController.findAllDraftProductsOfShop)
);

router.get(
  "/publish/all",
  asyncHandler(ProductController.findAllPublishedProductsOfShop)
);

router.get("/search", asyncHandler(ProductController.searchProducts));

module.exports = router;
