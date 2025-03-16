"use strict";
const KeyTokenModel = require("../models/keyToken.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey }) => {
    try {
      const publicKeyString = publicKey.toString();
      const tokens = await KeyTokenModel.create({
        userId: userId,
        publicKey: publicKeyString,
        privateKey: privateKey,
      });
      return tokens ? userId : null;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = KeyTokenService;
