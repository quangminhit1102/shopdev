'use strict";';

const { convertToObjectId } = require("../../utils");
const { InventoryModel } = require("../inventory.model");

const insertInventory = async ({
  product_id,
  shop_id,
  stock,
  location = "Unknown",
}) => {
  return await InventoryModel.create({
    inventory_product: product_id,
    inventory_shopId: shop_id,
    inventory_stock: stock,
    inventory_location: location,
  });
};

const reservationInventory = async ({ product_id, quantity, cart_id }) => {
  const query = {
      inventory_product: convertToObjectId(product_id),
      inventory_stock: { $gte: quantity },
    },
    updateSet = {
      $inc: { inventory_stock: -quantity },
      $push: {
        inventory_reservation: { cart_id, quantity, createOn: new Date() },
      },
    },
    options = {
      new: true,
      upsert: true,
    };

  return await InventoryModel.findOneAndUpdate(query, updateSet, options);
};

module.exports = {
  insertInventory,
  reservationInventory,
};
