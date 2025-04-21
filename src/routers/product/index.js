"use strict";

const express = require("express");
const ProductController = require("../../controllers/product.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const router = express.Router();
const { authenticateV2 } = require("../../auth/authUtils");

router.get("/search", asyncHandler(ProductController.searchProducts));

router.get("/all", asyncHandler(ProductController.findAllProducts));

router.get("/:product_id", asyncHandler(ProductController.findProductById));

// Authentication
router.use(authenticateV2);

router.get(
  "/publish/all",
  asyncHandler(ProductController.findAllPublishedProductsOfShop)
);

router.post("/create", asyncHandler(ProductController.createProduct));

router.patch("/:product_id", asyncHandler(ProductController.updateProduct));

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

module.exports = router;
