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
const { BadRequestError } = require("../core/error.response");

class AccessService {
  static async getAccess() {
    return "Hello world";
  }

  // Login a User
  static async login({ email, password }) {
    try {
      // Assuming credentials would be passed to login method
      // Replace this with actual user validation
      const userInfo = await shopModel.findOne({ email: email }).lean().exec();
      if (!userInfo) {
        return {
          code: 400,
          message: "Invalid email or password",
        };
      }

      // Compare password
      const match = await bcrypt.compare(password, userInfo.password);
      if (!match) {
        return {
          code: 400,
          message: "Invalid email or password",
        };
      }

      // Get private key from database
      const { publicKey, privateKey } = await keyTokenModel
        .findOne({ userId: userInfo._id })
        .lean()
        .exec();

      // Create token pair
      const { token, refreshToken } = await authUtils.createTokenPair(
        getObjectInformation(["_id", "email", "name"], userInfo),
        publicKey,
        privateKey
      );
      return {
        code: 200,
        message: "Login successful",
        token,
        refreshToken,
      };
    } catch (error) {
      return {
        code: 400,
        message: "Login failed",
        error: error.message,
      };
    }
  }

  // Register a new User
  static async register({ name, email, password }) {
    try {
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

        log(`publicKey: ${publicKey}`);
        log(`privateKey: ${privateKey}`);

        // Save public key to database
        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey,
        });
        if (!publicKeyString) {
          return {
            code: 500,
            message: "Failed to create public key",
          };
        }

        const { token, refreshToken } = await authUtils.createTokenPair(
          getObjectInformation(["_id", "email", "name"], newShop),
          publicKey,
          privateKey
        );

        log(`token: ${token}`);
        log(`refreshToken: ${refreshToken}`);

        // Send verification email
        // Implement email sending logic here

        return {
          code: 201,
          message:
            "Registration successful. Please check your email to verify account.",
          data: {
            shop: {
              _id: newShop._id,
              email: newShop.email,
              name: newShop.name,
              email: newShop.email,
            },
            token,
            refreshToken,
          },
        };
      } else {
        return {
          code: 500,
          message: "Registration failed",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Registration failed",
        statusCode: 500,
        errors: error.message,
      };
    }
  }
}

module.exports = AccessService;
