# Database Partitioning & Sharding

**Sharding splits data across multiple servers or databases, while partitioning splits data within a single database instance**
This guide covers database partitioning (for SQL) and sharding (for NoSQL), which are techniques for splitting a large dataset into smaller, more manageable pieces. While logically treated as a single data store, the data is physically distributed.

---

## Why Partition or Shard? 🤔

- **Improved Query Performance**: Queries can scan only relevant partitions/shards instead of the entire dataset, leading to significantly faster data retrieval.
- **Enhanced Manageability**: Maintenance tasks (backups, index rebuilding) can be performed on individual pieces, reducing the impact on the overall system.
- **Increased Availability & Scalability**: If one partition/shard becomes unavailable, the others can remain accessible. It also allows for horizontal scaling by adding more servers to host new shards.

---

## Common Partitioning Strategies

The method used to divide the data is based on a "partitioning key" or "shard key."

- **Range Partitioning**: Data is distributed based on a continuous range of values (e.g., dates, ID numbers). Ideal for time-series data.
- **List Partitioning**: Data is distributed based on a list of discrete, predefined values (e.g., country codes, product categories).
- **Hash Partitioning**: Data is distributed evenly by applying a hash function to the partitioning key. Ideal for ensuring an even data distribution when no natural ranges or lists exist.

---

## Examples by Database System

### 1. PostgreSQL

PostgreSQL has robust, built-in support for declarative partitioning.

- **Range Partitioning (by `order_date`)**:

  ```sql
  CREATE TABLE orders (
      order_id SERIAL,
      order_date DATE NOT NULL,
      amount DECIMAL(10, 2)
  ) PARTITION BY RANGE (order_date);

  CREATE TABLE orders_2025_q1 PARTITION OF orders
      FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
  CREATE TABLE orders_2025_q2 PARTITION OF orders
      FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
  ```

- **List Partitioning (by `country_code`)**:

  ```sql
  CREATE TABLE customers (
      customer_id SERIAL,
      country_code VARCHAR(3)
  ) PARTITION BY LIST (country_code);

  CREATE TABLE customers_vn PARTITION OF customers FOR VALUES IN ('VN');
  CREATE TABLE customers_us PARTITION OF customers FOR VALUES IN ('US');
  CREATE TABLE customers_others PARTITION OF customers DEFAULT;
  ```

### 2. MySQL

MySQL also provides built-in partitioning features.

- **Range Partitioning (by `order_year`)**:

  ```sql
  CREATE TABLE sales (
      sale_id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT,
      sale_year INT
  )
  PARTITION BY RANGE(sale_year) (
      PARTITION p0 VALUES LESS THAN (2024),
      PARTITION p1 VALUES LESS THAN (2025),
      PARTITION p2 VALUES LESS THAN (2026)
  );
  ```

- **Hash Partitioning (by `user_id` for even distribution)**:

  ```sql
  CREATE TABLE users (
      user_id INT,
      username VARCHAR(50)
  )
  PARTITION BY HASH(user_id)
  PARTITIONS 4; -- Create 4 partitions
  ```

### 3. SQL Server

SQL Server uses a two-step process: create a `PARTITION FUNCTION` (the logic) and a `PARTITION SCHEME` (the physical placement), then apply it to a table.

- **Range Partitioning (by `log_date`)**:

  ```sql
  -- 1. Define the function that specifies the range boundaries
  CREATE PARTITION FUNCTION LogDateRangePF (DATETIME2)
  AS RANGE RIGHT FOR VALUES ('2025-04-01', '2025-07-01', '2025-10-01');
  -- This creates 4 partitions: < Q2, Q2, Q3, >= Q4

  -- 2. Create a scheme to map partitions to filegroups
  CREATE PARTITION SCHEME LogDateRangePS
  AS PARTITION LogDateRangePF
  ALL TO ([PRIMARY]); -- Maps all partitions to the PRIMARY filegroup

  -- 3. Create the table on the partition scheme
  CREATE TABLE ApplicationLogs (
      log_id BIGINT IDENTITY(1,1) PRIMARY KEY,
      log_date DATETIME2 NOT NULL,
      message NVARCHAR(MAX)
  ) ON LogDateRangePS (log_date); -- Apply the scheme on the log_date column
  ```

### 4. MongoDB (Sharding)

In MongoDB, partitioning is called **sharding**. It distributes data across multiple servers (a shard cluster). This is for horizontal scaling.

- **Sharding a Collection**:
  You first enable sharding for a database, then define a shard key for a specific collection. The shard key determines how documents are distributed.

  ```javascript
  // Connect to a mongos instance (query router)
  // In the mongo shell:

  // 1. Enable sharding for the 'analytics' database
  sh.enableSharding("analytics");

  // 2. Shard the 'events' collection using a Ranged Shard Key on 'timestamp'
  // Good for time-series queries
  sh.shardCollection("analytics.events", { timestamp: 1 });

  // OR

  // 2. Shard the 'users' collection using a Hashed Shard Key on '_id'
  // Good for ensuring even data distribution
  sh.shardCollection("analytics.users", { _id: "hashed" });
  ```

### 5. Redis (Clustering)

Redis achieves partitioning through **Redis Cluster**. The entire keyspace is automatically split into 16,384 hash slots, and these slots are distributed among the master nodes in the cluster.

- **How it Works**:

  1. When you set up a Redis Cluster, it automatically partitions the data.
  2. When a client wants to access a key (e.g., `GET user:123`), it computes a hash of the key: `CRC16('user:123') % 16384`.
  3. The result is a slot number. The client (or cluster proxy) knows which node owns that slot and sends the command to the correct node directly.
  4. This is all handled automatically by the cluster and compliant client libraries.

- **Setup Example (Conceptual)**:
  You don't define partitions per key. You create the cluster, and it handles partitioning. The command to create a cluster looks like this:

  ```sh
  # This command sets up a 6-node cluster with 3 masters and 3 replicas
  redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 \
  127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \
  --cluster-replicas 1
  ```

## Auto create partition table in database with MySQL procedure

```sql
CREATE DEFINER=`root`@`%` PROCEDURE `create_table_auto_month`()
BEGIN
    -- Dùng để ghi lại tháng tiếp theo dài bao nhiêu
    DECLARE nextMonth varchar(20);
    -- Câu lệnh SQL dùng để ghi lại việc tạo bảng
    DECLARE createTableSQL varchar(5210);
    -- Sau khi thực hiện câu lệnh SQL tạo bảng, lấy số lượng bảng
    DECLARE tableCount int;
    -- Dùng để ghi tên bảng cần tạo
    DECLARE tableName varchar(20);
    -- Tiền tố được sử dụng cho bảng ghi
    DECLARE table_prefix varchar(20);

  -- Lấy ngày của tháng tiếp theo và gán nó cho biến nextMonth
  SELECT SUBSTR(
    replace(
        DATE_ADD(CURDATE(), INTERVAL 1 MONTH),
    '-', ''),
  1, 6) INTO @nextMonth;

  -- Đặt giá trị biến tiền tố bảng thành like this
  set @table_prefix = 'orders_';

  -- Xác định tên bảng = tiền tố bảng + tháng, tức là orders_202310, orders_202311 Định dạng này
  SET @tableName = CONCAT(@table_prefix, @nextMonth);
  -- Xác định câu lệnh SQL để tạo bảng
  set @createTableSQL=concat("create table if not exists ",@tableName,"
(
order_id INT, -- id hoá đơn
order_date DATE NOT NULL,
total_amount DECIMAL(10, 2),
PRIMARY KEY (order_id, order_date)
)");
 
  -- Sử dụng từ khóa PREPARE để tạo phần thân SQL được chuẩn bị sẵn sàng để thực thi
  PREPARE create_stmt from @createTableSQL;
  -- Sử dụng từ khóa EXECUTE để thực thi phần thân SQL đã chuẩn bị ở trên：create_stmt
  EXECUTE create_stmt;
  -- Giải phóng phần thân SQL đã tạo trước đó (giảm mức sử dụng bộ nhớ)
  DEALLOCATE PREPARE create_stmt;

  -- Sau khi thực hiện câu lệnh tạo bảng, hãy truy vấn số lượng bảng và lưu nó vào biến tableCount.
  SELECT
    COUNT(1) INTO @tableCount
  FROM
    information_schema.`TABLES`
  WHERE TABLE_NAME = @tableName;
 
  -- Kiểm tra xem bảng tương ứng đã tồn tại chưa
  SELECT @tableCount 'tableCount';

END
```

Make event for a specific time to call Procedure

```sql
-- First, ensure the event scheduler is enabled
SET GLOBAL event_scheduler = ON;

-- Create the event that runs on the first day of every month
DELIMITER $$

CREATE EVENT IF NOT EXISTS monthly_procedure_event
ON SCHEDULE EVERY 1 MONTH
STARTS '2025-07-01 00:00:00'  -- Start from next month's first day
DO
BEGIN
    -- Call your stored procedure here
    CALL your_procedure_name();
    
    -- Optional: Log the execution
    INSERT INTO event_log (event_name, execution_time, status) 
    VALUES ('monthly_procedure_event', NOW(), 'SUCCESS');
END$$

DELIMITER ;

-- Optional: Create a simple log table to track event executions
CREATE TABLE IF NOT EXISTS event_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(100),
    execution_time DATETIME,
    status VARCHAR(20),
    error_message TEXT NULL
);

-- Check if the event was created successfully
SHOW EVENTS LIKE 'monthly_procedure_event';

-- To view event status and next execution time
SELECT 
    EVENT_NAME,
    EVENT_DEFINITION,
    INTERVAL_VALUE,
    INTERVAL_FIELD,
    STATUS,
    STARTS,
    NEXT_EXECUTION_TIME
FROM INFORMATION_SCHEMA.EVENTS 
WHERE EVENT_NAME = 'monthly_procedure_event';

-- Alternative: More precise scheduling for first day at specific time
/*
DELIMITER $$

CREATE EVENT IF NOT EXISTS monthly_procedure_event_precise
ON SCHEDULE EVERY 1 MONTH
STARTS DATE_ADD(DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY), INTERVAL 2 HOUR)  -- First day of next month at 2 AM
DO
BEGIN
    CALL your_procedure_name();
END$$

DELIMITER ;
*/

-- To modify the event later:
-- ALTER EVENT monthly_procedure_event ON SCHEDULE EVERY 1 MONTH STARTS '2025-08-01 00:00:00';

-- To disable the event:
-- ALTER EVENT monthly_procedure_event DISABLE;

-- To enable the event:
-- ALTER EVENT monthly_procedure_event ENABLE;

-- To drop the event:
-- DROP EVENT IF EXISTS monthly_procedure_event;
```
