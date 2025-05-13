"use strict";

const { NotFoundError } = require("../core/error.response");
const DiscountService = require("../services/discount.service");

class CheckoutService {
  // only login user can checkout
  /*
        {
            cart_id,
            user_id,
            shop_order_ids: [
                {
                    shop_id,
                    shop_discount: [],
                    item_products: [
                        {
                            product_id,
                            product_name,
                            product_price,
                            product_quantity,
                            product_discount
                        }
                    ]
                },
                 {
                    shop_id,
                    shop_discount: [],
                    item_products: [
                        {
                            product_id,
                            product_name,
                            product_price,
                            product_quantity,
                            product_discount
                        }
                    ]
                }
            ]
        }    
    */

  static async checkoutReview({ cart_id, user_id, shop_order_ids }) {
    // Check cart exists
    const foundCart = await CartModel.findOne({
      _id: cart_id,
      user_id,
      cart_status: "active",
    });
    if (!foundCart) {
      throw new NotFoundError("Cart not found");
    }

    const checkout_order = {
        total_price: 0,
        total_discount: 0,
        fee_shipping: 0,
        total_checkout: 0,
      },
      shop_order_ids_new = [];

    // Calculate total price, discount, and checkout
    for (const shop_order of shop_order_ids) {
      const { shop_id, shop_discounts = [], item_products = [] } = shop_order;

      // Check products from cart from Database
      const foundProducts = await Promise.all(
        item_products.map((item) => {
          const foundProduct = ProductModel.findOne({
            _id: item.product_id,
          });
          if (foundProduct) {
            return {
              product_id: foundProduct._id,
              product_name: foundProduct.product_name,
              product_price: foundProduct.product_price,
              product_quantity: item.product_quantity,
              product_discount: item.product_discount,
            };
          }
        })
      );
      if (foundProducts.length === 0) {
        throw new NotFoundError("Product not found");
      }

      // Calculate total price
      const checkoutPrice = foundProducts.reduce((acc, product) => {
        return acc + product.product_price * product.product_quantity;
      }, 0);
      checkout_order.total_price += checkoutPrice;

      const itemCheckout = {
        shop_id,
        shop_discounts,
        price_raw: checkoutPrice,
        price_apply_discount: checkoutPrice,
        item_products: foundProducts,
      };

      if (shop_discount.length > 0) {
        const { totalPrice = 0, discount = 0 } =
          await DiscountService.getDiscountAmount({
            code: shop_discounts[0].code,
            shop_id,
            user_id,
            products: foundProducts,
          });

        checkout_order.total_discount += discount;
        itemCheckout.price_apply_discount += totalPrice;
      }

      // Calculate total checkout
      checkout_order.total_checkout += itemCheckout.price_apply_discount;
      shop_order_ids_new.push(itemCheckout);
    }

    return {
      shop_order_ids,
      shop_order_ids_new,
      checkout_order,
    };
  }
}

module.exports = CheckoutService;
