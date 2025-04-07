"use strict";

const { InternalServerError } = require("../core/error.response");
const {
  Product,
  Clothing,
  Furniture,
  Electronics,
} = require("../models/product.model");

class ProductFactory {
  static createProduct(productData) {
    const { product_type, ...rest } = productData;
    switch (product_type.toUpperCase()) {
      case "CLOTHING":
        return new ClothingService(productData).createProduct();
      case "FURNITURE":
        return new FurnitureService(productData).createProduct();
      case "ELECTRONICS":
        return new ElectronicsService(productData).createProduct();
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
class ProductService {
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
    return await Product.create(productData);
  }

  static async getProducts() {
    return await Product.find().populate("product_shop", "shop_name");
  }

  static async getProductById(id) {
    return await Product.findById(id).populate("product_shop", "shop_name");
  }

  static async updateProduct(id, productData) {
    return await Product.findByIdAndUpdate(id, productData, { new: true });
  }

  static async deleteProduct(id) {
    return await Product.findByIdAndDelete(id);
  }
  static async getProductsByShop(shopId) {
    return await Product.find({ product_shop: shopId }).populate(
      "product_shop",
      "shop_name"
    );
  }
}

class ClothingService extends ProductService {
  constructor(productData) {
    super(productData);
  }

  async createProduct() {
    const newClothing = await Clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing)
      throw new InternalServerError("Failed to create clothing product");

    // Create the product with the clothing ID
    const newProduct = await Product.create({
      ...this,
      _id: newClothing._id,
    });
    return newProduct;
  }
}

class FurnitureService extends ProductService {
  async createProduct() {
    const newFurniture = await Furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture)
      throw new InternalServerError("Failed to create furniture product");

    // Create the product with the furniture ID
    const newProduct = await Product.create({
      ...this,
      _id: newFurniture._id,
    });
    return newProduct;
  }
}

class ElectronicsService extends ProductService {
  async createProduct() {
    const newElectronics = await Electronics.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronics)
      throw new InternalServerError("Failed to create electronics product");

    // Create the product with the electronics ID
    const newProduct = await Product.create({
      ...this,
      _id: newElectronics._id,
    });
    return newProduct;
  }
}

module.exports = {
  ProductFactory,
  ProductService,
  ClothingService,
  FurnitureService,
  ElectronicsService,
};
