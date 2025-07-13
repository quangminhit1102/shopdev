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

// Create Product
router.post("/create", asyncHandler(ProductController.createProduct));

// Create SPU
router.post("/create-spu", asyncHandler(ProductController.createSPU));

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
