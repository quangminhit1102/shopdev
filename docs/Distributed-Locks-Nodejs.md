# Distributed Locks in Node.js and Express.js Applications

## Introduction: The Challenge of Distributed Systems

Welcome to our Node.js and Express.js development pathway! Up to this point, we've explored many important aspects of building modern web applications with Node.js, from the basics of JavaScript and the Node.js ecosystem to Express.js framework fundamentals, database management with various ORMs, NoSQL databases, modern architectures like Clean Architecture and DDD, and advanced techniques like caching, messaging, and cloud deployment.

Today's Node.js applications are often deployed in distributed architectures, running on multiple instances or services to meet scalability and high availability requirements. However, this distributed environment brings new challenges, especially when multiple instances try to access or modify a shared resource simultaneously. This is where Distributed Locks come into play.

## Why Do We Need Distributed Locks? The Problem of Race Conditions

In an application running on a single server, when multiple requests try to access a critical section of code, we can use synchronization mechanisms like Promises, async/await, or third-party libraries to ensure only one thread executes that code at a time. This helps prevent local race conditions.

A simple example is decreasing inventory stock in an e-commerce application:

```javascript
class InventoryService {
  constructor() {
    this.stock = 100; // Initial stock
    this.mutex = new Mutex(); // Using a mutex library for local locking
  }

  async tryDecreaseStock(amount) {
    // Local lock (only works on 1 instance)
    const release = await this.mutex.acquire();
    try {
      if (this.stock >= amount) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 50));
        this.stock -= amount;
        console.log(`Stock decreased by ${amount}. Remaining: ${this.stock}`);
        return true;
      }
      return false;
    } finally {
      release();
    }
  }
}
```

This code works perfectly when the application runs on a single instance. But if your application is scaled out (running on multiple servers or in different Docker containers), each instance will have its own `stock` variable and `mutex`. When two requests from different instances call `tryDecreaseStock` simultaneously, both can pass the `if (this.stock >= amount)` condition and reduce the stock, leading to incorrect results (stock reduced incorrectly, or even negative values).

This is a classic example of a race condition in a distributed environment. Similar scenarios can occur when:

- Processing periodic tasks (using node-cron or Agenda) on multiple servers, where you want only one instance to execute a specific task at a time.
- Processing messages from a message queue (RabbitMQ, Kafka, Azure Service Bus), where you want to ensure each message is processed by only one worker instance.
- Updating data in a shared database from multiple microservices.

To solve this problem, we need a locking mechanism that works across the entire distributed system, not just within a single process or instance. That's the purpose of Distributed Locks.

## What is a Distributed Lock?

A Distributed Lock is a mechanism that allows multiple independent processes/instances in a distributed system to coordinate with each other to ensure that only one process/instance can access a resource or perform a specific action at a time.

An effective distributed locking system needs to satisfy several important properties:

1. **Mutual Exclusion**: At any point in time, only one client (process/instance) can hold the lock for a specific resource.
2. **Deadlock Freedom**: Even if a client holding the lock crashes or encounters an error, the lock will eventually be released or expire, allowing other clients to acquire it.
3. **Fault Tolerance**: The locking system must continue to function even if some nodes storing the lock state fail.
4. **Availability**: Clients can acquire or release locks as long as the majority of nodes storing the lock state are operational.

Implementing a distributed locking system that fully satisfies these properties is not simple and often relies on complex algorithms like Paxos or Raft. However, in practice, we often use solutions based on existing services like Databases, Distributed Cache (Redis), or distributed configuration management systems (ZooKeeper, Consul) to build a locking mechanism that is "good enough" for most use cases.

## Common Distributed Lock Implementations

There are several ways to implement Distributed Locks, each with its own advantages and disadvantages:

### Using Databases:
- You can use database locking features (SQL, Stored Procedures) or a dedicated table to manage lock states.
- The simplest approach is to create a `Locks` table with columns like `ResourceName`, `LockedBy`, `ExpiryTime`. To acquire a lock, you try to INSERT a new record or UPDATE an old record with a specific `ResourceName`, only if no record exists yet or the record has expired.
- You need to carefully handle the case where a client crashes while holding a lock (using `ExpiryTime`).
- **Advantages**: Simple if you already have a database, ACID properties of DB can help ensure basic consistency.
- **Disadvantages**: Performance is not great (especially with high load), can put pressure on the database, complexity in handling lock expiration and fault tolerance.

### Using Distributed Cache (Popular with Redis):
- Redis is a popular choice for Distributed Cache and is commonly used to implement Distributed Locks. Redis has atomic commands that are well-suited for this purpose.
- To acquire a lock, a client uses the `SET NX PX` command. `NX` (Not Exists) ensures the key is only set if it doesn't already exist (successful lock acquisition). `PX` (Expire) sets an expiration time for the lock (helping with basic deadlock prevention).
- To release a lock, the client checks if the lock is actually held by itself (based on a unique `value` for each client/lock acquisition) before deleting the key. This check and delete operation needs to be atomic, usually done with a Redis Lua Script.
- **Advantages**: High performance (Redis is in-memory), support for atomic commands, automatic expiration feature (TTL).
- **Disadvantages**: Requires Redis infrastructure, fully implementing it (e.g., the Redlock algorithm) is quite complex to ensure correctness in all cases of network failures, server clock skew, etc. However, a simple implementation is often sufficient for many purposes.

### Using Dedicated Lock Services (ZooKeeper, Consul, etcd):
- These are systems specifically designed for distributed configuration management, service discovery, and also provide primitives to implement robust Distributed Locks based on consensus algorithms.
- **Advantages**: Designed for distributed environments, provide stronger guarantees about correctness.
- **Disadvantages**: Require deploying and managing a separate system, more complex compared to using an existing database or cache.

## Implementing Distributed Locks with Redis in Node.js

In Node.js applications, a popular and effective way is to use Redis through libraries like `ioredis` or specialized libraries like `redlock`. Let's look at both approaches.

### Using ioredis

First, make sure you have installed the `ioredis` library:

```bash
npm install ioredis
```

You need to configure a Redis connection in your application:

```javascript
const Redis = require('ioredis');
const redis = new Redis('your_redis_connection_string'); // Replace with your actual Redis connection string
```

To implement the acquire and release lock logic using `ioredis`, we need to use Redis atomic commands:

```javascript
class RedisLockManager {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  /**
   * Try to acquire a distributed lock.
   * @param {string} resourceName - The name of the resource to lock.
   * @param {string} lockValue - A unique value representing the client acquiring the lock (e.g., uuid v4).
   * @param {number} expiryTime - Time in milliseconds after which the lock will automatically expire.
   * @returns {Promise<boolean>} - True if lock acquired, False if not.
   */
  async acquireLock(resourceName, lockValue, expiryTime) {
    // SET key value NX PX milliseconds
    // NX = Only set the key if it does not already exist.
    // PX = Set the specified expire time, in milliseconds.
    const result = await this.redis.set(
      `lock:${resourceName}`, // Key convention "lock:resource_name"
      lockValue,
      'NX',
      'PX',
      expiryTime
    );
    
    return result === 'OK';
  }

  /**
   * Release a distributed lock (only if value matches).
   * @param {string} resourceName - The name of the locked resource.
   * @param {string} lockValue - The unique value used when acquiring the lock.
   * @returns {Promise<boolean>} - True if successfully released, False if not.
   */
  async releaseLock(resourceName, lockValue) {
    // Use Lua Script to ensure GET and DEL operations are atomic.
    // Script: IF key exists AND value matches THEN delete key AND return 1 ELSE return 0
    const luaScript = `
      if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
      else
        return 0
      end`;

    const key = `lock:${resourceName}`;
    
    // evalsha returns the number of keys deleted (1 if successful, 0 if value doesn't match/key doesn't exist)
    const result = await this.redis.eval(luaScript, 1, key, lockValue);
    
    return result === 1;
  }
}
```

Once you have `RedisLockManager`, you can use it in your services:

```javascript
const { v4: uuidv4 } = require('uuid');

class OrderProcessingService {
  constructor(lockManager, logger) {
    this.lockManager = lockManager;
    this.logger = logger || console;
  }

  async processOrder(orderId) {
    const lockResource = `processing-order:${orderId}`;
    const lockValue = uuidv4(); // Unique value for this lock acquisition
    const lockExpiry = 5 * 60 * 1000; // Lock expires after 5 minutes

    this.logger.info(`Attempting to acquire lock for order ${orderId}...`);

    // Try to acquire the lock
    const acquired = await this.lockManager.acquireLock(lockResource, lockValue, lockExpiry);

    if (acquired) {
      this.logger.info(`Lock acquired for order ${orderId}. Processing...`);
      try {
        // --- Critical Section: Code only executed by 1 instance at a time ---

        // Check if the order has already been processed (e.g., in DB)
        // If not, mark as processing, perform complex processing logic
        // Update order status in DB

        this.logger.info(`Processing order ${orderId} completed.`);

        // --------------------------------------------------------------------------
        return true; // Processed
      } catch (error) {
        this.logger.error(`Error processing order ${orderId}: ${error.message}`);
        // May need additional error handling logic
        return false;
      } finally {
        // Always release the lock, even if an error occurs in the critical section
        // Note: If the instance crashes before reaching here, the lock will auto-expire thanks to expiryTime
        await this.lockManager.releaseLock(lockResource, lockValue);
        this.logger.info(`Lock released for order ${orderId}.`);
      }
    } else {
      this.logger.warn(`Could not acquire lock for order ${orderId}. It might be processing by another instance.`);
      return false; // Couldn't acquire the lock, the order might be processed by another instance
    }
  }
}
```

In this example, we use `uuidv4()` as the `lockValue` to ensure that only the instance that acquired the lock can release it (by matching the value). The `expiryTime` is critically important to prevent deadlocks if the instance holding the lock crashes.

### Using the Redlock Library

Implementing Distributed Locks from scratch using `ioredis` requires careful attention to handle edge cases and errors. Fortunately, the Node.js community has developed robust libraries to simplify this, such as the Redlock library.

Installation:

```bash
npm install redlock
```

Usage:

```javascript
const Redis = require('ioredis');
const Redlock = require('redlock');

// Create a Redis client
const client = new Redis('your_redis_connection_string');

// Create a Redlock instance
const redlock = new Redlock(
  // You can use multiple Redis clients for higher availability
  [client],
  {
    // The expected clock drift; for more details, see:
    // http://redis.io/topics/distlock
    driftFactor: 0.01, // multiplied by lock ttl to determine drift time
    
    // The max number of times Redlock will attempt to lock a resource
    // before erroring
    retryCount: 10,
    
    // The time in milliseconds between each retry
    retryDelay: 200, // time in ms
    
    // The max time in milliseconds to wait before retrying
    retryJitter: 200, // time in ms
    
    // The minimum time in milliseconds remaining on a lock before
    // an extension is automatically attempted
    automaticExtensionThreshold: 500, // time in ms
  }
);

class OrderProcessingServiceWithLibrary {
  constructor(redlock, logger) {
    this.redlock = redlock;
    this.logger = logger || console;
  }

  async processOrder(orderId) {
    const lockResource = `processing-order:${orderId}`;
    const lockDuration = 5 * 60 * 1000; // 5 minutes in milliseconds

    this.logger.info(`Attempting to acquire lock for order ${orderId} using library...`);

    try {
      // Try to acquire the lock
      // The library will handle unique values and safe release logic
      const lock = await this.redlock.acquire([lockResource], lockDuration);

      try {
        this.logger.info(`Lock acquired for order ${orderId}. Processing...`);

        // --- Critical Section: Code only executed by 1 instance at a time ---

        // Order processing logic similar to the previous example

        this.logger.info(`Processing order ${orderId} completed.`);

        // --------------------------------------------------------------------------
        return true; // Processed
      } finally {
        // Always release the lock, even if an error occurs
        await lock.release();
        this.logger.info(`Lock released for order ${orderId}.`);
      }
    } catch (error) {
      if (error.name === 'LockError') {
        this.logger.warn(`Could not acquire lock for order ${orderId}. It might be processing by another instance.`);
        return false; // Couldn't acquire the lock
      }
      // Unexpected error
      this.logger.error(`Error with lock for order ${orderId}: ${error.message}`);
      throw error;
    }
  }
}
```

To use `Redlock` in an Express.js application, you might configure it in your app initialization:

```javascript
const express = require('express');
const Redis = require('ioredis');
const Redlock = require('redlock');

const app = express();

// Create Redis client
const redisClient = new Redis('your_redis_connection_string');

// Create Redlock instance
const redlock = new Redlock([redisClient], {
  driftFactor: 0.01,
  retryCount: 10,
  retryDelay: 200,
  retryJitter: 200
});

// Create services
const orderProcessingService = new OrderProcessingServiceWithLibrary(redlock);

// Set up routes
app.post('/api/orders/:orderId/process', async (req, res) => {
  try {
    const { orderId } = req.params;
    const processed = await orderProcessingService.processOrder(orderId);
    
    if (processed) {
      res.status(