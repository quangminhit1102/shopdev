"use strict";
const { createPublicKey } = require("crypto");
const JWT = require("jsonwebtoken");
const KeyTokenService = require("../services/keyToken.service");
const { NotFoundError, AuthFailureError } = require("../core/error.response");
const { Network } = require("inspector/promises");
const { log } = require("console");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  // Access token
  const token = JWT.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "2d",
  });

  // Refresh token
  const refreshToken = JWT.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn: "7d",
  });

  // JWT.verify(token, publicKey, (err, decoded) => {
  //   if (err) {
  //     console.error("Verification failed:", err.message);
  //   } else {
  //     console.log("Verified payload:", decoded);
  //   }
  // });

  return { token, refreshToken };
};

const authenticate =  async (req, res, next) => {
  const token = req.headers[HEADER.AUTHORIZATION];
  const userId = req.headers[HEADER.CLIENT_ID];

  // authorization header not found
  if (!token) throw new AuthFailureError("Unauthorized");

  // find key by userId
  var key = await KeyTokenService.findKeyByUserId(userId);
  if (!key) throw new NotFoundError("Key not found");

  try {
    const decoded = JWT.verify(token, key.publicKey, (err, user) => {
      if (err) throw new AuthFailureError("Unauthorized");
      req.user = user;
      next();
    });
  } catch (error) {
    throw new AuthFailureError("Unauthorized");
  }
};

module.exports = { createTokenPair, authenticate };
