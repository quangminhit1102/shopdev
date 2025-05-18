// ProductController handles all product-related HTTP requests.
// Each method corresponds to a specific product operation and delegates to ProductStrategy.

"use strict";

const { ProductStrategy } = require("../services/product.service");
const { CREATED, OK } = require("../core/success.response");

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - thumb
 *         - description
 *         - price
 *         - quantity
 *         - type
 *       properties:
 *         name:
 *           type: string
 *         thumb:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         quantity:
 *           type: number
 *         type:
 *           type: string
 *           enum: [Electronics, Clothing, Food]
 *         shop:
 *           type: string
 *         attributes:
 *           type: object
 *         rating:
 *           type: number
 *         variations:
 *           type: array
 *           items:
 *             type: object
 */

/**
 * Handles all product-related HTTP requests.
 * Each method delegates to ProductStrategy for business logic.
 */
class ProductController {
  /**
   * @swagger
   * /shopdev/product/create:
   *   post:
   *     summary: Create a new product
   *     tags: [Products]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Product'
   *     responses:
   *       201:
   *         description: Product created successfully
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
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
   * @swagger
   * /shopdev/product/publish/{product_id}:
   *   post:
   *     summary: Publish a product
   *     tags: [Products]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: product_id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Product published successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Product not found
   *       500:
   *         description: Server error
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
   * @swagger
   * /shopdev/product/unpublish/{product_id}:
   *   post:
   *     summary: Unpublish a product
   *     tags: [Products]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: product_id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Product unpublished successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Product not found
   *       500:
   *         description: Server error
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
   * @swagger
   * /shopdev/product/draft/all:
   *   get:
   *     summary: Get all draft products
   *     tags: [Products]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Draft products retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 metadata:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Product'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
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
   * @swagger
   * /shopdev/product/publish/all:
   *   get:
   *     summary: Get all published products
   *     tags: [Products]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Published products retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 metadata:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Product'
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Server error
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
   * @swagger
   * /shopdev/product/search:
   *   get:
   *     summary: Search for products
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: keyword
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Products found successfully
   *       500:
   *         description: Server error
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
   * @swagger
   * /shopdev/product/all:
   *   get:
   *     summary: Get all products
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Products retrieved successfully
   *       500:
   *         description: Server error
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
   * @swagger
   * /shopdev/product/{product_id}:
   *   get:
   *     summary: Get a product by ID
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: product_id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Product retrieved successfully
   *       404:
   *         description: Product not found
   *       500:
   *         description: Server error
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
   * @swagger
   * /shopdev/product/{product_id}:
   *   patch:
   *     summary: Update a product
   *     tags: [Products]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: path
   *         name: product_id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Product'
   *     responses:
   *       200:
   *         description: Product updated successfully
   *       400:
   *         description: Invalid input
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Product not found
   *       500:
   *         description: Server error
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
