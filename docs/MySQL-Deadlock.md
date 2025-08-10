# MySQL Deadlock Guide

## What is a Deadlock?

A **deadlock** occurs when two or more transactions are waiting for each other to release locks, creating a circular dependency that prevents any of them from proceeding.

## How Deadlocks Happen

```
Transaction A: Locks Row 1 → Waits for Row 2
Transaction B: Locks Row 2 → Waits for Row 1
Result: Circular wait = DEADLOCK
```

## Common Deadlock Scenarios

### 1. Different Lock Order
```sql
-- Transaction A
BEGIN;
UPDATE users SET name = 'Alice' WHERE id = 1;  -- Locks row 1
UPDATE users SET name = 'Bob' WHERE id = 2;    -- Waits for row 2
COMMIT;

-- Transaction B (running simultaneously)
BEGIN;
UPDATE users SET name = 'Charlie' WHERE id = 2; -- Locks row 2
UPDATE users SET name = 'David' WHERE id = 1;   -- Waits for row 1
COMMIT;
```

### 2. Index vs Primary Key Lock
```sql
-- Transaction A
BEGIN;
SELECT * FROM orders WHERE customer_id = 100 FOR UPDATE; -- Index lock
UPDATE orders SET status = 'shipped' WHERE id = 50;      -- Primary key lock

-- Transaction B
BEGIN;
UPDATE orders SET status = 'cancelled' WHERE id = 50;    -- Primary key lock
SELECT * FROM orders WHERE customer_id = 100 FOR UPDATE; -- Index lock
```

### 3. INSERT and SELECT FOR UPDATE
```sql
-- Transaction A
BEGIN;
SELECT * FROM inventory WHERE product_id = 123 FOR UPDATE;
INSERT INTO order_items (product_id, quantity) VALUES (123, 5);

-- Transaction B
BEGIN;
INSERT INTO order_items (product_id, quantity) VALUES (123, 3);
SELECT * FROM inventory WHERE product_id = 123 FOR UPDATE;
```

## Deadlock Detection & Resolution

### MySQL's Automatic Handling
- **Detection**: MySQL automatically detects deadlocks using a wait-for graph
- **Resolution**: One transaction is chosen as a "victim" and rolled back
- **Error**: The victim receives error `1213: Deadlock found when trying to get lock`

### Checking Deadlock Information
```sql
-- View latest deadlock information
SHOW ENGINE INNODB STATUS\G

-- Enable deadlock logging
SET GLOBAL innodb_print_all_deadlocks = ON;

-- Check deadlock logs in error log file
```

## Prevention Strategies

**Summary**: The key to preventing deadlocks is eliminating circular dependencies between transactions. This is achieved by ensuring transactions acquire locks in a predictable, consistent manner and minimizing the time locks are held.

### 1. Consistent Lock Ordering
**Why it works**: When all transactions acquire locks in the same order, circular dependencies cannot form.

```sql
-- BAD: Different order in transactions
-- Transaction A: UPDATE id=1 then id=2
-- Transaction B: UPDATE id=2 then id=1

-- GOOD: Same order in all transactions
-- Both transactions: UPDATE id=1 then id=2 (order by primary key)
UPDATE users SET name = 'New' WHERE id IN (1,2) ORDER BY id;
```

### 2. Keep Transactions Short
**Why it works**: Shorter transactions hold locks for less time, reducing the window for deadlock conditions.

```sql
-- BAD: Long transaction
BEGIN;
SELECT * FROM users WHERE id = 1 FOR UPDATE;
-- ... complex business logic (network calls, etc.)
UPDATE users SET last_login = NOW() WHERE id = 1;
COMMIT;

-- GOOD: Short transaction
-- Do business logic outside transaction
BEGIN;
UPDATE users SET last_login = NOW() WHERE id = 1;
COMMIT;
```

### 3. Use Lower Isolation Levels
**Why it works**: Lower isolation levels require fewer locks, reducing lock contention and deadlock probability.

```sql
-- Reduce lock contention
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
-- or
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
```

### 4. Use Proper Indexes
**Why it works**: Good indexes allow precise locking of specific rows instead of locking entire ranges or tables.

```sql
-- Ensures efficient locking
CREATE INDEX idx_customer_date ON orders (customer_id, order_date);

-- Query will lock fewer rows
SELECT * FROM orders 
WHERE customer_id = 100 AND order_date = '2024-01-01' 
FOR UPDATE;
```

## Deadlock Handling in Application

### 1. Retry Logic
```python
import time
import mysql.connector

def execute_with_retry(query, max_retries=3):
    for attempt in range(max_retries):
        try:
            cursor.execute(query)
            connection.commit()
            return True
        except mysql.connector.Error as e:
            if e.errno == 1213:  # Deadlock error
                if attempt < max_retries - 1:
                    time.sleep(0.1 * (2 ** attempt))  # Exponential backoff
                    continue
                else:
                    raise
            else:
                raise
    return False
```

### 2. Transaction Timeout
```sql
-- Set lock timeout
SET SESSION innodb_lock_wait_timeout = 5;

-- Transaction will timeout if waiting too long
BEGIN;
SELECT * FROM users WHERE id = 1 FOR UPDATE;
-- If lock not available in 5 seconds, throws timeout error
```

## Best Practices

### ✅ DO
- Order operations consistently (by primary key)
- Keep transactions short and fast
- Use appropriate isolation levels
- Implement retry logic with exponential backoff
- Use proper indexes to reduce lock scope
- Access tables in the same order across transactions

### ❌ DON'T
- Hold locks for extended periods
- Mix different lock types unnecessarily  
- Use higher isolation levels than needed
- Ignore deadlock errors
- Access tables in random order
- Perform network I/O inside transactions

## Monitoring Queries

```sql
-- Check current locks
SELECT * FROM performance_schema.data_locks;

-- Monitor blocked transactions  
SELECT * FROM performance_schema.data_lock_waits;

-- View transaction status
SELECT * FROM information_schema.innodb_trx;

-- Deadlock count
SHOW STATUS LIKE 'Innodb_deadlocks';
```

## Key Takeaways

1. **Deadlocks are inevitable** in concurrent systems
2. **MySQL handles detection** automatically  
3. **Prevention is better** than handling
4. **Consistent ordering** is the most effective prevention
5. **Retry logic** is essential in applications
6. **Keep transactions short** and focused

---
*Remember: The goal isn't to eliminate all deadlocks, but to minimize them and handle them gracefully when they occur.*