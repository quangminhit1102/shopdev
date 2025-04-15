"use strict";

/**
 * @description This function is a middleware that wraps an async function and handles errors.
 * @param {Function} fn - The async function to be wrapped.
 * @returns {Function} - A middleware function that handles errors.
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      console.error("Error in asyncHandler:", error);
      next(error);
    });
  };
};

module.exports = { asyncHandler };
