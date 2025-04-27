'use strict";';

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

module.exports = {
  insertInventory,
};
