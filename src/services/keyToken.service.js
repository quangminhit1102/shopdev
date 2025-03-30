"use strict";
const { Types } = require("mongoose");
const KeyTokenModel = require("../models/keyToken.model");

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    token,
    refreshToken,
  }) => {
    try {
      const publicKeyString = publicKey.toString();
      const tokens = await KeyTokenModel.create({
        userId: userId,
        publicKey: publicKeyString,
        privateKey: privateKey,
        token: token,
        refreshToken: refreshToken,
      });
      return tokens ? userId : null;
    } catch (error) {
      throw error;
    }
  };

  static findKeyByUserIdAndToken = async (userId, token) => {
    try {
      return await KeyTokenModel.findOne({
        // userId: new Types.ObjectId(userId), => Deprecated
        userId: Types.ObjectId.createFromHexString(userId),
        $or: [{ token: token }, { refreshToken: token }],
      }).lean();
    } catch (error) {
      throw error;
    }
  };

  static findKeyByRefreshToken = async (refreshToken) => {
    try {
      return await KeyTokenModel.findOne({
        refreshToken: refreshToken,
      });
    } catch (error) {
      throw error;
    }
  };

  static removeKeyById = async (keyStore) => {
    try {
      const key = await KeyTokenModel.findByIdAndDelete(keyStore).lean();
      return key;
    } catch (error) {
      throw error;
    }
  };

  static removeKeyByUserId = async (userId) => {
    try {
      const key = await KeyTokenModel.deleteMany({
        userId: Types.ObjectId.createFromHexString(userId),
      });
      return key;
    } catch (error) {
      throw error;
    }
  };

  static findKeyByUsedRefreshToken = async (refreshToken) => {
    try {
      return await KeyTokenModel.findOne({
        refreshTokensUsed: refreshToken,
      });
    } catch (error) {
      throw error;
    }
  };
}

module.exports = KeyTokenService;
