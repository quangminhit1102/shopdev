"use strict";
const { createPublicKey } = require("crypto");
const JWT = require("jsonwebtoken");
const KeyTokenService = require("../services/keyToken.service");
const { AuthFailureError } = require("../core/error.response");
const { Network } = require("inspector/promises");
const { log } = require("console");
const { asyncHandler } = require("../helpers/asyncHandler");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESH_TOKEN: "x-refresh-token",
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

const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.headers[HEADER.AUTHORIZATION];
  const userId = req.headers[HEADER.CLIENT_ID];

  // authorization header not found
  if (!token) throw new AuthFailureError("Unauthorized");

  // find key by userId
  var key = await KeyTokenService.findKeyByUserIdAndToken(userId, token);
  if (!key) throw new AuthFailureError("Unauthorized");

  // verify token
  await JWT.verify(token, key.publicKey, (err, user) => {
    if (err) throw new AuthFailureError(err.message);
    req.keyStore = key;
    console.log("Decoded user:", user);
    next();
  });
});

const authenticateV2 = asyncHandler(async (req, res, next) => {
  // 1. check client id
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Unauthorized");

  // 2. find key by userId
  var keyStore = await KeyTokenService.findByUserId(userId);
  log("Key store:", keyStore);
  if (!keyStore) throw new AuthFailureError("Unauthorized");

  // 3. check refresh token
  const refreshToken = req.headers[HEADER.REFRESH_TOKEN];
  if (refreshToken) {
    try {
      const decoded = JWT.verify(refreshToken, keyStore.privateKey);
      if (decoded._id !== userId) {
        throw new AuthFailureError("Invalid refresh token");
      }
      req.keyStore = keyStore;
      req.user = decoded;
      req.refreshToken = refreshToken;
      return next();
    } catch (err) {
      throw new AuthFailureError("Invalid refresh token");
    }
  }

  // 4. check access token
  const token = req.headers[HEADER.AUTHORIZATION];
  if (!token) throw new AuthFailureError("Unauthorized");
  // verify token
  await JWT.verify(token, keyStore.publicKey, (err, user) => {
    if (err) throw new AuthFailureError(err.message);
    req.keyStore = keyStore;
    req.user = user;
    // console.log("Decoded user:", user);
    next();
  });
});

module.exports = { createTokenPair, authenticate, authenticateV2 };
