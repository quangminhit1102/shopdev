// Example SPU and SKU data structure:
/*
{
  "product_id": "SPU1234567",
  "product_name": "Men's Summer T-Shirt",
  "product_thumb": "https://example.com/images/tshirt-thumb.jpg",
  "product_description": "A comfortable and stylish summer t-shirt for men.",
  "product_slug": "mens-summer-t-shirt",
  "product_price": 19.99,
  "product_quantity": 100,
  "product_categories": ["Clothing", "Men", "T-Shirts"],
  "product_shop": "60f7c2b8e1d2c8a1b4e8d123",
  "product_attributes": {
    "material": "Cotton",
    "brand": "FashionCo"
  },
  "product_variations": [
    {
      "name": "color",
      "options": ["red", "green", "blue"],
      "images": []
    },
    {
      "name": "size",
      "options": ["S", "M", "L", "XL"],
      "images": []
    }
  ],
  "product_ratingsAvg": 4.5,
  "isDraft": false,
  "isPublished": true,
  "isDeleted": false,
  "sku_list": [
    {
      "sku_id": "SPU1234567-RED-S",
      "sku_tier_idx": [0, 0],
      "sku_default": true,
      "sku_slug": "mens-summer-t-shirt-red-s",
      "sku_sort": 1,
      "sku_price": "19.99",
      "sku_stock": 25,
      "product_id": "SPU1234567",
      "isDraft": false,
      "isPublished": true,
      "isDeleted": false
    },
    {
      "sku_id": "SPU1234567-GREEN-M",
      "sku_tier_idx": [1, 1],
      "sku_default": false,
      "sku_slug": "mens-summer-t-shirt-green-m",
      "sku_sort": 2,
      "sku_price": "19.99",
      "sku_stock": 20,
      "product_id": "SPU1234567",
      "isDraft": false,
      "isPublished": true,
      "isDeleted": false
    },
    {
      "sku_id": "SPU1234567-BLUE-XL",
      "sku_tier_idx": [2, 3],
      "sku_default": false,
      "sku_slug": "mens-summer-t-shirt-blue-xl",
      "sku_sort": 3,
      "sku_price": "21.99",
      "sku_stock": 10,
      "product_id": "SPU1234567",
      "isDraft": false,
      "isPublished": true,
      "isDeleted": false
    }
  ]
}
*/

"use strict";

const shopModel = require("../models/shop.model");
const spuModel = require("../models/spu.model");
const skuModel = require("../models/sku.model");
const { NotFoundError } = require("../core/error.response");

const randomProductId = () => {
  return Math.floor(1000000 + Math.random() * 9000000); // 1000000 - 9999999
};

const newSPU = async ({
  product_id,
  product_name,
  product_thumb,
  product_description,
  product_price,
  product_quantity,
  product_type,
  product_shop,
  product_attributes,
  product_categories,
  product_variations,
  sku_list,
}) => {
  // 1. Check if Shop Exists
  const shop = await shopModel.findById(product_shop);
  if (!shop) {
    throw new NotFoundError("Shop not found");
  }

  // 2. Create new SPU
  const spu = await spuModel.create({
    product_id: product_id ?? randomProductId(),
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
    product_categories,
    product_variations,
    sku_list,
  });

  // 3. Get spu_id and add sku.service
  if (spu && sku_list.length > 0) {
    // 3. Create new SKU
    const skus = await Promise.all(
      sku_list.map(async (sku) => {
        return await skuModel.create({
          sku_id: `${spu.product_id}-${randomProductId()}`,
          sku_name: spu.product_name,
          product_id: spu.product_id,
          sku_tier_idx: sku.sku_tier_idx,
          sku_default: sku.sku_default,
          sku_slug: sku.sku_slug,
          sku_sort: sku.sku_sort,
          sku_price: sku.sku_price,
          sku_stock: sku.sku_stock,
          product_id: spu.product_id,
          isDraft: sku.isDraft,
          isPublished: sku.isPublished,
          isDeleted: sku.isDeleted,
        });
      })
    );
  }

  // The '!!spu' expression converts the value of 'spu' to a boolean.
  // If 'spu' is a truthy value (e.g., the SPU was created successfully), it returns true.
  // If 'spu' is a falsy value (e.g., creation failed and 'spu' is null or undefined), it returns false.
  return !!spu;
};

module.exports = {
  newSPU,
};
