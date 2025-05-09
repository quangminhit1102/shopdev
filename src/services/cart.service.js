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
    const { productId, quantity } = product;
    const query = {
      cart_userId: user_id,
      cart_state: "active",
      "cart_products.productId": productId,
    };
    const updateOrInsert = {
      $inc: {
        "cart_products.$[product].quantity": quantity,
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
    const cart = await cartModel.findOne({
      cart_userId: user_id,
      cart_state: "active",
    });
    if (!cart) {
      return await this.createUserCart({ user_id, product });
    }
    // Check if the product is already in the cart -> If yes, increase the quantity
    // If not, add the product to the cart
    const productInCart = cart.cart_products.find(
      (item) => item.productId === product.productId
    );
    if (productInCart) {
      return await this.updateUserCart({ user_id, product });
    } else {
      // If the product is not in the cart, add it to the cart
      const updatedCart = await cartModel.findOneAndUpdate(
        { cart_userId: user_id, cart_state: "active" },
        {
          $addToSet: { cart_products: product },
          $inc: { cart_count_product: 1 },
        },
        { new: true }
      );
      return updatedCart;
    }
  }
}
