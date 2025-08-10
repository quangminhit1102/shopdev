# MySQL JSON Guide

## Table Creation & Data Types

```sql
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    metadata JSON,
    tags JSON
);
```

## Inserting JSON Data

```sql
INSERT INTO products VALUES
(1, 'Laptop', '{"brand": "Dell", "price": 999.99, "specs": {"ram": "16GB", "storage": "512GB"}}', '["electronics", "computers"]'),
(2, 'Phone', '{"brand": "Apple", "price": 1299.99, "specs": {"storage": "256GB", "color": "blue"}}', '["electronics", "mobile"]');
```

## JSON Path Syntax

| Operator  | Description        | Example       |
| --------- | ------------------ | ------------- |
| `$`       | Root element       | `$.brand`     |
| `.key`    | Object member      | `$.specs.ram` |
| `[index]` | Array element      | `$[0]`        |
| `[*]`     | All array elements | `$[*]`        |
| `.**`     | Recursive descent  | `$**.price`   |

## Essential JSON Functions

### Extract Data

```sql
-- Extract specific values
SELECT JSON_EXTRACT(metadata, '$.brand') AS brand FROM products;
SELECT metadata->>'$.brand' AS brand FROM products;  -- Returns unquoted string
SELECT metadata->'$.price' AS price FROM products;   -- Returns JSON value

-- Extract nested data
SELECT JSON_EXTRACT(metadata, '$.specs.ram') AS ram FROM products;
```

### Search & Filter

```sql
-- WHERE with JSON conditions
SELECT * FROM products WHERE metadata->>'$.brand' = 'Apple';
SELECT * FROM products WHERE metadata->'$.price' > 1000;

-- Check if key exists
SELECT * FROM products WHERE JSON_EXTRACT(metadata, '$.specs.ram') IS NOT NULL;

-- Array contains
SELECT * FROM products WHERE JSON_CONTAINS(tags, '"electronics"');
```

### Array Operations

```sql
-- Array length
SELECT JSON_LENGTH(tags) AS tag_count FROM products;

-- Extract array elements
SELECT JSON_EXTRACT(tags, '$[0]') AS first_tag FROM products;

-- Check if value in array
SELECT * FROM products WHERE JSON_SEARCH(tags, 'one', 'mobile') IS NOT NULL;
```

### Modify JSON Data

```sql
-- Add new key-value
UPDATE products SET metadata = JSON_SET(metadata, '$.warranty', '2 years') WHERE id = 1;

-- Remove key
UPDATE products SET metadata = JSON_REMOVE(metadata, '$.warranty') WHERE id = 1;

-- Replace value
UPDATE products SET metadata = JSON_REPLACE(metadata, '$.price', 899.99) WHERE id = 1;

-- Insert if not exists
UPDATE products SET metadata = JSON_INSERT(metadata, '$.category', 'electronics') WHERE id = 1;
```

## Advanced Queries

### JSON Aggregation

```sql
-- Group by JSON field
SELECT metadata->>'$.brand' AS brand, COUNT(*) AS count
FROM products
GROUP BY metadata->>'$.brand';

-- JSON objects in results
SELECT JSON_OBJECT('name', name, 'brand', metadata->>'$.brand') AS product_info
FROM products;

-- JSON arrays in results
SELECT JSON_ARRAYAGG(name) AS product_names FROM products;
```

### Complex Filtering

```sql
-- Multiple JSON conditions
SELECT * FROM products
WHERE metadata->>'$.brand' = 'Dell'
AND metadata->'$.price' < 1000;

-- JSON in subqueries
SELECT * FROM products
WHERE metadata->'$.price' = (
    SELECT MAX(metadata->'$.price') FROM products
);
```

## JSON Table Function

```sql
-- Convert JSON array to rows
SELECT jt.*
FROM products,
JSON_TABLE(tags, '$[*]'
    COLUMNS(tag VARCHAR(50) PATH '$')
) AS jt
WHERE id = 1;
```

## Validation & Schema

```sql
-- Validate JSON format
SELECT JSON_VALID('{"key": "value"}');  -- Returns 1

-- Create table with JSON constraint
CREATE TABLE users (
    id INT PRIMARY KEY,
    profile JSON,
    CONSTRAINT profile_check CHECK (JSON_VALID(profile))
);
```

## Indexing JSON Data

### Generated Columns (Recommended)

```sql
-- Create generated column for indexing
ALTER TABLE products
ADD COLUMN brand VARCHAR(50) AS (metadata->>'$.brand') STORED;

CREATE INDEX idx_brand ON products(brand);
```

### Multi-Value Index (MySQL 8.0.17+)

```sql
-- Index JSON array values
CREATE INDEX idx_tags ON products((CAST(tags AS CHAR(255) ARRAY)));
```

## Performance Tips

1. **Use Generated Columns**: For frequently queried JSON fields
2. **Avoid Deep Nesting**: Keep JSON structure shallow when possible
3. **Use Appropriate Operators**:
   - `->>` for string comparisons
   - `->` for JSON value comparisons
4. **Validate JSON**: Always ensure valid JSON format
5. **Index Strategy**: Create indexes on generated columns for better performance

## Common Patterns

### Configuration Storage

```sql
CREATE TABLE app_config (
    module VARCHAR(50),
    settings JSON
);

INSERT INTO app_config VALUES
('email', '{"smtp_host": "localhost", "port": 587, "ssl": true}');
```

### User Preferences

```sql
CREATE TABLE user_preferences (
    user_id INT,
    preferences JSON
);

-- Query user theme preference
SELECT preferences->>'$.theme' FROM user_preferences WHERE user_id = 123;
```

### Product Catalog

```sql
-- Flexible product attributes
CREATE TABLE catalog (
    product_id INT,
    attributes JSON
);

-- Different products, different attributes
INSERT INTO catalog VALUES
(1, '{"color": "red", "size": "large", "material": "cotton"}'),
(2, '{"weight": "2.5kg", "dimensions": "30x20x10", "waterproof": true}');
```

## Error Handling

```sql
-- Safe JSON extraction with default values
SELECT COALESCE(JSON_EXTRACT(metadata, '$.nonexistent'), '"default"') AS value
FROM products;

-- Check for valid JSON before operations
SELECT
    CASE
        WHEN JSON_VALID(metadata) THEN metadata->>'$.brand'
        ELSE 'Invalid JSON'
    END AS brand
FROM products;
```
