"use strict";

const { unGetSelectData, getSelectData } = require("../../utils");

const findAllDiscountCodesUnselect = async ({
  limit = 10,
  sort = -1,
  page = 1,
  filter = {},
  unselect = [], // ensure this is an array
  model,
}) => {
  // Default fields to always unselect
  const defaultUnselectFields = [
    "discount_applies_to",
    "discount_product_ids",
    "discount_value",
    "discount_shopId",
    "discount_uses_count",
    "discount_users_used",
    "createdAt",
    "updatedAt",
  ];
  // Merge user-provided unselect fields with defaults
  const allUnselectFields = Array.isArray(unselect)
    ? [...unselect, ...defaultUnselectFields]
    : defaultUnselectFields;

  return await model
    .find(filter)
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ createdAt: sort })
    .select(unGetSelectData(allUnselectFields))
    .exec();
};

const findAllDiscountCodesSelect = async ({
  limit = 10,
  sort = -1,
  page = 1,
  filter = {},
  unselect = [],
  model,
}) => {
  return await model
    .find(filter)
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ createdAt: sort })
    .select(getSelectData(unselect))
    .exec();
};

module.exports = {
  findAllDiscountCodesUnselect,
  findAllDiscountCodesSelect,
};
