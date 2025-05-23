## 1. What is Redis?

Redis (Remote Dictionary Server) is an open-source, in-memory data structure store that can be used as a database, cache, message broker, and streaming engine. Created by Salvatore Sanfilippo in 2009, Redis has become one of the most popular NoSQL databases due to its exceptional performance, flexibility, and rich feature set.

Redis stores data primarily in memory, which allows for extremely fast read and write operations with sub-millisecond latency. While it primarily works with in-memory datasets, Redis also supports persistence by periodically writing data to disk.

## 2. Why Use Redis? High Performance and Concurrency

Redis has become a popular technology choice for many applications due to several key advantages:

### High Performance

- **In-memory operations**: All data is stored in RAM, enabling extremely fast read/write operations (typically < 1ms)
- **Single-threaded architecture**: Eliminates complexities related to thread synchronization and context switching
- **Optimized data structures**: Purpose-built implementations offer O(1) time complexity for many operations
- **Efficient memory usage**: Custom implementation of data structures optimized for minimal memory overhead

### High Concurrency

- **Non-blocking I/O model**: Can handle thousands of client connections simultaneously
- **Built-in atomic operations**: No need for external locking mechanisms, reducing contention
- **Minimal latency**: Quick response times even under heavy loads
- **Pipelining support**: Multiple commands can be sent without waiting for responses

### Additional Benefits

- **Versatility**: Supports multiple data structures and use cases
- **Scalability**: Supports replication and clustering for scaling
- **Reliability**: Options for persistence and high availability
- **Developer-friendly**: Simple command structure and extensive client libraries

## 3. Memcached vs Redis

| Feature           | Redis                                                | Memcached                                |
| ----------------- | ---------------------------------------------------- | ---------------------------------------- |
| Data Structures   | Rich data types (strings, lists, sets, hashes, etc.) | Simple key-value storage only            |
| Persistence       | Supports RDB snapshots and AOF logs                  | No persistence                           |
| Replication       | Built-in master-slave replication                    | No native replication                    |
| Clustering        | Native clustering with Redis Cluster                 | No native clustering                     |
| Memory Efficiency | Configurable memory policies                         | More memory-efficient for simple storage |
| Data Eviction     | Multiple eviction policies                           | LRU (Least Recently Used) only           |
| Transactions      | Supports MULTI/EXEC transactions                     | No transaction support                   |
| Pub/Sub           | Built-in publish/subscribe messaging                 | No messaging capabilities                |
| Lua Scripting     | Supports server-side Lua scripts                     | No scripting support                     |
| Geospatial        | Built-in geospatial operations                       | No geospatial support                    |
| Data Size         | Values up to 512MB                                   | Values limited to 1MB                    |
| Architecture      | Single-threaded (some multi-threaded parts in 6.0+)  | Multi-threaded                           |

- **Use Redis**: When advanced data structures, persistence, or messaging is required.
- **Use Memcached**: For simple, memory-efficient key-value caching.

## 4. Redis Data Types: Usage, Examples and Methods

### 1. Strings

- **Description**: Basic type storing text, integers, or binary data (up to 512MB)
- **Example**:

  ```
  SET user:1:name "John Smith"
  GET user:1:name
  > "John Smith"

  SET pageviews 0
  INCR pageviews
  > 1
  ```

- **Common Commands**: SET, GET, INCR, INCRBY, DECR, APPEND, STRLEN, MSET

### 2. Lists

- **Description**: Ordered collections of strings, fast insertion/removal from ends
- **Example**:

  ```
  LPUSH notifications "New message from Alice"
  LPUSH notifications "Payment received"
  LRANGE notifications 0 -1
  > 1) "Payment received"
  > 2) "New message from Alice"
  ```

- **Common Commands**: LPUSH, RPUSH, LPOP, RPOP, LRANGE, LLEN, LTRIM

### 3. Sets

- **Description**: Unordered collection of unique strings
- **Example**:

  ```
  SADD product:1:tags "electronics" "gadgets" "smartphones"
  SISMEMBER product:1:tags "electronics"
  > 1
  ```

- **Common Commands**: SADD, SREM, SMEMBERS, SISMEMBER, SINTER, SUNION, SDIFF

### 4. Hashes

- **Description**: Field-value pairs, ideal for objects
- **Example**:

  ```
  HSET user:1 username "jsmith" email "john@example.com" age 28
  HGET user:1 email
  > "john@example.com"
  ```

- **Common Commands**: HSET, HGET, HGETALL, HEXISTS, HDEL, HINCRBY

### 5. Sorted Sets

- **Description**: Sets with associated scores for ordering
- **Example**:

  ```
  ZADD leaderboard 1000 "player1"
  ZADD leaderboard 2500 "player2"
  ZREVRANGE leaderboard 0 1 WITHSCORES
  > "player2" 2500
  > "player1" 1000
  ```

- **Common Commands**: ZADD, ZRANGE, ZREVRANGE, ZRANK, ZSCORE, ZINCRBY

### Additional Data Types

- **Bitmaps**: For bit-level operations
- **HyperLogLogs**: Approximate cardinality counting
- **Geospatial**: Location-based indexing
- **Streams**: Append-only log data structure

## 5. How Does Redis Handle Data Expiration?

### Expiration Methods

- **Direct commands**:

  ```
  SET key value EX 3600
  EXPIRE key 3600
  EXPIREAT key 1716057600
  ```

### Expiration Implementation

#### 1. Dual Expiration Approaches

- **Passive (Lazy) Expiration**: Checked on access
- **Active Expiration**: Periodically samples and deletes expired keys

#### 2. Memory Management with Eviction Policies

- Configured in `redis.conf`:

  ```
  maxmemory 1gb
  maxmemory-policy volatile-lru
  ```

- **Eviction Policies**:

  - volatile-lru, allkeys-lru
  - volatile-lfu, allkeys-lfu
  - volatile-random, allkeys-random
  - volatile-ttl
  - noeviction

#### 3. Expiration Commands

```
SET key value EX 3600
PEXPIRE key 300000
EXPIREAT key 1716057600
TTL key
PERSIST key
```

### 4. Practical Applications

- **Caching**: `SET cache:user:1234 "{user_data}" EX 3600`
- **Sessions**: `SETEX session:token123 1800 "{session_data}"`
- **Rate Limiting**: `INCR ratelimit:api:user123; EXPIRE ratelimit:api:user123 60`
- **One-Time Tokens**: `SETEX reset:password:token123 900 "user@example.com"`
- **Time-to-Live Data**: `SETEX promotion:flash-sale 86400 "active"`

### 5. Is Redis Pub/Sub is a message queue system?

Redis Pub/Sub is a messaging pattern, but it's **not a full message queue system** in the traditional sense. Here are the key distinctions:
Redis Pub/Sub characteristics:

- Messages are broadcast to all active subscribers immediately
- No message persistence - if no subscribers are listening, messages are lost
- No delivery guarantees - messages aren't stored or retried
- Fire-and-forget pattern with real-time delivery
- Subscribers must be connected to receive messages

### 6. Expiration Best Practices

- Set TTLs appropriate to data volatility
- Avoid identical TTLs for bulk keys
- Choose suitable eviction policy
- Monitor with: `redis-cli INFO stats | grep expired`
- Use logical expiration for costly-to-recreate objects
- Remember: Keys with TTL still consume memory until deletion
