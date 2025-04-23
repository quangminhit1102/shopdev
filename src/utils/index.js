"use strict";

const _ = require("lodash");

/**
 * Picks specified fields from an object.
 * @example
 * const obj = { a: 1, b: 2, c: 3 };
 * getObjectInformation(['a', 'c'], obj); // { a: 1, c: 3 }
 */
const getObjectInformation = (field = [], object = {}) => {
  return _.pick(object, field);
};

/**
 * Creates a projection object for MongoDB select fields (1 to include).
 * @example
 * getSelectData(['name', 'price']); // { name: 1, price: 1 }
 */
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

/**
 * Creates a projection object for MongoDB select fields (0 to exclude).
 * @example
 * unGetSelectData(['password', 'token']); // { password: 0, token: 0 }
 */
const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};

/**
 * Removes keys with undefined or null values from an object.
 * @example
 * removeUndefinedOrNull({ a: 1, b: undefined, c: null }); // { a: 1 }
 */
const removeUndefinedOrNull = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== undefined && value !== null
    )
  );
};

/**
 * Flattens a nested object for MongoDB update operations.
 * @example
 * updateNestedObjectParser({ a: { b: 1 }, c: 2 }); // { 'a.b': 1, c: 2 }
 */
const updateNestedObjectParser = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (typeof value === "object" && !Array.isArray(value)) {
      const nested = updateNestedObjectParser(value);
      for (const [nestedKey, nestedValue] of Object.entries(nested)) {
        acc[`${key}.${nestedKey}`] = nestedValue;
      }
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
};

module.exports = {
  getObjectInformation,
  getSelectData,
  unGetSelectData,
  removeUndefinedOrNull,
  updateNestedObjectParser,
};
