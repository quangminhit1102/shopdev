# Database Partitioning & Sharding


**Sharding splits data across multiple servers or databases, while partitioning splits data within a single database instance**
This guide covers database partitioning (for SQL) and sharding (for NoSQL), which are techniques for splitting a large dataset into smaller, more manageable pieces. While logically treated as a single data store, the data is physically distributed.

---

## Why Partition or Shard? 🤔

* **Improved Query Performance**: Queries can scan only relevant partitions/shards instead of the entire dataset, leading to significantly faster data retrieval.
* **Enhanced Manageability**: Maintenance tasks (backups, index rebuilding) can be performed on individual pieces, reducing the impact on the overall system.
* **Increased Availability & Scalability**: If one partition/shard becomes unavailable, the others can remain accessible. It also allows for horizontal scaling by adding more servers to host new shards.

---

## Common Partitioning Strategies

The method used to divide the data is based on a "partitioning key" or "shard key."

* **Range Partitioning**: Data is distributed based on a continuous range of values (e.g., dates, ID numbers). Ideal for time-series data.
* **List Partitioning**: Data is distributed based on a list of discrete, predefined values (e.g., country codes, product categories).
* **Hash Partitioning**: Data is distributed evenly by applying a hash function to the partitioning key. Ideal for ensuring an even data distribution when no natural ranges or lists exist.

---

## Examples by Database System

### 1. PostgreSQL

PostgreSQL has robust, built-in support for declarative partitioning.

* **Range Partitioning (by `order_date`)**:

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

* **List Partitioning (by `country_code`)**:

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

* **Range Partitioning (by `order_year`)**:

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

* **Hash Partitioning (by `user_id` for even distribution)**:

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

* **Range Partitioning (by `log_date`)**:

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

* **Sharding a Collection**:
    You first enable sharding for a database, then define a shard key for a specific collection. The shard key determines how documents are distributed.

    ```javascript
    // Connect to a mongos instance (query router)
    // In the mongo shell:

    // 1. Enable sharding for the 'analytics' database
    sh.enableSharding("analytics")

    // 2. Shard the 'events' collection using a Ranged Shard Key on 'timestamp'
    // Good for time-series queries
    sh.shardCollection("analytics.events", { "timestamp": 1 })

    // OR

    // 2. Shard the 'users' collection using a Hashed Shard Key on '_id'
    // Good for ensuring even data distribution
    sh.shardCollection("analytics.users", { "_id": "hashed" })
    ```

### 5. Redis (Clustering)

Redis achieves partitioning through **Redis Cluster**. The entire keyspace is automatically split into 16,384 hash slots, and these slots are distributed among the master nodes in the cluster.

* **How it Works**:
    1. When you set up a Redis Cluster, it automatically partitions the data.
    2. When a client wants to access a key (e.g., `GET user:123`), it computes a hash of the key: `CRC16('user:123') % 16384`.
    3. The result is a slot number. The client (or cluster proxy) knows which node owns that slot and sends the command to the correct node directly.
    4. This is all handled automatically by the cluster and compliant client libraries.

* **Setup Example (Conceptual)**:
    You don't define partitions per key. You create the cluster, and it handles partitioning. The command to create a cluster looks like this:

    ```sh
    # This command sets up a 6-node cluster with 3 masters and 3 replicas
    redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 \
    127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \
    --cluster-replicas 1
    ```