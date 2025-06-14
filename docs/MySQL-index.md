# Complete MySQL Indexes Guide

## Table of Contents

1. [Overview](#overview)
2. [How Indexes Work](#how-indexes-work)
3. [Types of Indexes](#types-of-indexes)
4. [Multiple-Column Indexes](#multiple-column-indexes)
5. [Leftmost Prefix Rule](#leftmost-prefix-rule)
6. [Query Patterns That Use Indexes](#query-patterns-that-use-indexes)
7. [Index Limitations](#index-limitations)
8. [Analyzing Index Usage](#analyzing-index-usage)
9. [Best Practices](#best-practices)
10. [Performance Considerations](#performance-considerations)

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

## Types of Indexes

### 1. B-Tree Indexes

**Characteristics:**

- Most commonly used index type
- Supported by most MySQL storage engines
- Exception: Memory engine didn't support it until MySQL 5.1
- Allows AUTO_INCREMENT columns starting from MySQL 5.1

**Use Cases:**

- Exact value matching
- Range queries
- Sorting operations
- Prefix matching

### 2. Hash Indexes

**Characteristics:**

- Less widely used than B-Tree indexes
- Optimized for specific use cases
- Very fast for equality comparisons

**Advantages:**

- Extremely fast for exact matches using `=` or `<=>`
- Perfect for key-value store applications

**Limitations:**

- Only supports equality comparisons
- Cannot be used for range queries (`<`, `>`, `BETWEEN`)
- Cannot optimize `ORDER BY` operations
- MySQL cannot determine row count between two values
- Only full keys can be used for searches (no partial key matching)
- Affects query optimization when switching from MyISAM/InnoDB to MEMORY engine

### 3. Spatial (R-Tree) Indexes

**Characteristics:**

- Designed for geographic applications
- Supported by MyISAM engine
- Works with geometric data types like GEOMETRY

**Features:**

- Indexes data across all dimensions simultaneously
- Doesn't require leftmost prefix in WHERE clauses
- Supports efficient lookups using any dimension combination
- Requires MySQL GIS functions like `MBRCONTAINS()`

**Limitations:**

- MySQL GIS support is limited
- Most applications use PostGIS with PostgreSQL for advanced GIS needs

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

## Index Limitations

### 1. Leftmost Prefix Requirement

**Problem:** Queries not using leftmost prefix cannot utilize the index

```sql
-- ❌ Cannot use index on (last_name, first_name)
SELECT * FROM test WHERE first_name='Michael';
```

### 2. OR Conditions

**Problem:** OR conditions often prevent index usage

```sql
-- ❌ Cannot efficiently use leftmost prefix
SELECT * FROM test WHERE last_name='Widenius' OR first_name='Michael';
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
-- Only col1 and col2 can be optimized, col3 cannot
SELECT * FROM test WHERE col1 = 'value' AND col2 > 10 AND col3 = 'another';
```

## Analyzing Index Usage

### Using EXPLAIN Command

**Basic Syntax:**

```sql
EXPLAIN SELECT * FROM table_name WHERE conditions;
```

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

## Conclusion

MySQL indexes are powerful tools for query optimization, but they require careful planning and understanding. The leftmost prefix rule, query pattern analysis, and proper use of EXPLAIN are essential skills for database optimization. Remember that indexes are a trade-off between read performance and write performance, so design them based on your application's specific needs and query patterns.
