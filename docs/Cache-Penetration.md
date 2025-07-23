# Cache Penetration - Complete Notes

## What is Cache Penetration?

Cache penetration occurs when a large number of requests query for data that **doesn't exist** in both the cache and the database. This bypasses the cache entirely, overwhelming the database with requests for non-existent data.

## Key Characteristics

- Requests for **non-existent keys/data**
- Cache cannot help (no data to cache)
- All requests hit the database directly
- Database performs expensive queries that return nothing
- Can lead to database overload and system failure

## Real-World Example

**Vulnerable Express endpoint**:

```javascript
app.get("/api/user/:id", async (req, res) => {
  const user = await db.query("SELECT * FROM users WHERE id = ?", [
    req.params.id,
  ]);
  user ? res.json(user) : res.status(404).json({ error: "Not found" });
});
```

**Attack**: `GET /api/user/fake123` → Direct DB hit → 404 → Repeat 1000x = DB overload

## Attack Scenario

```javascript
// Attacker overwhelms API with fake IDs
for (let i = 0; i < 1000; i++) {
  fetch(`/api/user/${Math.random().toString(36)}`); // All hit database
}
```

## Prevention Solutions

### 1. Cache Null Values

```javascript
app.get("/api/user/:id", async (req, res) => {
  const cacheKey = `user:${req.params.id}`;

  // Check cache
  let cached = await redis.get(cacheKey);
  if (cached) {
    return cached === "NULL"
      ? res.status(404).json({ error: "Not found" })
      : res.json(JSON.parse(cached));
  }

  // Query DB
  const user = await db.query("SELECT * FROM users WHERE id = ?", [
    req.params.id,
  ]);

  // Cache result (including null)
  await redis.setEx(
    cacheKey,
    user ? 300 : 60,
    user ? JSON.stringify(user) : "NULL"
  );

  user ? res.json(user) : res.status(404).json({ error: "Not found" });
});
```

### 2. Bloom Filter

```javascript
const BloomFilter = require("bloom-filters").BloomFilter;
const bloom = new BloomFilter(100000, 4);

// Initialize with existing IDs
const existingIds = await db.query("SELECT id FROM users");
existingIds.forEach((row) => bloom.add(row.id.toString()));

app.get("/api/user/:id", async (req, res) => {
  // Quick rejection if not in bloom filter
  if (!bloom.has(req.params.id)) {
    return res.status(404).json({ error: "Not found" });
  }

  // Continue with normal cache + DB lookup
  const user = await getUserWithCache(req.params.id);
  user ? res.json(user) : res.status(404).json({ error: "Not found" });
});
```

### 3. Rate Limiting + Validation

```javascript
const rateLimit = require("express-rate-limit");
const { param, validationResult } = require("express-validator");

const limiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 50, // 50 requests per minute
});

app.get(
  "/api/user/:id",
  limiter,
  param("id").isNumeric().isLength({ min: 1, max: 9 }),
  async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const user = await getUserWithCache(req.params.id);
    user ? res.json(user) : res.status(404).json({ error: "Not found" });
  }
);
```

## Best Practices

### Complete Protection (All Methods Combined)

```javascript
const express = require("express");
const redis = require("redis");
const rateLimit = require("express-rate-limit");
const { param, validationResult } = require("express-validator");
const BloomFilter = require("bloom-filters").BloomFilter;

const app = express();
const client = redis.createClient();
const bloom = new BloomFilter(100000, 4);

// Initialize bloom filter
const initBloom = async () => {
  const ids = await db.query("SELECT id FROM users");
  ids.forEach((row) => bloom.add(row.id.toString()));
};

const limiter = rateLimit({ windowMs: 60000, max: 50 });

app.get(
  "/api/user/:id",
  limiter,
  param("id").isNumeric().isLength({ min: 1, max: 9 }),
  async (req, res) => {
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ error: "Invalid" });

    const { id } = req.params;

    // Bloom filter check
    if (!bloom.has(id)) return res.status(404).json({ error: "Not found" });

    // Cache check
    const cached = await client.get(`user:${id}`);
    if (cached)
      return cached === "NULL"
        ? res.status(404).json({ error: "Not found" })
        : res.json(JSON.parse(cached));

    // DB query
    const user = await db.query("SELECT * FROM users WHERE id = ?", [id]);

    // Cache result
    await client.setEx(
      `user:${id}`,
      user ? 300 : 60,
      user ? JSON.stringify(user) : "NULL"
    );

    user ? res.json(user) : res.status(404).json({ error: "Not found" });
  }
);

initBloom();
```

## Monitoring & Metrics

```javascript
// Simple monitoring
let penetrationAttempts = 0;

app.use((req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode === 404 && req.path.includes("/api/")) {
      penetrationAttempts++;
      console.warn(`Cache penetration: ${req.path} from ${req.ip}`);

      // Alert if too many attempts
      if (penetrationAttempts > 100) {
        console.alert("High penetration attempts detected!");
        penetrationAttempts = 0; // Reset counter
      }
    }
  });
  next();
});
```

## Key Takeaways

✅ **Always validate input** before database queries  
✅ **Cache negative results** with shorter TTL  
✅ **Use bloom filters** for large datasets  
✅ **Implement rate limiting** per client  
✅ **Monitor penetration attempts** actively  
✅ **Optimize database queries** for non-existence checks

⚠️ **Remember**: Cache penetration is about **non-existent data** overwhelming your system by bypassing cache protection entirely.
