"use strict";

const express = require("express");
const ProductController = require("../../controllers/product.controller");
const SKUController = require("../../controllers/sku.controller");

const { asyncHandler } = require("../../helpers/asyncHandler");
const router = express.Router();
const { authenticateV2 } = require("../../auth/authUtils");

//#region SKU
// Create SPU
router.post("/create-spu", asyncHandler(ProductController.createSPU));

// Get one SKU by product_id and sku_id
router.get("/sku", asyncHandler(SKUController.getSKU));

// Get all SKUs for a product
router.get("/skus", asyncHandler(SKUController.getSKUsByProductId));
//#endregion

//#region SPU
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
//#endregion

module.exports = router;
