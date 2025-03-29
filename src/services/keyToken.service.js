"use strict";
const { Types } = require("mongoose");
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

  static findKeyByUserId = async (userId) => {
    try {
      return await KeyTokenModel.findOne({
        userId: new Types.ObjectId(userId),
      }).lean();
    } catch (error) {
      throw error;
    }
  };

  static removeKeyById = async (keyStore) => {
    try {
      const key = await KeyTokenModel.findByIdAndDelete(keyStore);
      return key;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = KeyTokenService;
