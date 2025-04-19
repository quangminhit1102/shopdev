"use strict";

const { find } = require("lodash");
const { InternalServerError } = require("../core/error.response");
const {
  Product: ProductModel,
  Clothing: ClothingModel,
  Furniture: FurnitureModel,
  Electronics: ElectronicModel,
} = require("../models/product.model");

const {
  publishProduct,
  findAllDraftProductsOfShop,
  findAllPublishedProductsOfShop,
  unPublishProduct,
  searchProducts,
} = require("../models/repositories/product.repo");

// -------------------------------------------------------
// Factory Pattern for Product Creation
// -------------------------------------------------------
class ProductFactory {
  static createProduct(productData) {
    const { product_type, ...rest } = productData;
    switch (product_type.toUpperCase()) {
      case "CLOTHING":
        return new Clothing(productData).createProduct();
      case "FURNITURE":
        return new Furniture(productData).createProduct();
      case "ELECTRONICS":
        return new Electronic(productData).createProduct();
      default:
        throw new Error("Invalid product type");
    }
  }
}

/*
product_name: { type: String, required: true J,
product_thumb: ( type: String, required: true 3,
product_description: String,
product price: ( type: Number, required: true },
product_quantity: ( type: Number, required: true ),
product_type: ( type: String, required: true, enum: ['Electronics', 'Clothing', 'Furniture' ] 3,
product_shop: ( type: Schema. Types.ObjectId, ref: 'Shop' ),
product_attributes: ( type: Schema. Types.Mixed, required: true }
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

  // Create a new product
  static async createProduct(productData) {
    return await ProductModel.create(productData);
  }

  static async getProducts() {
    return await ProductModel.find().populate("product_shop", "shop_name");
  }

  static async getProductById(id) {
    return await ProductModel.findById(id).populate(
      "product_shop",
      "shop_name"
    );
  }

  static async updateProduct(id, productData) {
    return await ProductModel.findByIdAndUpdate(id, productData, { new: true });
  }

  static async deleteProduct(id) {
    return await ProductModel.findByIdAndDelete(id);
  }
  static async getProductsByShop(shopId) {
    return await ProductModel.find({ product_shop: shopId }).populate(
      "product_shop",
      "shop_name"
    );
  }
}

// Create a new product of type Clothing
class Clothing extends Product {
  constructor(productData) {
    super(productData);
  }

  async createProduct() {
    const newClothing = await ClothingModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing)
      throw new InternalServerError("Failed to create clothing product");

    // Create the product with the clothing ID
    const newProduct = await ProductModel.create({
      ...this,
      _id: newClothing._id,
    });
    return newProduct;
  }
}

// Create a new product of type Furniture
class Furniture extends Product {
  async createProduct() {
    const newFurniture = await FurnitureModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture)
      throw new InternalServerError("Failed to create furniture product");

    // Create the product with the furniture ID
    const newProduct = await ProductModel.create({
      ...this,
      _id: newFurniture._id,
    });
    return newProduct;
  }
}

// Create a new product of type Electronics
class Electronic extends Product {
  async createProduct() {
    const newElectronics = await ElectronicModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronics)
      throw new InternalServerError("Failed to create electronics product");

    // Create the product with the electronics ID
    const newProduct = await ProductModel.create({
      ...this,
      _id: newElectronics._id,
    });
    return newProduct;
  }
}

// -------------------------------------------------------
// Strategy Pattern for Product Creation
// -------------------------------------------------------
class ProductStrategy {
  // This is a placeholder for the strategy pattern
  static productRegistry = {};

  // This method allows you to register different product types
  static registerProductType(type, classRef) {
    ProductStrategy.productRegistry[type] = classRef;
  }

  // This method allows you to create a product of a specific type
  static async createProduct(payload) {
    const { product_type } = payload;
    const ProductClass =
      ProductStrategy.productRegistry[product_type.toUpperCase()];
    if (!ProductClass) {
      throw new BadRequestError("Invalid product type");
    }

    return new ProductClass(payload).createProduct();
  }

  //// PUT
  // publish a product
  static async publishProduct({ product_shop, product_id }) {
    return await publishProduct({ product_shop, product_id });
  }

  // unpublish a product
  static async unPublishProduct({ product_shop, product_id }) {
    return await unPublishProduct({ product_shop, product_id });
  }
  //// End PUT

  //// Query
  // Get all products of a shop with pagination
  static async findAllDraftProductsOfShop({
    product_shop,
    limit = 50,
    skip = 0,
  }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftProductsOfShop({
      query,
      limit,
      skip,
    });
  }

  // Get all published products of a shop with pagination
  static async findAllPublishedProductsOfShop({
    product_shop,
    limit = 50,
    skip = 0,
  }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishedProductsOfShop({
      query,
      limit,
      skip,
    });
  }

  static async searchProducts({ keySearch, limit = 50, skip = 0 }) {
    return await searchProducts({
      keySearch: keySearch,
      limit,
      skip,
    });
  }

  //// End Query
}

// Register product types with their respective classes
ProductStrategy.registerProductType("CLOTHING", Clothing);
ProductStrategy.registerProductType("FURNITURE", Furniture);
ProductStrategy.registerProductType("ELECTRONICS", Electronic);

// Export the classes and the factory
module.exports = {
  ProductFactory,
  Product,
  Clothing,
  Furniture,
  Electronic,
  ProductStrategy,
};
