"use strict";

const cartModel = require("../models/cart.model");
const productRepository = require("../models/repositories/product.repo");
const CartService = require("./cart.service");

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

  /*
  shop_order_ids: [
  {
    item_products: [
      {
        shop_id,
        product_id,
        quantity,
        old_quantity,
        price,
        product_id,
        product_name,
      },
    ],
  }]
  */
  static async addToCartV2({ user_id, product = {} }) {
    const { proudct_id, quantity, old_quantity } =
      shop_order_ids[0].item_products[0];

    // Check product in DB
    const foundProduct = await productRepository.findProductById({
      product_id: proudct_id,
    });
    if (!foundProduct) throw new Error("Product not found");

    if (quantity === 0) {
      // Remove product from cart
      const query = {
        cart_userId: user_id,
        cart_state: "active",
        "cart_products.productId": proudct_id,
      };
      const updateOrInsert = {
        $pull: {
          cart_products: { productId: proudct_id },
        },
      };
      const options = {
        upsert: true,
        new: true,
      };

      return await cartModels
        .findOneAndUpdate(query, updateOrInsert, options)
        .exec();
    }

    return await CartService.updateUserCart({
      user_id,
      product: {
        product_id: proudct_id,
        quantity: quantity - old_quantity,
        name: foundProduct.product_name,
        price: foundProduct.product_price,
      },
    });
  }

  static async deleteUserCart({ user_id, product_id }) {
    const query = {
      cart_userId: user_id,
      cart_state: "active",
      "cart_products.productId": product_id,
    };
    const updateOrInsert = {
      $pull: {
        cart_products: { productId: product_id },
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

  static async getUserCart({ user_id }) {
    const query = {
      cart_userId: user_id,
      cart_state: "active",
    };
    return await cartModel.findOne(query).exec();
  }
}

modele.exports = CartService;
