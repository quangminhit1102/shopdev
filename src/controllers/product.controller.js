// ProductController handles all product-related HTTP requests.
// Each method corresponds to a specific product operation and delegates to ProductStrategy.

"use strict";

const { ProductStrategy } = require("../services/product.service");
const { CREATED, OK } = require("../core/success.response");

/**
 * Handles all product-related HTTP requests.
 * Each method delegates to ProductStrategy for business logic.
 */
class ProductController {
  /**
   * Create a new product for the current shop.
   * @route POST /shopdev/product
   * @param {Request} req
   * @param {Response} res
   */
  createProduct = async (req, res) => {
    new CREATED({
      message: "Product created successfully!",
      metadata: await ProductStrategy.createProduct({
        ...req.body,
        product_shop: req.user?._id,
      }),
    }).send(res);
  };

  /**
   * Publish a product by ID for the current shop.
   * @route PATCH /shopdev/product/:product_id/publish
   * @param {Request} req
   * @param {Response} res
   */
  publishProduct = async (req, res) => {
    new OK({
      message: "Product published successfully!",
      metadata: await ProductStrategy.publishProduct({
        product_shop: req.user?._id,
        product_id: req.params.product_id,
      }),
    }).send(res);
  };

  /**
   * Unpublish a product by ID for the current shop.
   * @route PATCH /shopdev/product/:product_id/unpublish
   * @param {Request} req
   * @param {Response} res
   */
  unPublishProduct = async (req, res) => {
    new OK({
      message: "Product unpublished successfully!",
      metadata: await ProductStrategy.unPublishProduct({
        product_shop: req.user?._id,
        product_id: req.params.product_id,
      }),
    }).send(res);
  };

  /**
   * Get all draft products for the current shop.
   * @route GET /shopdev/product/drafts
   * @param {Request} req
   * @param {Response} res
   */
  findAllDraftProductsOfShop = async (req, res) => {
    new OK({
      message: "Draft products retrieved successfully!",
      metadata: await ProductStrategy.findAllDraftProductsOfShop({
        product_shop: req.user?._id,
      }),
    }).send(res);
  };

  /**
   * Get all published products for the current shop.
   * @route GET /shopdev/product/published
   * @param {Request} req
   * @param {Response} res
   */
  findAllPublishedProductsOfShop = async (req, res) => {
    new OK({
      message: "Published products retrieved successfully!",
      metadata: await ProductStrategy.findAllPublishedProductsOfShop({
        product_shop: req.user?._id,
      }),
    }).send(res);
  };

  /**
   * Search products by keyword, with optional limit and skip for pagination.
   * @route GET /shopdev/product/search
   * @param {Request} req
   * @param {Response} res
   */
  searchProducts = async (req, res) => {
    new OK({
      message: "Products retrieved successfully!",
      metadata: await ProductStrategy.searchProducts({
        keySearch: req.query.keySearch,
        limit: req.query.limit,
        skip: req.query.skip,
      }),
    }).send(res);
  };

  /**
   * Get all products with pagination and sorting.
   * @route GET /shopdev/product
   * @param {Request} req
   * @param {Response} res
   */
  findAllProducts = async (req, res) => {
    new OK({
      message: "Products retrieved successfully!",
      metadata: await ProductStrategy.findAllProducts({
        limit: req.query.limit || 50,
        sort: req.query.sort || "ctime",
        page: req.query.page || 1,
      }),
    }).send(res);
  };

  /**
   * Get a product by its ID.
   * @route GET /shopdev/product/:product_id
   * @param {Request} req
   * @param {Response} res
   */
  findProductById = async (req, res) => {
    new OK({
      message: "Product retrieved successfully!",
      metadata: await ProductStrategy.findProductById({
        product_id: req.params.product_id,
      }),
    }).send(res);
  };

  /**
   * Update a product by its ID for the current shop.
   * @route PATCH /shopdev/product/:product_id
   * @param {Request} req
   * @param {Response} res
   */
  updateProduct = async (req, res) => {
    new OK({
      message: "Product updated successfully!",
      metadata: await ProductStrategy.updateProduct({
        ...req.body,
        product_id: req.params.product_id,
        product_shop: req.user?._id,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
