```cmd
> mysql -h localhost -uroot -p123456


>show processlist
| Id | User            | Host            | db   | Command | Time  | State                  | Info             |
+----+-----------------+-----------------+------+---------+-------+------------------------+------------------+
|  5 | event_scheduler | localhost       | NULL | Daemon  | 28424 | Waiting on empty queue | NULL             |
| 12 | root            | localhost:57452 | NULL | Query   |     0 | init                   | show processlist |
```

# MySQL SHOW PROCESSLIST Field Guide

## Field Descriptions

| Field       | Description                                | Example                     |
| ----------- | ------------------------------------------ | --------------------------- |
| **Id**      | Unique connection identifier               | 8, 11, 14                   |
| **User**    | MySQL username                             | tipjs, root                 |
| **Host**    | Connection source (IP:port or hostname)    | 172.17.0.1:38174, localhost |
| **db**      | Currently selected database (NULL if none) | shopDEV, NULL               |
| **Command** | Current operation type                     | Sleep, Query, Connect       |
| **Time**    | Seconds since command started              | 1708 (28+ min), 0           |
| **State**   | Detailed thread state                      | NULL, init, Sending data    |
| **Info**    | SQL statement being executed               | show processlist, NULL      |

## Command Types

- **Sleep** : Connection is idle
- **Query** : Executing a SQL statement
- **Connect** : Establishing connection
- **Init DB** : Changing database
- **Execute (Prepared statement)**: The thread is executing a prepared statement.
- **Close** : The thread is closing a connection.
- **Quit** : The thread is in the process of disconnecting from the server.
  ...

## Common States

- **NULL**: No specific state
- **init**: Initializing
- **Sending data**: Processing results
- **Locked**: Waiting for lock
- **Sleep**: The thread is idle and waiting for the client to send a new query.
- **Query**: The thread is actively executing a SQL query.

## Useful Commands

```sql
SHOW PROCESSLIST;              -- Basic process list
SHOW FULL PROCESSLIST;         -- Full query text
KILL 8;                        -- Kill connection ID 8
SELECT * FROM information_schema.PROCESSLIST WHERE COMMAND != 'Sleep';
```

```cmd
>show variables like 'max_connection%';
+-----------------+-------+
| Variable_name   | Value |
+-----------------+-------+
| max_connections | 151   |
+-----------------+-------+

>show status like 'Threads%';
+-------------------+-------+
| Variable_name     | Value |
+-------------------+-------+
| Threads_cached    | 0     |
| Threads_connected | 1     |
| Threads_created   | 1     |
| Threads_running   | 2     |
+-------------------+-------+
```
