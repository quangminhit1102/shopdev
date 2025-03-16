"use strict";
const { createPublicKey } = require("crypto");
const JWT = require("jsonwebtoken");

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

module.exports = { createTokenPair };
