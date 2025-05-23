// redis.pubsub.example.service.js
// Example Redis Pub/Sub Service for Purchase Order and Inventory Communication
// This service provides simple publish and subscribe methods using Redis.
//
// Usage Example:
//   const RedisPubSubExampleService = require('./redis.pubsub.example.service');
//   const pubsub = new RedisPubSubExampleService();
//   await pubsub.init();
//   pubsub.publish('order_events', JSON.stringify({ type: 'ORDER_CREATED', ... }));
//   pubsub.subscribe('order_events', (msg) => { ... });

const redis = require("redis");

class RedisPubSubExampleService {
  constructor() {
    // Create a Redis client for publishing messages
    this.redisClient = redis.createClient({
      url: process.env.REDIS_URL,
    });
    // Handle connection errors
    this.redisClient.on("error", (err) =>
      console.error("Redis Client Error", err)
    );
    // Do not connect here; use async init() instead
  }

  /**
   * Asynchronously connect the Redis client. Call this after instantiating the service.
   * @returns {Promise<void>}
   */
  async init() {
    await this.redisClient.connect();
  }

  /**
   * Publish a message to a Redis channel
   * @param {string} channel - The channel name
   * @param {string} message - The message to publish (should be a string or JSON string)
   * @returns {Promise<void>}
   */
  async publish(channel, message) {
    await this.redisClient.publish(channel, message);
  }

  /**
   * Subscribe to a Redis channel and handle incoming messages
   * @param {string} channel - The channel name
   * @param {function} callback - Function to call with each message
   * @returns {Promise<void>}
   */
  async subscribe(channel, callback) {
    // Create a separate Redis client for subscribing
    const subscriber = redis.createClient({
      url: process.env.REDIS_URL,
    });
    await subscriber.connect();
    // Subscribe to the channel and handle messages with the callback
    await subscriber.subscribe(channel, (message) => {
      callback(message);
    });
  }
}

module.exports = RedisPubSubExampleService;
