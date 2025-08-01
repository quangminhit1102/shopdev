# Cache Breakdown - Complete Notes

## What is Cache Breakdown?

Cache breakdown (also called "Cache Stampede" or "Thundering Herd") occurs when a **popular cached item expires** and multiple requests simultaneously try to rebuild it, causing all requests to hit the database at once.

## Key Characteristics

- **Popular/hot data** expires from cache
- **Multiple concurrent requests** for the same expired key
- All requests bypass cache and hit database simultaneously
- Database experiences sudden spike in identical queries
- Can cause database overload and performance degradation

## Real-World Example

**Vulnerable Express endpoint**:
```javascript
app.get('/api/popular/:id', async (req, res) => {
  const cached = await redis.get(`popular:${req.params.id}`);
  if (cached) return res.json(JSON.parse(cached));
  
  // All concurrent requests hit DB when cache expires
  const data = await db.query('SELECT * FROM popular_items WHERE id = ?', [req.params.id]);
  await redis.setEx(`popular:${req.params.id}`, 300, JSON.stringify(data));
  
  res.json(data);
});
```

**Breakdown Scenario**: Popular item cache expires → 1000 concurrent requests → All hit database → DB overload

## Attack Scenario

```javascript
// Natural breakdown: Popular content cache expires
// 1000 users request same popular item simultaneously
Promise.all([
  fetch('/api/popular/trending-video'),  // Cache miss
  fetch('/api/popular/trending-video'),  // Cache miss  
  fetch('/api/popular/trending-video'),  // Cache miss
  // ... 997 more identical requests hit DB
]);
```

## Prevention Solutions

### 1. Mutex/Lock Pattern
```javascript
const locks = new Map();

app.get('/api/popular/:id', async (req, res) => {
  const key = `popular:${req.params.id}`;
  const lockKey = `lock:${key}`;
  
  // Check cache first
  let cached = await redis.get(key);
  if (cached) return res.json(JSON.parse(cached));
  
  // Try to acquire lock
  const lockAcquired = await redis.set(lockKey, '1', 'PX', 10000, 'NX'); // 10s lock
  
  if (lockAcquired) {
    try {
      // Double-check cache after acquiring lock
      cached = await redis.get(key);
      if (cached) return res.json(JSON.parse(cached));
      
      // Only this request rebuilds cache
      const data = await db.query('SELECT * FROM popular_items WHERE id = ?', [req.params.id]);
      await redis.setEx(key, 300, JSON.stringify(data));
      
      res.json(data);
    } finally {
      await redis.del(lockKey); // Release lock
    }
  } else {
    // Wait and retry if lock exists
    await new Promise(resolve => setTimeout(resolve, 100));
    const retryData = await redis.get(key);
    res.json(retryData ? JSON.parse(retryData) : null);
  }
});
```

### 2. Logical Expiration
```javascript
app.get('/api/popular/:id', async (req, res) => {
  const key = `popular:${req.params.id}`;
  const cached = await redis.get(key);
  
  if (cached) {
    const data = JSON.parse(cached);
    
    // Check logical expiration
    if (data.expire > Date.now()) {
      return res.json(data.value); // Still valid
    }
    
    // Expired but return stale data immediately
    res.json(data.value);
    
    // Async rebuild in background (fire-and-forget)
    setImmediate(async () => {
      const fresh = await db.query('SELECT * FROM popular_items WHERE id = ?', [req.params.id]);
      await redis.set(key, JSON.stringify({
        value: fresh,
        expire: Date.now() + 300000 // 5 minutes
      }));
    });
    
  } else {
    // Cache miss - rebuild normally
    const data = await db.query('SELECT * FROM popular_items WHERE id = ?', [req.params.id]);
    await redis.set(key, JSON.stringify({
      value: data,
      expire: Date.now() + 300000
    }));
    res.json(data);
  }
});
```

### 3. Random TTL
```javascript
app.get('/api/popular/:id', async (req, res) => {
  const key = `popular:${req.params.id}`;
  let cached = await redis.get(key);
  
  if (cached) return res.json(JSON.parse(cached));
  
  const data = await db.query('SELECT * FROM popular_items WHERE id = ?', [req.params.id]);
  
  // Random TTL between 4-6 minutes to prevent synchronized expiration
  const randomTTL = 240 + Math.floor(Math.random() * 120); // 240-360 seconds
  await redis.setEx(key, randomTTL, JSON.stringify(data));
  
  res.json(data);
});
```

### 4. Pre-warming & Background Refresh
```javascript
const cron = require('node-cron');

// Pre-warm popular items every 4 minutes
cron.schedule('*/4 * * * *', async () => {
  const popularIds = await db.query('SELECT id FROM popular_items ORDER BY views DESC LIMIT 100');
  
  for (const {id} of popularIds) {
    const key = `popular:${id}`;
    const ttl = await redis.ttl(key);
    
    // Refresh if TTL < 1 minute
    if (ttl < 60) {
      const data = await db.query('SELECT * FROM popular_items WHERE id = ?', [id]);
      await redis.setEx(key, 300, JSON.stringify(data));
    }
  }
});

app.get('/api/popular/:id', async (req, res) => {
  const cached = await redis.get(`popular:${req.params.id}`);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  } else {
    // Fallback to DB if not pre-warmed
    const data = await db.query('SELECT * FROM popular_items WHERE id = ?', [req.params.id]);
    await redis.setEx(`popular:${req.params.id}`, 300, JSON.stringify(data));
    res.json(data);
  }
});
```

## Best Practices

### Complete Protection (Mutex + Logical Expiration)
```javascript
const express = require('express');
const redis = require('redis');
const app = express();
const client = redis.createClient();

const getCachedWithProtection = async (key, fetchFunction, ttl = 300) => {
  // Check cache
  const cached = await client.get(key);
  
  if (cached) {
    const data = JSON.parse(cached);
    
    // Logical expiration check
    if (data.expire > Date.now()) {
      return data.value; // Fresh data
    }
    
    // Stale data - try to refresh with mutex
    const lockKey = `lock:${key}`;
    const lockAcquired = await client.set(lockKey, '1', 'PX', 5000, 'NX');
    
    if (lockAcquired) {
      // Background refresh
      setImmediate(async () => {
        try {
          const fresh = await fetchFunction();
          await client.set(key, JSON.stringify({
            value: fresh,
            expire: Date.now() + (ttl * 1000)
          }));
        } finally {
          await client.del(lockKey);
        }
      });
    }
    
    return data.value; // Return stale data immediately
  }
  
  // Cache miss - rebuild with mutex
  const lockKey = `lock:${key}`;
  const lockAcquired = await client.set(lockKey, '1', 'PX', 10000, 'NX');
  
  if (lockAcquired) {
    try {
      const data = await fetchFunction();
      await client.set(key, JSON.stringify({
        value: data,
        expire: Date.now() + (ttl * 1000)
      }));
      return data;
    } finally {
      await client.del(lockKey);
    }
  } else {
    // Wait for other request to rebuild
    await new Promise(resolve => setTimeout(resolve, 100));
    const rebuilt = await client.get(key);
    return rebuilt ? JSON.parse(rebuilt).value : await fetchFunction();
  }
};

app.get('/api/popular/:id', async (req, res) => {
  try {
    const data = await getCachedWithProtection(
      `popular:${req.params.id}`,
      () => db.query('SELECT * FROM popular_items WHERE id = ?', [req.params.id]),
      300
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({error: 'Server error'});
  }
});
```

## Monitoring & Metrics

```javascript
let breakdownDetected = 0;

app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Detect potential breakdown (slow DB queries)
    if (duration > 1000 && req.path.includes('/api/popular/')) {
      breakdownDetected++;
      console.warn(`Potential cache breakdown: ${req.path} took ${duration}ms`);
      
      if (breakdownDetected > 10) {
        console.alert('Cache breakdown detected!');
        breakdownDetected = 0;
      }
    }
  });
  
  next();
});

// Monitor cache hit rates
const trackCacheStats = async () => {
  const info = await client.info('stats');
  const keyspaceHits = parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || 0);
  const keyspaceMisses = parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || 0);
  const hitRate = keyspaceHits / (keyspaceHits + keyspaceMisses);
  
  if (hitRate < 0.8) {
    console.warn(`Low cache hit rate: ${(hitRate * 100).toFixed(2)}%`);
  }
};

setInterval(trackCacheStats, 60000); // Check every minute
```

## Key Takeaways

✅ **Use mutex locks** to prevent multiple DB hits  
✅ **Implement logical expiration** to serve stale data while refreshing  
✅ **Add random TTL** to prevent synchronized expiration  
✅ **Pre-warm popular content** proactively  
✅ **Monitor response times** for breakdown detection  
✅ **Combine multiple strategies** for robust protection  

⚠️ **Remember**: Cache breakdown affects **popular data** and causes **database spikes** when multiple requests rebuild expired cache simultaneously.