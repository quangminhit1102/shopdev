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
    Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
  );
};

/**
 * Flattens a nested object for MongoDB update operations.
 * @example
 * updateNestedObjectParser({ a: { b: 1 }, c: 2 }); // { 'a.b': 1, c: 2 }
 */
const updateNestedObjectParser = (obj) => {
  const result = {};
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === "object") {
      for (const subKey in obj[key]) {
        result[`${key}.${subKey}`] = obj[key][subKey];
      }
    } else {
      result[key] = obj[key];
    }
  }
  return result;
};

module.exports = {
  getObjectInformation,
  getSelectData,
  unGetSelectData,
  removeUndefinedOrNull,
  updateNestedObjectParser,
};
