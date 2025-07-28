"use strict";

const IORedis = require("ioredis");

/**
 * Constants and Configuration
 */
const REDIS_CONFIG = {
  DEFAULT_HOST: "localhost",
  DEFAULT_PORT: 6379,
  CONNECT_TIMEOUT: 10000, // 10 seconds
};

const REDIS_EVENTS = {
  CONNECTED: "connect",
  ERROR: "error",
  END: "end",
  RECONNECTING: "reconnecting",
  READY: "ready",
};

const REDIS_MESSAGES = {
  TIMEOUT: {
    error: "Redis: Connection timeout",
    message: {
      en: "Redis: Connection timeout",
      vn: "Redis: Kết nối timeout",
    },
  },
  INITIALIZATION: {
    ALREADY_INITIALIZED:
      "Redis: Client already initialized. Returning existing instance.",
    NOT_INITIALIZED:
      "Redis: Client has not been initialized yet. Call initRedis() first.",
    FAILED: "Redis: Failed to initialize and connect:",
  },
  CONNECTION: {
    CONNECTED: "IORedis: Connected!",
    READY: "IORedis: Client is ready for operations.",
    ENDED: "IORedis: Connection ended.",
    RECONNECTING: "IORedis: Reconnecting...",
    CLOSED: "Redis: Connection gracefully closed.",
    NO_ACTIVE: "Redis: No active connection to close.",
    CLOSE_ERROR: "Redis: Error closing connection:",
  },
};

// Global instance for singleton pattern
let redisClientInstance = null;
let connectionTimeout;

/**
 * Sets up a connection timeout that throws an error if Redis fails to connect within the specified time.
 * @private
 */
const handleRedisConnectionTimeout = () => {
  connectionTimeout = setTimeout(() => {
    console.log(REDIS_MESSAGES.TIMEOUT.error);
    throw new Error(REDIS_MESSAGES.TIMEOUT.message.en);
  }, REDIS_CONFIG.CONNECT_TIMEOUT);
};

/**
 * Attaches event handlers to the Redis client for monitoring connection status.
 * @private
 * @param {IORedis.Redis} client - The Redis client instance.
 */
const setupRedisEventHandlers = (client) => {
  if (!client) {
    throw new Error("Redis client is required for event handling setup");
  }

  const eventHandlers = {
    [REDIS_EVENTS.CONNECTED]: () => {
      console.log(REDIS_MESSAGES.CONNECTION.CONNECTED);
      clearTimeout(connectionTimeout);
    },
    [REDIS_EVENTS.READY]: () => {
      console.log(REDIS_MESSAGES.CONNECTION.READY);
    },
    [REDIS_EVENTS.ERROR]: () => {
      handleRedisConnectionTimeout();
    },
    [REDIS_EVENTS.END]: () => {
      console.log(REDIS_MESSAGES.CONNECTION.ENDED);
      handleRedisConnectionTimeout();
    },
    [REDIS_EVENTS.RECONNECTING]: () => {
      console.warn(REDIS_MESSAGES.CONNECTION.RECONNECTING);
    },
  };

  // Attach all event handlers to the client
  Object.entries(eventHandlers).forEach(([event, handler]) => {
    client.on(event, handler);
  });
};

/**
 * Interface for Redis client initialization options
 * @typedef {Object} RedisOptions
 * @property {boolean} [isEnabled=true] - Whether Redis should be enabled
 * @property {string} [host=REDIS_CONFIG.DEFAULT_HOST] - Redis server host
 * @property {number} [port=REDIS_CONFIG.DEFAULT_PORT] - Redis server port
 */

/**
 * Initializes and connects to the Redis server using the singleton pattern.
 * @param {RedisOptions} options - Configuration options for Redis
 * @returns {Promise<IORedis.Redis|null>} The Redis client instance
 * @throws {Error} If connection fails
 */
const initRedis = async ({
  isEnabled = true,
  host = REDIS_CONFIG.DEFAULT_HOST,
  port = REDIS_CONFIG.DEFAULT_PORT,
} = {}) => {
  // Return existing instance if already initialized
  if (redisClientInstance) {
    console.log(REDIS_MESSAGES.INITIALIZATION.ALREADY_INITIALIZED);
    return redisClientInstance;
  }

  if (!isEnabled) {
    return null;
  }

  try {
    // Create new Redis client instance with provided configuration
    redisClientInstance = new IORedis({
      host,
      port,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    // Set up event handlers for the client
    setupRedisEventHandlers(redisClientInstance);

    return redisClientInstance;
  } catch (err) {
    console.error(REDIS_MESSAGES.INITIALIZATION.FAILED, err);
    redisClientInstance = null;
    throw err;
  }
};

/**
 * Retrieves the initialized Redis client instance.
 * @returns {IORedis.Redis|null} The Redis client instance
 */
const getRedisClient = () => {
  if (!redisClientInstance) {
    console.warn(REDIS_MESSAGES.INITIALIZATION.NOT_INITIALIZED);
  }
  return redisClientInstance;
};

/**
 * Gracefully closes the Redis client connection.
 * @returns {Promise<void>}
 */
const closeRedisConnection = async () => {
  if (!redisClientInstance?.quit) {
    console.log(REDIS_MESSAGES.CONNECTION.NO_ACTIVE);
    return;
  }

  try {
    await redisClientInstance.quit();
    console.log(REDIS_MESSAGES.CONNECTION.CLOSED);
  } catch (err) {
    console.error(REDIS_MESSAGES.CONNECTION.CLOSE_ERROR, err);
    throw err;
  } finally {
    redisClientInstance = null;
  }
};
module.exports = {
  initRedis,
  getRedisClient,
  closeRedisConnection,
};

/**
 * Quick Start Guide:
 *
 * 1. Start Redis using Docker:
 *    docker run --name my-redis -d -p 6379:6379 redis
 *
 * 2. Check container status:
 *    docker ps
 *
 * 3. Connect to Redis CLI:
 *    docker exec -it my-redis redis-cli
 *
 * Basic Redis Commands:
 * - Set value: SET key value
 * - Get value: GET key
 * - Delete key: DEL key
 * - List all keys: KEYS *
 * - Clear database: FLUSHALL
 *
 * Usage Example:
 * ```javascript
 * const { initRedis, getRedisClient, closeRedisConnection } = require('./init.ioredis');
 *
 * // Initialize Redis
 * await initRedis({
 *   isEnabled: true,
 *   host: 'localhost',
 *   port: 6379
 * });
 *
 * // Get client instance
 * const redis = getRedisClient();
 *
 * // Use Redis
 * await redis.set('key', 'value');
 * const value = await redis.get('key');
 *
 * // Close connection
 * await closeRedisConnection();
 * ```
 */
