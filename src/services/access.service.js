"use strict";
const shopModel = require("../models/shop.model");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const authUtils = require("../auth/authUtils");

class AccessService {
  static async getAccess() {
    let a = shopModel.findOne();
    console.log(a);
    return "Hello world";
  }

  static async login() {
    try {
      const secretKey = process.env.JWT_SECRET || "your-secret-key";

      // Assuming credentials would be passed to login method
      // Replace this with actual user validation
      const userInfo = { userId: 1, email: "test@example.com" };

      const token = await JWT.sign(userInfo, secretKey, {
        expiresIn: "2d",
      });

      return {
        code: 200,
        message: "Login successful",
        token,
      };
    } catch (error) {
      return {
        code: 400,
        message: "Login failed",
        error: error.message,
      };
    }
  }

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
        return {
          code: 400,
          message: "Email already exists",
        };
      }

      const newShop = await shopModel.create({
        name,
        email,
        password, // Should be hashed before storing
        verified: false,
      });

      if (newShop) {
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
            type: "pkcs8", // Recommended format for private keys - Private-Key Information Syntax Standard
            format: "pem", // PEM format (most common)
            cipher: "rsa256", // Optional: encrypt the private key
            passphrase: "your-secure-passphrase", // Optional: use a passphrase adds extra encryption to the private key
          },
        });
        const { token, refreshToken } = authUtils.createTokenPair(
          { email },
          publicKey,
          privateKey
        );

        console.log(privateKey, publicKey);
      }

      // Send verification email
      // Implement email sending logic here

      return {
        code: 201,
        message:
          "Registration successful. Please check your email to verify account.",
        data: { email: newShop.email },
      };
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
