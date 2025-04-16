"use strict";

const { error, log } = require("console");
const { findAPIKey } = require("../services/apiKey.service");
// const crypto = require("crypto");

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

const apiKey = async (req, res, next) => {
  try {
    
    // await apiKeyModel.create({
    //   Key: crypto.randomBytes(64).toString("hex"),
    //   type: "admin",
    //   permissions: ["read", "write", "delete"],
    // });

    // Get the API key from the headers
    let key = req.headers[HEADER.API_KEY];
    if (!key) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Check if the API key is valid
    const apiKey = await findAPIKey(key);
    if (!apiKey) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const permission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.objKey.permissions.includes(permission)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      console.log("Permission::", permission);
      const validPermission = req.objKey.permissions.includes(permission);
      if (!validPermission) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
};

module.exports = {
  apiKey,
  permission,
};
