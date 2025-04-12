"use strict";
const shopModel = require("../models/shop.model");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const authUtils = require("../auth/authUtils");
const { log } = require("console");
const KeyTokenService = require("./keyToken.service");
const keyTokenModel = require("../models/keyToken.model");
const { getObjectInformation } = require("../utils");
const {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  ForbiddenError,
  AuthFailureError,
} = require("../core/error.response");
const { CREATED, OK } = require("../core/success.response");

class AccessService {
  static async getAccess() {
    return "Hello world";
  }

  // Login a User
  static async login({ email, password }) {
    // Find user by email
    const userInfo = await shopModel.findOne({ email: email }).lean().exec();
    if (!userInfo) {
      throw new BadRequestError("Invalid email or password");
    }

    // Compare password
    const match = await bcrypt.compare(password, userInfo.password);
    if (!match) {
      throw new BadRequestError("Invalid email or password");
    }

    // Create private key and public key for shop
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048, // Key size in bits
      publicKeyEncoding: {
        type: "spki", // Recommended format for public keys - Subject Public Key Info
        format: "pem", // PEM format (most common)
      },
      privateKeyEncoding: {
        type: "pkcs8", // Recommended format for private keys - Public-Key Cryptography Standards
        format: "pem", // PEM format (most common)
      },
    });

    // Create token pair
    const { token, refreshToken } = await authUtils.createTokenPair(
      getObjectInformation(["_id", "email", "name"], userInfo),
      publicKey,
      privateKey
    );

    // Save refresh token to database
    const publicKeyString = await KeyTokenService.createKeyToken({
      userId: userInfo._id,
      publicKey,
      privateKey,
      token,
      refreshToken,
    });
    if (!publicKeyString) {
      throw new InternalServerError("Failed to save public key");
    }

    return { token, refreshToken };
  }

  static async logout({ keyStore }) {
    const delKey = await KeyTokenService.removeKeyById(keyStore);
    return getObjectInformation(
      ["_id", "token", "refreshToken", "createdAt"],
      delKey
    );
  }

  static async refresh({ refreshToken }) {
    // 1. Find key by used refresh token => Prevent replay attack
    var foundKey = await KeyTokenService.findKeyByUsedRefreshToken(
      refreshToken
    );

    // 2. If keyStore found, verify refresh token => To check who is try to sabotage the system with refresh token
    if (foundKey) {
      const { _id: userId, email } = JWT.verify(
        refreshToken,
        foundKey.publicKey
      );
      log(`Refresh Token forbidden :: userId: ${userId}`);
      log(`Refresh Token forbidden :: email: ${email}`);

      // 3. If user found, delete all key from database => Attack detected
      await KeyTokenService.removeKeyByUserId(userId);
      throw new ForbiddenError("You are not allowed to use this refresh token");
    }

    // 4. Find key store by refresh token
    var keyStore = await KeyTokenService.findKeyByRefreshToken(refreshToken);
    if (!keyStore) {
      throw new AuthFailureError("Unauthorized");
    }

    // 5. Verify refresh token
    const { _id: userId, email } = JWT.verify(refreshToken, keyStore.publicKey);
    log(`Refresh Token :: userId: ${userId}`);
    log(`Refresh Token :: email: ${email}`);

    // 6. Find user by userId
    const userInfo = await shopModel.findById(userId).lean().exec();
    if (!userInfo) {
      throw new NotFoundError("User not found");
    }

    // 7. Create new tokens pair
    const tokens = await authUtils.createTokenPair(
      getObjectInformation(["_id", "email", "name"], userInfo),
      keyStore.publicKey,
      keyStore.privateKey
    );

    // 8. Save new refresh token to database
    await keyStore.updateOne({
      $set: { refreshToken: tokens.refreshToken },
      $set: { token: tokens.token },
      $addToSet: { refreshTokensUsed: refreshToken },
    });

    return {
      user: {
        _id: userInfo._id,
        email: userInfo.email,
        name: userInfo.name,
      },
      tokens,
    };
  }

  static async refreshV2({ keyStore, user, refreshToken }) {
    const { _id: userId, email } = user;

    // 1. Find key by used refresh token => Prevent replay attack => Delete all key from database
    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      log(`Refresh Token forbidden :: userId: ${userId}`);
      log(`Refresh Token forbidden :: email: ${email}`);
      await KeyTokenService.removeKeyByUserId(userId);
      throw new ForbiddenError("You are not allowed to use this refresh token");
    }

    // 2. Check refresh token is valid foundKey.refreshToken = refreshToken
    if (keyStore.refreshToken !== refreshToken) {
      log(`Refresh Token forbidden :: userId: ${userId}`);
      log(`Refresh Token forbidden :: email: ${email}`);
      throw new AuthFailureError("Invalid refresh token");
    }

    // 3. Find shop if not found => throw AuthFailureError
    const foundShop = await shopModel.findById(userId).lean().exec();
    if (!foundShop) throw new AuthFailureError("Shop not found");

    // 4. Create new tokens pair
    const tokens = await authUtils.createTokenPair(
      getObjectInformation(["_id", "email", "name"], foundShop),
      keyStore.publicKey,
      keyStore.privateKey
    );

    // 5. Update new refresh token to database
    // await keyStore.updateOne({
    //   $set: { refreshToken: tokens.refreshToken },
    //   $set: { token: tokens.token },
    //   $addToSet: { refreshTokensUsed: refreshToken },
    // });

    await keyTokenModel.updateOne(
      { _id: keyStore._id },
      {
        $set: {
          refreshToken: tokens.refreshToken,
          token: tokens.token,
        },
        $addToSet: { refreshTokensUsed: refreshToken },
      }
    );

    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      tokens,
    };
  }

  // Register a new User
  static async register({ name, email, password }) {
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    password = hashedPassword;

    // Email already exists
    const existingUser = await shopModel
      .findOne({ email })
      .lean() // .lean() to return a plain JavaScript object instead of a Mongoose document
      .exec(); // .exec() to execute the query and return a promise;
    if (existingUser) {
      throw new BadRequestError("Email already exists");
    }

    const newShop = await shopModel.create({
      name,
      email,
      password, // Should be hashed before storing
      verified: false,
    });
    if (newShop) {
      log(`New shop created: ${newShop}`);
      // Create private key and public key for shop
      /**
       * PEM format example for public key:
       * -----BEGIN PUBLIC KEY-----
       * MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1234567890...
       * -----END PUBLIC KEY-----
       *
       * PEM format example for private key:
       * -----BEGIN PRIVATE KEY-----
       * MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC1234567890...
       * -----END PRIVATE KEY-----
       */
      const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048, // Key size in bits
        publicKeyEncoding: {
          type: "spki", // Recommended format for public keys - Subject Public Key Info
          format: "pem", // PEM format (most common)
        },
        privateKeyEncoding: {
          type: "pkcs8", // Recommended format for private keys - Public-Key Cryptography Standards
          format: "pem", // PEM format (most common)
        },
      });

      // log(`publicKey: ${publicKey}`);
      // log(`privateKey: ${privateKey}`);

      // Create token pair
      const { token, refreshToken } = await authUtils.createTokenPair(
        getObjectInformation(["_id", "email", "name"], newShop),
        publicKey,
        privateKey
      );

      // Save key to database
      const publicKeyString = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
        token,
        refreshToken,
      });
      if (!publicKeyString) {
        throw new InternalServerError("Failed to save public key");
      }

      log(`token: ${token}`);
      log(`refreshToken: ${refreshToken}`);

      // Send verification email
      // Implement email sending logic here

      return {
        shop: {
          _id: newShop._id,
          email: newShop.email,
          name: newShop.name,
        },
        token,
        refreshToken,
      };
    } else {
      throw new InternalServerError("Failed to registration");
    }
  }
}

module.exports = AccessService;
