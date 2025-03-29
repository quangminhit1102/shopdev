"use strict";

const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      console.error("Error in asyncHandler:", error);
      next(error);
    });
  };
};

module.exports = { asyncHandler };
