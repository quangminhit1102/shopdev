/**
 * Product Service Layer - Factory & Strategy Patterns
 * Handles product creation, updating, publishing, and searching using extensible patterns.
 */
"use strict";

const {
  InternalServerError,
  NotFoundError,
  BadRequestError,
} = require("../core/error.response");
const {
  Product: ProductModel,
  Clothing: ClothingModel,
  Furniture: FurnitureModel,
  Electronics: ElectronicModel,
} = require("../models/product.model");
const { insertInventory } = require("../models/repositories/inventory.repo");
const productRepo = require("../models/repositories/product.repo");
const { removeUndefinedOrNull, updateNestedObjectParser } = require("../utils");

// Helper to get the correct model for a product type
function getModelByType(type) {
  switch (type) {
    case "CLOTHING":
      return ClothingModel;
    case "FURNITURE":
      return FurnitureModel;
    case "ELECTRONICS":
      return ElectronicModel;
    default:
      throw new BadRequestError("Invalid product type");
  }
}

/**
 * Base Product class for shared product logic.
 */
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  /**
   * Create a new product (generic)
   */
  async createProduct(product_data) {
    const newProduct = await ProductModel.create(product_data);
    if (newProduct) {
      // Add product stock inventory for the product
      await insertInventory({
        product_id: newProduct._id,
        shop_id: product_data.product_shop,
        stock: product_data.product_quantity,
      });
    }

    return newProduct;
  }

  // Get all products (with shop info)
  async getProducts() {
    return await ProductModel.find().populate("product_shop", "shop_name");
  }

  // Get product by ID (with shop info)
  async getProductById(id) {
    return await ProductModel.findById(id).populate(
      "product_shop",
      "shop_name"
    );
  }

  // Update product by ID
  async updateProduct(product_id, product_data) {
    return await productRepo.updateProductById({
      product_id,
      product_data,
      model: ProductModel,
    });
  }

  // Delete product by ID
  async deleteProduct(id) {
    return await ProductModel.findByIdAndDelete(id);
  }

  // Get all products by shop
  async getProductsByShop(shopId) {
    return await ProductModel.find({ product_shop: shopId }).populate(
      "product_shop",
      "shop_name"
    );
  }
}

/**
 * Clothing product logic.
 */
class Clothing extends Product {
  async createProduct() {
    const newClothing = await ClothingModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing)
      throw new InternalServerError("Failed to create clothing product");
    return super.createProduct({ ...this, _id: newClothing._id });
  }

  async updateProductById({ product_id }) {
    const product_data = removeUndefinedOrNull(this);
    if (product_data.product_attributes) {
      await productRepo.updateProductById({
        product_id,
        product_data: updateNestedObjectParser(product_data.product_attributes),
        model: ClothingModel,
      });
    }
    return super.updateProduct(
      product_id,
      updateNestedObjectParser(product_data)
    );
  }
}

/**
 * Furniture product logic.
 */
class Furniture extends Product {
  async createProduct() {
    const newFurniture = await FurnitureModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture)
      throw new InternalServerError("Failed to create furniture product");
    return super.createProduct({ ...this, _id: newFurniture._id });
  }
}

/**
 * Electronics product logic.
 */
class Electronic extends Product {
  async createProduct() {
    const newElectronics = await ElectronicModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronics)
      throw new InternalServerError("Failed to create electronics product");
    return super.createProduct({ ...this, _id: newElectronics._id });
  }
}

/**
 * Strategy Pattern for product operations.
 */
class ProductStrategy {
  static productRegistry = {};

  /**
   * Register a product type with its class.
   */
  static registerProductType(type, classRef) {
    ProductStrategy.productRegistry[type] = classRef;
  }

  /**
   * Create a product of a specific type.
   */
  static async createProduct(payload) {
    const { product_type } = payload;
    const ProductClass =
      ProductStrategy.productRegistry[product_type.toUpperCase()];
    if (!ProductClass) throw new BadRequestError("Invalid product type");
    return new ProductClass(payload).createProduct();
  }

  /**
   * Update a product of a specific type.
   */
  static async updateProduct(payload) {
    const { product_type } = payload;
    const ProductClass =
      ProductStrategy.productRegistry[product_type.toUpperCase()];
    if (!ProductClass) throw new BadRequestError("Invalid product type");
    return new ProductClass(payload).updateProductById(payload);
  }

  /**
   * Publish a product.
   */
  static publishProduct({ product_shop, product_id }) {
    return productRepo.publishProduct({ product_shop, product_id });
  }

  /**
   * Unpublish a product.
   */
  static unPublishProduct({ product_shop, product_id }) {
    return productRepo.unPublishProduct({ product_shop, product_id });
  }

  /**
   * Get all draft products of a shop (paginated).
   */
  static findAllDraftProductsOfShop({ product_shop, limit = 50, skip = 0 }) {
    return productRepo.findAllDraftProductsOfShop({
      query: { product_shop, isDraft: true },
      limit,
      skip,
    });
  }

  /**
   * Get all published products of a shop (paginated).
   */
  static findAllPublishedProductsOfShop({
    product_shop,
    limit = 50,
    skip = 0,
  }) {
    return productRepo.findAllPublishedProductsOfShop({
      query: { product_shop, isPublished: true },
      limit,
      skip,
    });
  }

  /**
   * Search products by keyword.
   */
  static searchProducts({ keySearch, limit = 50, skip = 0 }) {
    return productRepo.searchProducts({ keySearch, limit, skip });
  }

  /**
   * Get all products (paginated, filtered, selected fields).
   */
  static findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
    select = [
      "product_name",
      "product_thumb",
      "product_description",
      "product_price",
    ],
  }) {
    return productRepo.findAllProducts({ limit, sort, page, filter, select });
  }

  /**
   * Get product by ID.
   */
  static async findProductById({ product_id }) {
    const product = await productRepo.findProductById({
      product_id,
      unSelect: ["__v"],
    });
    if (!product) throw new NotFoundError("Product not found");
    return product;
  }
}

// Register product types
ProductStrategy.registerProductType("CLOTHING", Clothing);
ProductStrategy.registerProductType("FURNITURE", Furniture);
ProductStrategy.registerProductType("ELECTRONICS", Electronic);

module.exports = {
  Product,
  Clothing,
  Furniture,
  Electronic,
  ProductStrategy,
};
