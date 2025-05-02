"use strict";
const { Types } = require("mongoose");
const KeyTokenModel = require("../models/keyToken.model");

class KeyTokenService {
  /**
   * Create or update a key token for a user (used for authentication/session management)
   * @param {Object} param0 - userId, publicKey, privateKey, token, refreshToken
   * @returns {Promise<ObjectId|null>} userId if successful, null otherwise
   */
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    token,
    refreshToken,
  }) => {
    try {
      // Version 1
      // const publicKeyString = publicKey.toString();
      // const tokens = await KeyTokenModel.create(
      //   {
      //     userId: userId,
      //     publicKey: publicKeyString,
      //     privateKey: privateKey,
      //     token: token,
      //     refreshToken: refreshToken,
      //   },
      //   (options = { upsert: true, new: true })
      //   // upsert: true will create a new document if no document matches the query criteria
      //   // new: true will return the modified document rather than the original
      // );

      // Version 2
      const publicKeyString = publicKey.toString();
      const filter = { userId: userId },
        update = {
          publicKey: publicKeyString,
          privateKey: privateKey,
          token: token,
          refreshToken: refreshToken,
        },
        option = { upsert: true, new: true };
      const tokens = await KeyTokenModel.findOneAndUpdate(
        filter,
        update,
        option
      );
      return tokens ? userId : null;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Find a key token document by user ID
   * @param {string} userId
   * @returns {Promise<Object|null>} KeyToken document or null
   */
  static findByUserId = async (userId) => {
    try {
      return await KeyTokenModel.findOne({
        userId: Types.ObjectId.createFromHexString(userId),
      }).lean();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Find a key token by user ID and token (access or refresh)
   * @param {string} userId
   * @param {string} token
   * @returns {Promise<Object|null>} KeyToken document or null
   */
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

  /**
   * Find a key token by refresh token
   * @param {string} refreshToken
   * @returns {Promise<Object|null>} KeyToken document or null
   */
  static findKeyByRefreshToken = async (refreshToken) => {
    try {
      return await KeyTokenModel.findOne({
        refreshToken: refreshToken,
      });
    } catch (error) {
      throw error;
    }
  };

  /**
   * Remove a key token by its document ID
   * @param {string} keyStore - KeyToken document ID
   * @returns {Promise<Object|null>} Deleted KeyToken document or null
   */
  static removeKeyById = async (keyStore) => {
    try {
      const key = await KeyTokenModel.findByIdAndDelete(keyStore).lean();
      return key;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Remove all key tokens for a user by user ID
   * @param {string} userId
   * @returns {Promise<Object>} Delete result
   */
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

  /**
   * Find a key token by a used refresh token (for replay attack prevention)
   * @param {string} refreshToken
   * @returns {Promise<Object|null>} KeyToken document or null
   */
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
