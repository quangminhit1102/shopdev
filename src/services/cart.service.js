"use strict";

const cartModel = require("../models/cart.model");
const productRepository = require("../models/repositories/product.repo");

/* 
    Key features: Cart service
    - Add product to cart [User]
    - Reduce product quantity by one [User]
    - increase product quantity by one [User]
    - Get all products in cart [User]
    - Remove product from cart [User]
    - Clear cart [User]
*/

class CartService {
  /**
   * Create a new cart for the user or add a product to an existing cart.
   * If the product already exists in the cart, update its quantity.
   * @param {Object} param0 - { user_id, product }
   * @returns {Promise<Object>} - The updated or created cart document
   */
  static async createUserCart({ user_id, product }) {
    const { product_id, quantity: inputQuantity } = product;
    const quantity = Math.max(1, inputQuantity); // Ensure minimum quantity is 1

    // Validate product existence
    const foundProduct = await productRepository.findProductById({
      product_id,
    });
    if (!foundProduct) {
      throw new Error("Product not found");
    }

    const query = {
      cart_userId: user_id,
      cart_state: "active",
    };

    // Prepare product data
    const productData = {
      product_id,
      shop_id: foundProduct.product_shop,
      quantity,
      name: foundProduct.product_name,
      price: foundProduct.product_price,
    };

    // Check if cart exists and product is in cart
    const foundCart = await cartModel.findOne(query);
    const isProductInCart = foundCart?.cart_products?.some(
      (item) => item.product_id === product_id
    );

    // Update configuration
    const updateConfig = {
      query: { ...query },
      update: isProductInCart
        ? {
            $set: { "cart_products.$.quantity": quantity },
          }
        : {
            $push: { cart_products: productData },
          },
      options: { upsert: true, new: true },
    };

    // Add product filter if updating existing product
    if (isProductInCart) {
      updateConfig.query["cart_products.product_id"] = product_id;
    }

    // Execute update
    return await cartModel.findOneAndUpdate(
      updateConfig.query,
      updateConfig.update,
      updateConfig.options
    );
  }

  /**
   * Update the user's cart with new product details.
   * @param {Object} param0 - { user_id, products }
   * @returns {Promise<Object|Error>} - The updated cart or error if not found
   */
  static async updateUserCart({ user_id, products }) {
    // Find card and update if the product is already in the cart
    let foundCart = await cartModel.findOne({
      cart_userId: user_id,
      cart_state: "active",
    });
    if (!foundCart) {
      return NotFoundError("Cart not found");
    } else {
      products = foundCart.cart_products.map((product) => {
        if (product.product_id === products.product_id) {
          product.quantity = products.quantity;
          product.price = products.price;
          product.name = products.name;
        }
        return product;
      });
    }
  }

  /**
   * Add a product to the user's cart.
   * If the cart does not exist, create a new one.
   * @param {Object} param0 - { user_id, product }
   * @returns {Promise<Object>} - The updated or created cart document
   */
  static async addToCart({ user_id, product = {} }) {
    // Check if the user has a cart -> If not, create a new cart
    const cart = await cartModel.findOne({
      cart_userId: user_id,
      cart_state: "active",
    });
    if (!cart) {
      return await CartService.createUserCart({ user_id, product });
    }
    // Check if the product is already in the cart -> If yes, increase the quantity
    // If not, add the product to the cart
    // If the product is already in the cart, increase the quantity
    if (!cart.cart_products.length) {
      cart.cart_products.push(product);
      return await cart.save();
    }

    return await CartService.updateUserCart({ user_id, product });
  }

  /**
   * Add products to the cart using the V2 structure (shop_order_ids).
   * Handles both adding new products and updating quantities.
   * @param {Object} param0 - { user_id, shop_order_ids }
   * @returns {Promise<Object>} - The updated cart document
   */
  static async addToCartV2({ user_id, shop_order_ids }) {
    const product = shop_order_ids[0].item_products[0];
    let { product_id, quantity = 1, old_quantity = 1 } = product;
    quantity = Math.max(1, quantity); // Ensure minimum quantity is 1
    old_quantity = Math.max(1, old_quantity); // Ensure minimum quantity is 1

    // Check product in DB
    const foundProduct = await productRepository.findProductById({
      product_id: product_id,
    });
    if (!foundProduct) throw new Error("Product not found");

    // Check if the user has a cart -> If not, create a new cart
    const cart = await cartModel.findOne({
      cart_userId: user_id,
      cart_state: "active",
    });
    if (!cart) {
      return await CartService.createUserCart({ user_id, product: product });
    }

    // Check if the product is already in the cart
    // -> If yes, increase the quantity
    // -> If not, add the product to the cart
    const foundProductInCart = cart.cart_products.find(
      (item) => item.product_id === product_id
    );
    // Increase the quantity
    if (foundProductInCart) {
      foundProductInCart.quantity = quantity;
      return await cart.save();
    }
    // Add the product to the cart
    cart.cart_products.push({
      product_id: product_id,
      quantity: quantity,
      name: foundProduct.product_name,
      price: foundProduct.product_price,
      old_quantity: old_quantity,
      product_shop: foundProduct.product_shop,
    });
    return await cart.save();
  }

  /**
   * Delete a product from the user's cart or clear the entire cart.
   * If product_id is provided, remove only that product.
   * Otherwise, remove the entire cart.
   * @param {Object} param0 - { user_id, product_id }
   * @returns {Promise<Object>} - The updated cart or result of cart deletion
   */
  static async deleteCart({ user_id, product_id }) {
    const query = {
      cart_userId: user_id,
      cart_state: "active",
    };
    if (product_id) {
      // Remove a single product from the cart
      const updatedCart = await cartModel.findOneAndUpdate(
        query,
        {
          $pull: { cart_products: { product_id } },
        },
        { new: true }
      );
      return updatedCart;
    }
    // Remove the entire cart
    return await cartModel.findOneAndDelete(query).exec();
  }

  /**
   * Get the user's active cart and calculate the total price.
   * @param {Object} param0 - { user_id }
   * @returns {Promise<Object|null>} - The cart with total price or null if not found
   */
  static async getCart({ user_id }) {
    const query = {
      cart_userId: user_id,
      cart_state: "active",
    };
    const cart = await cartModel.findOne(query).lean();
    if (!cart) return null;
    // Calculate total price
    cart.total_price = (cart.cart_products || []).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return cart;
  }
}

module.exports = CartService;
