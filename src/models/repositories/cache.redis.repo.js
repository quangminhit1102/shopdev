"use strict";

/**
 * @fileoverview Redis Cache Repository
 * Provides a simplified interface for Redis caching operations in the ShopDev application.
 * Handles JSON serialization/deserialization and common error cases.
 *
 * @module repositories/cache.redis.repo
 * @requires ../../dbs/init.ioredis
 */

const { getRedisClient } = require("../../dbs/init.ioredis");

/**
 * Redis client instance for cache operations
 * @type {import('ioredis').Redis}
 */
const redisClient = getRedisClient();

/**
 * Sets a value in the Redis cache
 *
 * @async
 * @param {Object} params - The parameters for setting cache
 * @param {string} params.key - The unique key to store the value under
 * @param {*} params.value - The value to store (will be JSON stringified)
 * @throws {Error} When Redis client is not initialized
 * @throws {Error} When cache setting operation fails
 * @example
 * await setCacheIO({
 *   key: 'user:123',
 *   value: { name: 'John', age: 30 }
 * });
 */
const setCacheIO = async ({ key, value }) => {
  if (!redisClient) {
    throw new Error("Redis client is not initialized");
  }

  try {
    await redisClient.set(key, JSON.stringify(value));
    console.log(`Cache set for key: ${key}`);
  } catch (error) {
    console.error(`Error setting cache for key ${key}:`, error);
    throw error;
  }
};

/**
 * Sets a value in the Redis cache with an expiration time
 *
 * @async
 * @param {string} key - The unique key to store the value under
 * @param {*} value - The value to store (will be JSON stringified)
 * @param {number} expiration - Time in seconds until the key expires
 * @throws {Error} When Redis client is not initialized
 * @throws {Error} When cache setting operation fails
 * @example
 * await setCacheIOExpiration('session:123', { userId: 456 }, 3600); // expires in 1 hour
 */
const setCacheIOExpiration = async (key, value, expiration) => {
  if (!redisClient) {
    throw new Error("Redis client is not initialized");
  }

  try {
    await redisClient.setEx(key, expiration, JSON.stringify(value));
    console.log(`Cache set with expiration for key: ${key}`);
  } catch (error) {
    console.error(`Error setting cache with expiration for key ${key}:`, error);
    throw error;
  }
};

/**
 * Retrieves a value from the Redis cache
 *
 * @async
 * @param {Object} params - The parameters for getting cache
 * @param {string} params.key - The key to retrieve the value for
 * @returns {Promise<*|null>} The cached value (JSON parsed) or null if not found
 * @throws {Error} When Redis client is not initialized
 * @throws {Error} When cache retrieval operation fails
 * @example
 * const userData = await getCacheIO({ key: 'user:123' });
 * if (userData) {
 *   console.log('User found in cache:', userData);
 * }
 */
const getCacheIO = async ({ key }) => {
  if (!redisClient) {
    throw new Error("Redis client is not initialized");
  }

  try {
    const cachedValue = await redisClient.get(key);
    if (cachedValue) {
      console.log(`Cache hit for key: ${key}`);
      return JSON.parse(cachedValue);
    } else {
      console.log(`Cache miss for key: ${key}`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting cache for key ${key}:`, error);
    throw error;
  }
};

/**
 * @exports
 * Cache repository methods for Redis operations
 */
module.exports = {
  setCacheIO,
  setCacheIOExpiration,
  getCacheIO,
};
