"use strict";

const redis = require("redis"); // Redis client
const redisClient = redis.createClient(); // Create a Redis client
const { promisify } = require("util"); // Promisify Redis methods

// pExpire is used to set a key's time to live in milliseconds
const pExpireAsync = promisify(redisClient.pExpire).bind(redisClient);
// pSetEx is used to set a key with a value and an expiration time in milliseconds
const pSetExAsync = promisify(redisClient.pSetEx).bind(redisClient);

const acquireLock = async (product_id, quantity, cart_id) => {
  const key = `lock:${product_id}`;
  const retryTimes = 10;
  const expireTime = 3000;

  for (let i = 0; i < retryTimes; i++) {
    const result = await pSetExAsync(key, expireTime);
    console.log("result::", result);
    if (result === 1) {
      // Inventory check
      const isReservation = await reservationInventory({
        product_id,
        quantity,
        cart_id,
      });
      if (isReservation.modifiedCount) {
        // If reservation fails, release the lock
        await pSetExAsync(key, expireTime);
        return key;
      }
      return null;
    } else {
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
    }
  }
};

const releaseLock = async (keyLock) => {
  const delKeyAsync = promisify(redisClient.del).bind(redisClient);
  await delKeyAsync(keyLock);
};

module.exports = {
  acquireLock,
  releaseLock,
};
