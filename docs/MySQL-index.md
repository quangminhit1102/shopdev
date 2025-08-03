# Complete MySQL Indexes Guide

## Table of Contents

1. [Overview](#overview)
2. [How Indexes Work](#how-indexes-work)
3. [Types of Indexes](#types-of-indexes)
   - [B-Tree Indexes](#1-b-tree-indexes)
   - [Hash Indexes](#2-hash-indexes)
   - [Spatial (R-Tree) Indexes](#3-spatial-r-tree-indexes)
4. [Multiple-Column Indexes](#multiple-column-indexes)
5. [Leftmost Prefix Rule](#leftmost-prefix-rule)
6. [Query Patterns That Use Indexes](#query-patterns-that-use-indexes)
7. [Index Limitations](#index-limitations)
8. [Analyzing Index Usage](#analyzing-index-usage)
9. [Best Practices](#best-practices)
10. [Performance Considerations](#performance-considerations)
11. [Advanced Topics](#advanced-topics)
12. [Conclusion](#conclusion)

---

## Overview

**What are Indexes?**

- Data structures that serve as storage mechanisms to find rows faster
- Also called "keys" in MySQL
- Critical for good performance, especially as data grows
- Small databases with light loads often work well without proper indexing
- Performance can degrade rapidly as dataset size increases
- Poor indexing is the leading cause of real-world performance problems

**Key Benefits:**

- Dramatically reduce query execution time
- Enable efficient data retrieval
- Support various query patterns (exact matches, ranges, sorting)
- Essential for large-scale applications

---

## How Indexes Work

Think of indexes like a book's table of contents:

- To find a specific topic in a book, you look at the index
- The index tells you which page contains that content
- MySQL uses indexes similarly to locate data

**Example:**

```sql
SELECT first_name FROM sakila.actor WHERE actor_id = 5;
```

- If `actor_id` is indexed, MySQL uses the index to find rows with `actor_id = 5`
- Instead of scanning the entire table, it performs an index lookup
- Returns matching rows efficiently

---

## Types of Indexes

# MySQL Index Types Guide

## Overview

MySQL indexes are data structures that improve query performance by providing faster access paths to table data. This guide covers all major index types with practical examples.

## 1. Primary Key Index

**Description**: Automatically creates a clustered index. Ensures uniqueness and cannot contain NULL values.

**Syntax**:

```sql
-- During table creation
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

-- Add to existing table
ALTER TABLE users ADD PRIMARY KEY (id);
```

**Example**:

```sql
CREATE TABLE employees (
    emp_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    department VARCHAR(30)
);

-- This query will use the primary key index
SELECT * FROM employees WHERE emp_id = 123;
```

## 2. Unique Index

**Description**: Ensures column values are unique while allowing one NULL value.

**Syntax**:

```sql
-- During table creation
CREATE TABLE users (
    id INT PRIMARY KEY,
    email VARCHAR(100) UNIQUE,
    username VARCHAR(50)
);

-- Add to existing table
CREATE UNIQUE INDEX idx_username ON users (username);
ALTER TABLE users ADD UNIQUE KEY idx_email (email);
```

**Example**:

```sql
CREATE TABLE customers (
    id INT PRIMARY KEY,
    email VARCHAR(100),
    phone VARCHAR(15)
);

-- Create unique indexes
CREATE UNIQUE INDEX idx_customer_email ON customers (email);
CREATE UNIQUE INDEX idx_customer_phone ON customers (phone);

-- These queries will use unique indexes
SELECT * FROM customers WHERE email = 'john@example.com';
SELECT * FROM customers WHERE phone = '555-1234';
```

## 3. Regular Index (Non-Unique)

**Description**: Standard index for faster lookups without uniqueness constraint.

**Syntax**:

```sql
-- During table creation
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10,2),
    INDEX idx_category (category)
);

-- Add to existing table
CREATE INDEX idx_price ON products (price);
ALTER TABLE products ADD INDEX idx_name (name);
```

**Example**:

```sql
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    status VARCHAR(20),
    total DECIMAL(10,2)
);

-- Create regular indexes
CREATE INDEX idx_customer_id ON orders (customer_id);
CREATE INDEX idx_order_date ON orders (order_date);
CREATE INDEX idx_status ON orders (status);

-- These queries will benefit from indexes
SELECT * FROM orders WHERE customer_id = 456;
SELECT * FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-12-31';
SELECT * FROM orders WHERE status = 'completed';
```

## 4. Composite Index (Multi-Column)

**Description**: Index on multiple columns, useful for queries filtering on multiple fields.

**Syntax**:

```sql
-- Create composite index
CREATE INDEX idx_name_category ON products (name, category);
CREATE INDEX idx_date_status ON orders (order_date, status);
```

**Example**:

```sql
CREATE TABLE blog_posts (
    id INT PRIMARY KEY,
    title VARCHAR(200),
    author_id INT,
    category VARCHAR(50),
    published_date DATE,
    status ENUM('draft', 'published', 'archived')
);

-- Create composite indexes
CREATE INDEX idx_author_status ON blog_posts (author_id, status);
CREATE INDEX idx_category_date ON blog_posts (category, published_date);
CREATE INDEX idx_status_date ON blog_posts (status, published_date);

-- Efficient queries using composite indexes
SELECT * FROM blog_posts WHERE author_id = 123 AND status = 'published';
SELECT * FROM blog_posts WHERE category = 'technology' AND published_date >= '2024-01-01';
```

## 5. Full-Text Index

**Description**: Specialized index for full-text searches on text columns.

**Syntax**:

```sql
-- During table creation
CREATE TABLE articles (
    id INT PRIMARY KEY,
    title VARCHAR(200),
    content TEXT,
    FULLTEXT(title, content)
);

-- Add to existing table
ALTER TABLE articles ADD FULLTEXT(title);
CREATE FULLTEXT INDEX idx_content ON articles (content);
```

**Example**:

```sql
CREATE TABLE news_articles (
    id INT PRIMARY KEY,
    headline VARCHAR(300),
    body TEXT,
    author VARCHAR(100),
    publish_date DATE
);

-- Add full-text index
ALTER TABLE news_articles ADD FULLTEXT idx_search (headline, body);

-- Full-text search queries
SELECT * FROM news_articles
WHERE MATCH(headline, body) AGAINST ('artificial intelligence');

SELECT * FROM news_articles
WHERE MATCH(headline, body) AGAINST ('+mysql -oracle' IN BOOLEAN MODE);
```

## 6. Spatial Index

**Description**: Index for geometric data types and spatial operations.

**Syntax**:

```sql
-- Create table with spatial column
CREATE TABLE locations (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    coordinates POINT NOT NULL,
    SPATIAL INDEX idx_coordinates (coordinates)
);
```

**Example**:

```sql
CREATE TABLE restaurants (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    location POINT NOT NULL,
    cuisine VARCHAR(50)
);

-- Add spatial index
ALTER TABLE restaurants ADD SPATIAL INDEX idx_location (location);

-- Insert spatial data
INSERT INTO restaurants (id, name, location, cuisine) VALUES
(1, 'Pizza Palace', ST_GeomFromText('POINT(-74.0059 40.7128)'), 'Italian'),
(2, 'Sushi Bar', ST_GeomFromText('POINT(-74.0060 40.7130)'), 'Japanese');

-- Spatial queries
SELECT name FROM restaurants
WHERE ST_Distance(location, ST_GeomFromText('POINT(-74.0059 40.7128)')) < 1000;
```

## 7. Hash Index

**Description**: Very fast for equality lookups but not for range queries. Primarily used with MEMORY engine.

**Syntax**:

```sql
-- Create MEMORY table with HASH index
CREATE TABLE session_data (
    session_id VARCHAR(32) PRIMARY KEY,
    user_id INT,
    data TEXT,
    INDEX idx_user_hash (user_id) USING HASH
) ENGINE=MEMORY;
```

**Example**:

```sql
CREATE TABLE cache_entries (
    cache_key VARCHAR(100) PRIMARY KEY,
    cache_value TEXT,
    expiry_time TIMESTAMP,
    INDEX idx_expiry_hash (expiry_time) USING HASH
) ENGINE=MEMORY;

-- Fast equality lookup
SELECT cache_value FROM cache_entries WHERE cache_key = 'user_profile_123';
```

## 8. B-Tree Index (Default)

**Description**: Default index type for most storage engines, good for equality and range queries.

**Syntax**:

```sql
-- Explicitly specify BTREE (though it's default)
CREATE INDEX idx_price_btree ON products (price) USING BTREE;
```

**Example**:

```sql
CREATE TABLE transactions (
    id INT PRIMARY KEY,
    amount DECIMAL(10,2),
    transaction_date DATETIME,
    account_id INT
);

-- B-Tree indexes (default type)
CREATE INDEX idx_amount ON transactions (amount);
CREATE INDEX idx_date ON transactions (transaction_date);

-- Efficient for both equality and range queries
SELECT * FROM transactions WHERE amount = 100.00;
SELECT * FROM transactions WHERE amount BETWEEN 50.00 AND 200.00;
SELECT * FROM transactions WHERE transaction_date >= '2024-01-01';
```

## Index Management Commands

### View Indexes

```sql
-- Show all indexes on a table
SHOW INDEX FROM table_name;
SHOW KEYS FROM table_name;

-- View index usage
SHOW INDEX FROM products;
```

### Drop Indexes

```sql
-- Drop specific index
DROP INDEX idx_name ON table_name;
ALTER TABLE table_name DROP INDEX idx_name;

-- Drop primary key
ALTER TABLE table_name DROP PRIMARY KEY;
```

## Best Practices

1. **Index Selectivity**: Create indexes on columns with high selectivity (many unique values)
2. **Composite Index Order**: Put most selective columns first in composite indexes
3. **Avoid Over-Indexing**: Too many indexes slow down INSERT/UPDATE/DELETE operations
4. **Monitor Usage**: Use `EXPLAIN` to verify index usage in queries
5. **Regular Maintenance**: Use `OPTIMIZE TABLE` for fragmented indexes

### Example of Query Optimization

```sql
-- Check if query uses index
EXPLAIN SELECT * FROM orders WHERE customer_id = 123 AND status = 'pending';

-- Analyze index usage
EXPLAIN FORMAT=JSON SELECT * FROM products WHERE category = 'electronics' AND price > 100;
```

## Summary

| Index Type  | Use Case              | Storage Engine | Key Features             |
| ----------- | --------------------- | -------------- | ------------------------ |
| PRIMARY KEY | Unique identification | All            | Clustered, No NULLs      |
| UNIQUE      | Unique values         | All            | One NULL allowed         |
| INDEX       | General lookups       | All            | Non-unique               |
| COMPOSITE   | Multi-column queries  | All            | Multiple columns         |
| FULLTEXT    | Text searching        | InnoDB, MyISAM | Text search capabilities |
| SPATIAL     | Geographic data       | InnoDB, MyISAM | Geometric operations     |
| HASH        | Fast equality         | MEMORY         | Equality only            |
| BTREE       | General purpose       | All            | Range and equality       |

Choose the appropriate index type based on your query patterns, data characteristics, and performance requirements.

**Characteristics:**

- Designed for geographic applications
- Supported by MyISAM engine
- Works with geometric data types like GEOMETRY
- Indexes data across all dimensions simultaneously
- Doesn't require leftmost prefix in WHERE clauses
- Supports efficient lookups using any dimension combination
- Requires MySQL GIS functions like `MBRCONTAINS()`

**Limitations:**

- MySQL GIS support is limited
- Most applications use PostGIS with PostgreSQL for advanced GIS needs

---

## Multiple-Column Indexes

**Definition:**

- An index can include multiple columns (up to 16 columns)
- Also called composite or compound indexes
- Can optimize queries that test all columns or leftmost prefixes

**Example:**

```sql
CREATE TABLE test (
    id INT NOT NULL,
    last_name CHAR(30) NOT NULL,
    first_name CHAR(30) NOT NULL,
    PRIMARY KEY (id),
    INDEX name (last_name, first_name)
);
```

---

## Leftmost Prefix Rule

**Critical Concept:**
The leftmost prefix rule is fundamental to understanding multi-column indexes.

**Definition:**

- Only the leftmost columns of a multi-column index can be used independently
- The order of columns in the index definition matters significantly

**Example with 3-column index (col1, col2, col3):**

**✅ These queries can use the index:**

- `(col1)` - Uses leftmost column
- `(col1, col2)` - Uses leftmost prefix
- `(col1, col2, col3)` - Uses entire index

**❌ These queries CANNOT use the index:**

- `(col2)` - Skips leftmost column
- `(col2, col3)` - Skips leftmost column
- `(col3)` - Skips leftmost columns

**Practical Example:**

```sql
-- ✅ Uses index efficiently
SELECT * FROM test WHERE last_name='Widenius';
SELECT * FROM test WHERE last_name='Widenius' AND first_name='Michael';

-- ❌ Cannot use index
SELECT * FROM test WHERE first_name='Michael';
```

---

## Query Patterns That Use Indexes

### 1. Full Value Match

```sql
SELECT * FROM test WHERE last_name='Widenius';
```

### 2. Range of Values

```sql
SELECT * FROM test WHERE last_name >= 'A' AND last_name <= 'M';
SELECT * FROM test WHERE last_name > 'Smith';
```

### 3. Leftmost Prefix Match

```sql
-- With index on (last_name, first_name)
SELECT * FROM test WHERE last_name='Widenius';
SELECT * FROM test WHERE last_name='Widenius' AND first_name='Michael';
SELECT * FROM test WHERE last_name='Widenius'
    AND (first_name='Michael' OR first_name='Monty');
SELECT * FROM test WHERE last_name='Widenius'
    AND first_name >= 'M' AND first_name < 'N';
```

### 4. Column Prefix Match

```sql
-- Find users with last_name starting with 'J'
SELECT * FROM test WHERE last_name LIKE 'J%';
```

---

## Index Limitations

### 1. Leftmost Prefix Requirement

**Problem:** Queries not using leftmost prefix cannot utilize the index

```sql
-- ❌ Cannot use index on (last_name, first_name)
SELECT * FROM test WHERE first_name='Michael';
```

### 2. OR Conditions

**Problem:** OR conditions often prevent index usage

```sql EX1
-- ❌ Cannot efficiently use leftmost prefix
SELECT * FROM test WHERE last_name='Widenius' OR first_name='Michael';
```

```sql EX2
-- With index on (col1, col2, col3)
-- Without index (col4)
-- ❌ Only col1 and col2 can be optimized, col3 cannot
SELECT * FROM test WHERE col1 = 'value' OR col2 > 10 OR col4 = 'another';
```

### 3. Right-side Wildcards

**Problem:** Wildcards at the beginning prevent index usage

```sql
-- ✅ Can use index
SELECT * FROM test WHERE last_name LIKE 'J%';

-- ❌ Cannot use index
SELECT * FROM test WHERE last_name LIKE '%J';
```

### 4. Range Conditions

**Problem:** Columns after a range condition in multi-column indexes cannot be optimized

```sql
-- With index on (col1, col2, col3)
-- ❌ Only col1 and col2 can be optimized, col3 cannot
SELECT * FROM test WHERE col1 = 'value' AND col2 > 10 AND col3 = 'another';
```

### 6. Calculations on indexed columns in WHERE clauses

**Problem:** Do not use calculations on indexed columns in WHERE clauses, as it prevents index usage.

```sql
-- ❌ Inefficient query without index
EXPLAIN select * from users where usr_id+1 = 2
EXPLAIN select * from users where substr(usr_status,1,2) = 1
```

### 7. Using ORDER BY clause without WHERE OR LIMIT clause

````sql
-- ❌ Inefficient query without index
EXPLAIN select * from users where order by usr_email, usr_name

---

## Analyzing Index Usage

### Using EXPLAIN Command

**Basic Syntax:**

```sql
EXPLAIN SELECT * FROM table_name WHERE conditions;
````

**Key Columns to Analyze:**

1. **`type`** - Join type (best to worst: const, eq_ref, ref, range, index, ALL)
2. **`possible_keys`** - Indexes that could be used
3. **`key`** - Index actually used
4. **`key_len`** - Length of index key used
5. **`rows`** - Estimated rows to examine
6. **`Extra`** - Additional information

**Example Analysis:**

```sql
-- ✅ Efficient query using index
mysql> EXPLAIN SELECT * FROM users WHERE email LIKE "m%";
+----+-------+-------+--------------------+------+------+----------+-----------------------+
| id | table | type  | key                | rows | filtered | Extra                 |
+----+-------+-------+--------------------+------+----------+-----------------------+
|  1 | users | range | users_email_unique | 1514 |   100.00 | Using index condition |
+----+-------+-------+--------------------+------+----------+-----------------------+

-- ❌ Inefficient query without index
mysql> EXPLAIN SELECT * FROM users WHERE email LIKE "%m";
+----+-------+------+-----+-------+----------+-------------+
| id | table | type | key | rows  | filtered | Extra       |
+----+-------+------+-----+-------+----------+-------------+
|  1 | users | ALL  | NULL| 19853 |    11.11 | Using where |
+----+-------+------+-----+-------+----------+-------------+
```

**Performance Difference:**

- With index: 1,514 rows examined
- Without index: 19,853 rows examined (13x more!)

---

## Best Practices

### 1. Index Design

- **Order matters:** Place most selective columns first
- **Consider query patterns:** Design indexes based on actual queries
- **Avoid over-indexing:** Each index has maintenance overhead

### 2. Column Selection

- **Highly selective columns first:** Columns with many unique values
- **Common query patterns:** Index columns frequently used in WHERE clauses
- **Compound indexes:** Better than multiple single-column indexes for multi-column queries

### 3. Query Optimization

- **Use leftmost prefix:** Structure queries to utilize leftmost columns
- **Avoid functions in WHERE clauses:** They prevent index usage
- **Prefer ranges over wildcards:** When possible, use range queries

### 4. Monitoring and Maintenance

- **Regular EXPLAIN analysis:** Check query execution plans
- **Monitor slow queries:** Identify problematic queries
- **Index usage statistics:** Remove unused indexes

---

## Performance Considerations

### Index Benefits

- **Faster SELECT queries:** Dramatic improvement in read performance
- **Efficient sorting:** Speeds up ORDER BY operations
- **Quick joins:** Improves JOIN performance
- **Unique constraints:** Enforces data integrity

### Index Costs

- **Storage overhead:** Indexes require additional disk space
- **Write performance:** INSERT, UPDATE, DELETE operations slower
- **Maintenance overhead:** Indexes must be updated with data changes

### Balancing Act

- **Read vs. Write:** More indexes help reads but hurt writes
- **Storage cost:** Consider disk space requirements
- **Application patterns:** Optimize for actual usage patterns

---

## Advanced Topics

### Covering Indexes

- Include all columns needed by a query in the index
- Eliminates need to access the actual table rows
- Significant performance improvement for specific queries

### Partial Indexes

- Index only part of a column's value
- Useful for long text columns
- Reduces index size while maintaining selectivity

### Index Hints

- Force MySQL to use specific indexes
- Use sparingly and only when necessary
- Can help in complex optimization scenarios

---

## Conclusion

MySQL indexes are powerful tools for query optimization, but they require careful planning and understanding. The leftmost prefix rule, query pattern analysis, and proper use of EXPLAIN are essential skills for database optimization. Remember that indexes are a trade-off between read performance and write performance, so design them based on your application's specific needs and query patterns.

---
