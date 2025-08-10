# MySQL Isolation Levels

Isolation levels define how transactions interact with each other, controlling visibility of changes and preventing data anomalies.

## 1. READ UNCOMMITTED

- **Behavior**: Transactions can read uncommitted (dirty) data from others.
- **Risk**: Dirty reads, non-repeatable reads, phantom reads.
- **Use case**: Rare, mostly for performance.

```sql
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
```

## 2. READ COMMITTED

- **Behavior**: Only committed data is visible.
- **Risk**: Non-repeatable reads, phantom reads.
- **Default** in some DBMS (e.g., Oracle), **not MySQL**.

```sql
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

## 3. REPEATABLE READ (Default in MySQL)

- **Behavior**: Same rows read within a transaction remain consistent.

When you start a transaction, any row you query will look the same every time you query it again inside that same transaction, even if another transaction changes it in the meantime.
- **Risk**: Phantom reads.
- **MySQL InnoDB** prevents phantom reads using next-key locks.

```sql
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

## 4. SERIALIZABLE

- **Behavior**: Highest isolation; transactions executed sequentially.
- **Risk**: Lower performance due to locking.

```sql
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

---

## Quick Comparison

| Level            | Dirty Read | Non-repeatable Read | Phantom Read |
| ---------------- | ---------- | ------------------- | ------------ |
| READ UNCOMMITTED | Yes        | Yes                 | Yes          |
| READ COMMITTED   | No         | Yes                 | Yes          |
| REPEATABLE READ  | No         | No                  | Yes\*        |
| SERIALIZABLE     | No         | No                  | No           |

\*MySQL's InnoDB often prevents phantom reads too.

---

## Example

```sql
-- Set isolation level for current session
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;

START TRANSACTION;
SELECT * FROM orders WHERE id = 1;

-- Another session updates the row here...

-- Same query returns same result in current transaction
SELECT * FROM orders WHERE id = 1;
COMMIT;
```
