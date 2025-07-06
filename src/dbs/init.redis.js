"use strict";

const redis = require("redis");

// Using a single, global client instance
let redisClientInstance = null;

// Event names for Redis client
const REDIS_EVENT = {
    CONNECTED: 'connect',
    ERROR: 'error',
    END: 'end',
    RECONNECTING: 'reconnecting',
    READY: 'ready' // Add 'ready' for when the client is fully ready for operations
};

/**
 * Handles various events emitted by the Redis client connection.
 * @param {redis.RedisClient} client - The Redis client instance.
 */
const handleRedisConnectionEvents = (client) => {
    client.on(REDIS_EVENT.CONNECTED, () => {
        console.log('Redis: Connected!');
    });
    client.on(REDIS_EVENT.READY, () => {
        console.log('Redis: Client is ready for operations.');
    });
    client.on(REDIS_EVENT.ERROR, (err) => {
        console.error('Redis: Connection error:', err.message || err);
    });
    client.on(REDIS_EVENT.END, () => {
        console.log('Redis: Connection ended.');
    });
    client.on(REDIS_EVENT.RECONNECTING, (delay, attempt) => {
        console.log(`Redis: Reconnecting... (attempt: ${attempt}, delay: ${delay}ms)`);
    });
};

/**
 * Initializes and connects to the Redis server.
 * Ensures only one client instance is created.
 * @param {object} [options={}] - Options for the Redis client (e.g., { url: 'redis://localhost:6379' }).
 */
const initRedis = async (options = {}) => {
    if (redisClientInstance) {
        console.log("Redis: Client already initialized. Returning existing instance.");
        return redisClientInstance;
    }

    try {
        // Create the client instance. Default is 'redis://localhost:6379' if no options.url is provided.
        // Or you can explicitly pass host and port: { socket: { host: 'localhost', port: 6379 } }
        redisClientInstance = redis.createClient(options);

        // Attach event handlers
        handleRedisConnectionEvents(redisClientInstance);

        // Attempt to connect
        await redisClientInstance.connect();
        return redisClientInstance;
    } catch (err) {
        console.error('Redis: Failed to initialize and connect:', err);
        redisClientInstance = null; // Reset if connection fails
        throw err; // Re-throw the error so the caller knows initialization failed
    }
};

/**
 * Retrieves the initialized Redis client instance.
 * @returns {redis.RedisClient|null} The Redis client instance, or null if not initialized.
 */
const getRedisClient = () => {
    if (!redisClientInstance) {
        console.warn('Redis: Client has not been initialized yet. Call initRedis() first.');
    }
    return redisClientInstance;
};

/**
 * Closes the Redis client connection.
 */
const closeRedis = async () => {
    if (redisClientInstance && typeof redisClientInstance.quit === 'function') {
        try {
            await redisClientInstance.quit();
            console.log('Redis: Connection gracefully closed.');
        } catch (err) {
            console.error('Redis: Error closing connection:', err);
        } finally {
            redisClientInstance = null; // Ensure the instance is cleared
        }
    } else {
        console.log('Redis: No active connection to close.');
    }
};

module.exports = {
    initRedis,
    getRedisClient, // Renamed for clarity
    closeRedis,
};