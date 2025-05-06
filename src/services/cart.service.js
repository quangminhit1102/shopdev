"use strict";

const cartModel = require("../models/cart.model");

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
  static async createUserCart({ user_id, product }) {
    const query = {
      cart_userId: user_id,
      cart_state: "active",
    };
    const updateOrInsert = {
      $addToSet: {
        cart_products: product,
      },
      $set: {
        cart_count_product: 1,
      },
    };
    const options = {
      upsert: true,
      new: true,
    };

    return await cartModel
      .findOneAndUpdate(query, updateOrInsert, options)
      .exec();
  }

  static async updateUserCart({ user_id, product }) {
    const query = {
      cart_userId: user_id,
      cart_state: "active",
    };
    const updateOrInsert = {
      $addToSet: {
        cart_products: product,
      },
      $set: {
        cart_count_product: 1,
      },
    };
    const options = {
      upsert: true,
      new: true,
    };

    return await cartModel
      .findOneAndUpdate(query, updateOrInsert, options)
      .exec();
  }

  static async addToCart({ user_id, product = {} }) {
    // Check if the user has a cart -> If not, create a new cart
    // Check if the product is already in the cart -> If yes, increase the quantity
    // If not, add the product to the cart
  }
}
