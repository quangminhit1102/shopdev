# SQL Interview Topics and Examples

## Table of Contents
1. [Basic SQL Queries](#1-basic-sql-queries)
2. [SQL Joins](#2-sql-joins)
3. [Aggregate Functions](#3-aggregate-functions)
4. [Subqueries](#4-subqueries)
5. [UNION, INTERSECT, and EXCEPT](#5-union-intersect-and-except)
6. [Window Functions](#6-window-functions)
7. [Common Table Expressions (CTEs)](#7-common-table-expressions-ctes)
8. [Indexes and Performance Optimization](#8-indexes-and-performance-optimization)
9. [Transactions](#9-transactions)
10. [Stored Procedures and Functions](#10-stored-procedures-and-functions)
11. [Triggers](#11-triggers)
12. [Data Definition Language (DDL)](#12-data-definition-language-ddl)
13. [Data Manipulation Language (DML)](#13-data-manipulation-language-dml)
14. [JSON and Semi-structured Data](#14-json-and-semi-structured-data)
15. [PIVOT and UNPIVOT Operations](#15-pivot-and-unpivot-operations)
16. [Analytical Functions and OLAP](#16-analytical-functions-and-olap)
17. [Temporal Tables and Historical Data](#17-temporal-tables-and-historical-data)
18. [Advanced JOIN Techniques](#18-advanced-join-techniques)
19. [MERGE Operations (Upsert)](#19-merge-operations-upsert)
20. [Handling NULL Values](#20-handling-null-values)
21. [String Functions and Pattern Matching](#21-string-functions-and-pattern-matching)
22. [Date and Time Functions](#22-date-and-time-functions)
23. [Views and Materialized Views](#23-views-and-materialized-views)
24. [Conditional Logic in SQL](#24-conditional-logic-in-sql)
25. [Performance Troubleshooting and Query Tuning](#25-performance-troubleshooting-and-query-tuning)

## 1. Basic SQL Queries

The foundation of SQL involves selecting, filtering, and sorting data.

**Example:**
```sql
-- SELECT statement with filtering and sorting
SELECT 
    employee_id,
    first_name,
    last_name,
    department,
    salary
FROM 
    employees
WHERE 
    department = 'Marketing'
    AND salary > 50000
ORDER BY 
    salary DESC;
```

## 2. SQL Joins

Joins combine rows from different tables based on related columns.

**Types of Joins:**
- **INNER JOIN**: Returns matching rows from both tables
- **LEFT JOIN**: Returns all rows from left table and matching rows from right table
- **RIGHT JOIN**: Returns all rows from right table and matching rows from left table
- **FULL OUTER JOIN**: Returns all rows when there's a match in either table
- **CROSS JOIN**: Returns Cartesian product of both tables

**Example:**
```sql
-- INNER JOIN example
SELECT 
    e.employee_id,
    e.first_name,
    e.last_name,
    d.department_name
FROM 
    employees e
INNER JOIN 
    departments d ON e.department_id = d.department_id;

-- LEFT JOIN example
SELECT 
    c.customer_id,
    c.customer_name,
    COUNT(o.order_id) AS order_count
FROM 
    customers c
LEFT JOIN 
    orders o ON c.customer_id = o.customer_id
GROUP BY 
    c.customer_id, c.customer_name;
```

## 3. Aggregate Functions

Aggregate functions perform calculations on a set of values and return a single value.

**Common Aggregate Functions:**
- COUNT()
- SUM()
- AVG()
- MIN()
- MAX()

**Example:**
```sql
-- Basic aggregations with GROUP BY
SELECT 
    department,
    COUNT(*) AS employee_count,
    AVG(salary) AS avg_salary,
    MAX(salary) AS max_salary,
    MIN(hire_date) AS earliest_hire
FROM 
    employees
GROUP BY 
    department;

-- HAVING clause with aggregates
SELECT 
    department,
    AVG(salary) AS avg_salary
FROM 
    employees
GROUP BY 
    department
HAVING 
    AVG(salary) > 60000;
```

## 4. Subqueries

A subquery is a query nested inside another query.

**Types of Subqueries:**
- Single-row subqueries (return one row)
- Multi-row subqueries (return multiple rows)
- Correlated subqueries (reference outer query)

**Example:**
```sql
-- Subquery in WHERE clause
SELECT 
    employee_id,
    first_name,
    last_name,
    salary
FROM 
    employees
WHERE 
    salary > (SELECT AVG(salary) FROM employees);

-- Correlated subquery
SELECT 
    d.department_name,
    (SELECT COUNT(*) FROM employees e WHERE e.department_id = d.department_id) AS employee_count
FROM 
    departments d;

-- Subquery in FROM clause
SELECT 
    dept_avg.department,
    dept_avg.avg_salary
FROM 
    (SELECT department, AVG(salary) AS avg_salary FROM employees GROUP BY department) AS dept_avg
WHERE 
    dept_avg.avg_salary > 55000;
```

## 5. UNION, INTERSECT, and EXCEPT

Set operations combine results from multiple SELECT statements.

**Example:**
```sql
-- UNION: combines results and removes duplicates
SELECT product_id, product_name FROM products_2023
UNION
SELECT product_id, product_name FROM products_2024;

-- UNION ALL: combines results and keeps duplicates
SELECT product_id, product_name FROM products_2023
UNION ALL
SELECT product_id, product_name FROM products_2024;

-- INTERSECT: returns rows that appear in both result sets
SELECT customer_id FROM customers_online
INTERSECT
SELECT customer_id FROM customers_retail;

-- EXCEPT: returns rows from first query that don't appear in second
SELECT employee_id FROM employees_all
EXCEPT
SELECT employee_id FROM employees_terminated;
```

## 6. Window Functions

Window functions perform calculations across a set of rows related to the current row.

**Example:**
```sql
-- Basic window function
SELECT 
    employee_name,
    department,
    salary,
    AVG(salary) OVER(PARTITION BY department) AS dept_avg,
    salary - AVG(salary) OVER(PARTITION BY department) AS diff_from_avg
FROM 
    employees;

-- Ranking functions
SELECT 
    employee_name,
    department,
    salary,
    RANK() OVER(PARTITION BY department ORDER BY salary DESC) AS dept_rank,
    DENSE_RANK() OVER(ORDER BY salary DESC) AS overall_dense_rank,
    ROW_NUMBER() OVER(ORDER BY salary DESC) AS overall_row_num
FROM 
    employees;

-- Running totals
SELECT 
    sale_date,
    amount,
    SUM(amount) OVER(ORDER BY sale_date) AS running_total
FROM 
    sales;
```

## 7. Common Table Expressions (CTEs)

CTEs create named temporary result sets that can be referenced within a SELECT, INSERT, UPDATE, or DELETE statement.

**Example:**
```sql
-- Basic CTE
WITH high_salary_employees AS (
    SELECT employee_id, first_name, last_name, salary, department_id
    FROM employees
    WHERE salary > 75000
)
SELECT 
    h.first_name,
    h.last_name,
    d.department_name
FROM 
    high_salary_employees h
JOIN 
    departments d ON h.department_id = d.department_id;

-- Recursive CTE for hierarchy
WITH RECURSIVE emp_hierarchy AS (
    -- Base case: top level manager
    SELECT employee_id, employee_name, manager_id, 1 AS level
    FROM employees
    WHERE manager_id IS NULL
    
    UNION ALL
    
    -- Recursive part: employees with managers
    SELECT e.employee_id, e.employee_name, e.manager_id, eh.level + 1
    FROM employees e
    JOIN emp_hierarchy eh ON e.manager_id = eh.employee_id
)
SELECT * FROM emp_hierarchy ORDER BY level, employee_name;
```

## 8. Indexes and Performance Optimization

Understanding how indexes work and how to optimize queries is crucial for performance.

**Example:**
```sql
-- Creating a basic index
CREATE INDEX idx_employees_dept ON employees(department_id);

-- Creating a composite index
CREATE INDEX idx_employees_dept_salary ON employees(department_id, salary);

-- Creating a unique index
CREATE UNIQUE INDEX idx_customers_email ON customers(email);

-- Using EXPLAIN to analyze query execution plan (PostgreSQL)
EXPLAIN ANALYZE
SELECT e.employee_name, d.department_name
FROM employees e
JOIN departments d ON e.department_id = d.department_id
WHERE e.salary > 50000;
```

## 9. Transactions

Transactions group a set of tasks into a single execution unit.

**ACID Properties:**
- **Atomicity**: All operations complete successfully or none of them do
- **Consistency**: Database remains in a consistent state before and after transaction
- **Isolation**: Transactions are isolated from each other
- **Durability**: Once committed, changes are permanent

**Example:**
```sql
-- Basic transaction
BEGIN TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE account_id = 123;
UPDATE accounts SET balance = balance + 100 WHERE account_id = 456;

-- Check if both accounts have valid balances
IF EXISTS (SELECT 1 FROM accounts WHERE account_id IN (123, 456) AND balance < 0) THEN
    ROLLBACK;
ELSE
    COMMIT;
END IF;

-- Setting isolation level (SQL Server syntax)
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN TRANSACTION;
    -- Statements...
COMMIT;
```

## 10. Stored Procedures and Functions

Stored procedures and functions are SQL code that can be saved and reused.

**Example:**
```sql
-- Creating a stored procedure (SQL Server)
CREATE PROCEDURE transfer_funds
    @from_account INT,
    @to_account INT,
    @amount DECIMAL(10,2)
AS
BEGIN
    BEGIN TRANSACTION;
    
    UPDATE accounts SET balance = balance - @amount WHERE account_id = @from_account;
    UPDATE accounts SET balance = balance + @amount WHERE account_id = @to_account;
    
    IF EXISTS (SELECT 1 FROM accounts WHERE account_id = @from_account AND balance < 0)
    BEGIN
        ROLLBACK;
        RETURN -1; -- Insufficient funds
    END
    
    COMMIT;
    RETURN 0; -- Success
END;

-- Creating a function (PostgreSQL)
CREATE OR REPLACE FUNCTION calculate_tax(amount DECIMAL) 
RETURNS DECIMAL AS $$
BEGIN
    RETURN amount * 0.08;
END;
$$ LANGUAGE plpgsql;

-- Using the function
SELECT 
    product_name, 
    price, 
    calculate_tax(price) AS tax_amount,
    price + calculate_tax(price) AS total_price
FROM 
    products;
```

## 11. Triggers

Triggers are special stored procedures that automatically execute when an event (INSERT, UPDATE, DELETE) occurs.

**Example:**
```sql
-- Creating a trigger (PostgreSQL)
CREATE OR REPLACE FUNCTION update_modified_timestamp() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_timestamp
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();

-- Audit trigger (SQL Server)
CREATE TRIGGER employee_audit_trigger
ON employees
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    DECLARE @action VARCHAR(10);
    
    IF EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
        SET @action = 'UPDATE';
    ELSE IF EXISTS (SELECT * FROM inserted)
        SET @action = 'INSERT';
    ELSE
        SET @action = 'DELETE';
    
    INSERT INTO audit_log (table_name, action, user_id, action_date)
    VALUES ('employees', @action, CURRENT_USER, GETDATE());
END;
```

## 12. Data Definition Language (DDL)

DDL statements are used to define, modify, and remove database objects.

**Example:**
```sql
-- Creating a table
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    signup_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Adding a column
ALTER TABLE customers
ADD COLUMN phone_number VARCHAR(20);

-- Adding a constraint
ALTER TABLE customers
ADD CONSTRAINT chk_email CHECK (email LIKE '%@%.%');

-- Creating a view
CREATE VIEW active_customers AS
SELECT customer_id, first_name, last_name, email
FROM customers
WHERE is_active = TRUE;

-- Dropping a table
DROP TABLE IF EXISTS temp_customers;
```

## 13. Data Manipulation Language (DML)

DML statements are used to manage data within database objects.

**Example:**
```sql
-- INSERT statement
INSERT INTO employees (employee_id, first_name, last_name, department_id, salary)
VALUES (1001, 'John', 'Smith', 3, 65000);

-- Multiple inserts
INSERT INTO employees (employee_id, first_name, last_name, department_id, salary)
VALUES 
    (1002, 'Jane', 'Doe', 2, 70000),
    (1003, 'Michael', 'Brown', 3, 62000),
    (1004, 'Sarah', 'Johnson', 1, 75000);

-- UPDATE statement
UPDATE employees
SET salary = salary * 1.1
WHERE department_id = 3;

-- DELETE statement
DELETE FROM temporary_accounts
WHERE created_date < CURRENT_DATE - INTERVAL '30 days';
```

## 14. JSON and Semi-structured Data

Modern databases support JSON and other semi-structured data formats.

**Example:**
```sql
-- PostgreSQL JSON functions
-- Creating a table with JSON
CREATE TABLE user_profiles (
    user_id INT PRIMARY KEY,
    profile JSONB
);

-- Inserting JSON data
INSERT INTO user_profiles (user_id, profile)
VALUES (
    1, 
    '{"name": "John Smith", "email": "john@example.com", "preferences": {"theme": "dark", "notifications": true}}'
);

-- Querying JSON data
SELECT
    user_id,
    profile->>'name' AS name,
    profile->>'email' AS email,
    profile->'preferences'->>'theme' AS theme
FROM
    user_profiles
WHERE
    profile->'preferences'->>'notifications' = 'true';

-- Updating JSON data
UPDATE user_profiles
SET profile = jsonb_set(profile, '{preferences,theme}', '"light"')
WHERE user_id = 1;
```

## 15. PIVOT and UNPIVOT Operations

PIVOT and UNPIVOT operations transform data between row and column format.

**Example:**
```sql
-- PIVOT example (SQL Server)
SELECT 
    product_name,
    [Q1], [Q2], [Q3], [Q4]
FROM 
    (SELECT 
        product_name,
        quarter,
        sales_amount
     FROM 
        sales) AS source_data
PIVOT
(
    SUM(sales_amount)
    FOR quarter IN ([Q1], [Q2], [Q3], [Q4])
) AS pivot_table;

-- Equivalent in PostgreSQL using CASE statements
SELECT 
    product_name,
    SUM(CASE WHEN quarter = 'Q1' THEN sales_amount ELSE 0 END) AS Q1,
    SUM(CASE WHEN quarter = 'Q2' THEN sales_amount ELSE 0 END) AS Q2,
    SUM(CASE WHEN quarter = 'Q3' THEN sales_amount ELSE 0 END) AS Q3,
    SUM(CASE WHEN quarter = 'Q4' THEN sales_amount ELSE 0 END) AS Q4
FROM 
    sales
GROUP BY 
    product_name;
```

## 16. Analytical Functions and OLAP

Analytical functions are important for business intelligence and data warehousing.

**Example:**
```sql
-- ROLLUP for subtotals (hierarchical)
SELECT 
    COALESCE(region, 'All Regions') AS region,
    COALESCE(product_category, 'All Categories') AS category,
    SUM(sales_amount) AS total_sales
FROM 
    sales
GROUP BY 
    ROLLUP(region, product_category);

-- CUBE for all combination subtotals
SELECT 
    COALESCE(region, 'All Regions') AS region,
    COALESCE(year, 'All Years') AS year,
    SUM(sales_amount) AS total_sales
FROM 
    sales
GROUP BY 
    CUBE(region, year);

-- Window functions with frames
SELECT 
    sales_date,
    sales_amount,
    AVG(sales_amount) OVER(
        ORDER BY sales_date
        ROWS BETWEEN 3 PRECEDING AND CURRENT ROW
    ) AS moving_avg_4days
FROM 
    daily_sales;
```

## 17. Temporal Tables and Historical Data

Handling time-based data and historical changes is a common requirement.

**Example:**
```sql
-- SQL Server temporal table
CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    employee_name VARCHAR(100),
    department VARCHAR(50),
    salary DECIMAL(10,2),
    valid_from DATETIME2 GENERATED ALWAYS AS ROW START,
    valid_to DATETIME2 GENERATED ALWAYS AS ROW END,
    PERIOD FOR SYSTEM_TIME (valid_from, valid_to)
) WITH (SYSTEM_VERSIONING = ON);

-- Querying point-in-time data
SELECT * FROM employees 
FOR SYSTEM_TIME AS OF '2023-01-15';

-- Alternative approach using effective dates
SELECT 
    employee_id,
    employee_name,
    department,
    salary
FROM 
    employee_history
WHERE 
    effective_start_date <= '2023-01-15'
    AND effective_end_date > '2023-01-15';
```

## 18. Advanced JOIN Techniques

Mastering different join types and techniques is crucial for data relationships.

**Example:**
```sql
-- Self JOIN
SELECT 
    e.employee_name AS employee,
    m.employee_name AS manager
FROM 
    employees e
LEFT JOIN 
    employees m ON e.manager_id = m.employee_id;

-- Multiple table JOINs
SELECT 
    c.customer_name,
    o.order_id,
    o.order_date,
    p.product_name,
    oi.quantity,
    oi.unit_price
FROM 
    customers c
JOIN 
    orders o ON c.customer_id = o.customer_id
JOIN 
    order_items oi ON o.order_id = oi.order_id
JOIN 
    products p ON oi.product_id = p.product_id
WHERE 
    o.order_date BETWEEN '2023-01-01' AND '2023-12-31';

-- Using JOIN with aggregation
SELECT 
    d.department_name,
    COUNT(e.employee_id) AS employee_count,
    AVG(e.salary) AS avg_salary
FROM 
    departments d
LEFT JOIN 
    employees e ON d.department_id = e.department_id
GROUP BY 
    d.department_id, d.department_name;
```

## 19. MERGE Operations (Upsert)

MERGE combines INSERT, UPDATE, and DELETE operations based on a condition.

**Example:**
```sql
-- SQL Server MERGE statement
MERGE INTO target_products AS target
USING source_products AS source
ON target.product_id = source.product_id
WHEN MATCHED AND target.price <> source.price THEN
    UPDATE SET 
        target.price = source.price,
        target.last_updated = CURRENT_TIMESTAMP
WHEN NOT MATCHED BY TARGET THEN
    INSERT (product_id, product_name, price, category)
    VALUES (source.product_id, source.product_name, source.price, source.category)
WHEN NOT MATCHED BY SOURCE THEN
    DELETE;

-- PostgreSQL upsert with ON CONFLICT
INSERT INTO products (product_id, product_name, price, stock)
VALUES (101, 'Smartphone X', 699.99, 50)
ON CONFLICT (product_id) 
DO UPDATE SET 
    price = EXCLUDED.price,
    stock = products.stock + EXCLUDED.stock;
```

## 20. Handling NULL Values

Understanding NULL behavior and functions is important for data integrity.

**Example:**
```sql
-- NULL handling functions
SELECT 
    employee_id,
    first_name,
    last_name,
    COALESCE(department, 'Unassigned') AS department,
    NULLIF(division, department) AS different_division,
    CASE 
        WHEN phone IS NULL THEN 'No Phone'
        ELSE phone
    END AS contact_number
FROM 
    employees;

-- NULL in filtering
SELECT * FROM customers WHERE phone IS NULL;
SELECT * FROM customers WHERE phone IS NOT NULL;

-- NULL in joins (watch out for NULL equality!)
SELECT 
    c.customer_name,
    COALESCE(o.order_count, 0) AS order_count
FROM 
    customers c
LEFT JOIN 
    (SELECT customer_id, COUNT(*) AS order_count FROM orders GROUP BY customer_id) o
    ON c.customer_id = o.customer_id;
```

## 21. String Functions and Pattern Matching

String manipulation is common in SQL queries for data cleaning and transformation.

**Example:**
```sql
-- String functions
SELECT 
    product_id,
    product_name,
    UPPER(product_name) AS upper_name,
    LOWER(category) AS lower_category,
    LENGTH(product_name) AS name_length,
    SUBSTRING(product_name, 1, 10) AS short_name,
    CONCAT(product_name, ' (', category, ')') AS full_description,
    REPLACE(description, 'old', 'new') AS updated_description
FROM 
    products;

-- Pattern matching with LIKE
SELECT * FROM employees WHERE last_name LIKE 'S%';
SELECT * FROM employees WHERE email LIKE '%@gmail.com';

-- Pattern matching with REGEXP (PostgreSQL)
SELECT * FROM employees WHERE email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
```

## 22. Date and Time Functions

Handling dates and times effectively is crucial for time-based analysis.

**Example:**
```sql
-- Date/time functions
SELECT 
    order_id,
    order_date,
    EXTRACT(YEAR FROM order_date) AS order_year,
    EXTRACT(MONTH FROM order_date) AS order_month,
    EXTRACT(DAY FROM order_date) AS order_day,
    CURRENT_DATE AS today,
    CURRENT_DATE - order_date AS days_since_order,
    DATE_TRUNC('month', order_date) AS month_start,
    order_date + INTERVAL '30 days' AS due_date
FROM 
    orders;

-- Date range queries
SELECT * FROM orders 
WHERE order_date BETWEEN '2023-01-01' AND '2023-12-31';

-- Date difference calculations
SELECT 
    employee_name,
    hire_date,
    CURRENT_DATE AS today,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date)) AS years_employed
FROM 
    employees;
```

## 23. Views and Materialized Views

Views and materialized views help simplify complex queries and improve performance.

**Example:**
```sql
-- Creating a view
CREATE VIEW employee_details AS
SELECT 
    e.employee_id,
    e.first_name,
    e.last_name,
    d.department_name,
    e.salary,
    e.hire_date
FROM 
    employees e
JOIN 
    departments d ON e.department_id = d.department_id;

-- Using a view
SELECT * FROM employee_details
WHERE department_name = 'Marketing';

-- Creating a materialized view (PostgreSQL)
CREATE MATERIALIZED VIEW monthly_sales_summary AS
SELECT 
    DATE_TRUNC('month', order_date) AS month,
    product_category,
    SUM(amount) AS total_sales
FROM 
    sales
GROUP BY 
    DATE_TRUNC('month', order_date), product_category;

-- Refreshing a materialized view
REFRESH MATERIALIZED VIEW monthly_sales_summary;
```

## 24. Conditional Logic in SQL

Handling conditional logic using CASE expressions and related techniques.

**Example:**
```sql
-- CASE expressions
SELECT 
    order_id,
    amount,
    CASE 
        WHEN amount < 100 THEN 'Small'
        WHEN amount BETWEEN 100 AND 1000 THEN 'Medium'
        ELSE 'Large'
    END AS order_size,
    CASE 
        WHEN payment_method = 'credit' THEN amount * 0.97 -- 3% discount
        ELSE amount
    END AS final_amount
FROM 
    orders;

-- Conditional aggregation
SELECT 
    department,
    COUNT(*) AS total_employees,
    SUM(CASE WHEN salary > 75000 THEN 1 ELSE 0 END) AS high_salary_count,
    AVG(CASE WHEN gender = 'F' THEN salary ELSE NULL END) AS avg_female_salary,
    AVG(CASE WHEN gender = 'M' THEN salary ELSE NULL END) AS avg_male_salary
FROM 
    employees
GROUP BY 
    department;
```

## 25. Performance Troubleshooting and Query Tuning

Identifying and resolving SQL performance issues.

**Example:**
```sql
-- Identifying slow queries (PostgreSQL)
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM 
    pg_stat_statements
ORDER BY 
    mean_time DESC
LIMIT 10;

-- Checking indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM 
    pg_indexes
WHERE 
    schemaname = 'public';

-- Analyzing a specific query
EXPLAIN ANALYZE
SELECT 
    c.customer_name,
    SUM(o.amount) AS total_purchases
FROM 
    customers c
JOIN 
    orders o ON c.customer_id = o.customer_id
WHERE 
    o.order_date >= '2023-01-01'
GROUP BY 
    c.customer_id, c.customer_name
HAVING 
    SUM(o.amount) > 1000
ORDER BY 
    total_purchases DESC;
```
