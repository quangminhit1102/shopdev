const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "test", // Create a database named 'test' before running this script
  connectionLimit: 10,
});

// Initialize the database and create the table if it doesn't exist
async function initTable() {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255),
                email VARCHAR(255),
                created_at DATETIME
            )
        `);
    await pool.query("TRUNCATE TABLE users");
    console.log("Table initialized");
  } catch (err) {
    console.error("Error initializing table:", err);
    await pool.end();
  }
}

async function insertMillionRecords() {
  try {
    console.time("Insert Time");
    const batchSize = 1000;
    const totalRecords = 1000000;

    for (let i = 0; i < totalRecords; i += batchSize) {
      const values = [];
      for (let j = 0; j < batchSize && i + j < totalRecords; j++) {
        values.push([`user${i + j}`, `email${i + j}@example.com`, new Date()]);
      }

      const sql = "INSERT INTO users (username, email, created_at) VALUES ?";
      await pool.query(sql, [values]);

      if (i % 100000 === 0) {
        console.log(`Inserted ${i} records`);
      }
    }

    console.timeEnd("Insert Time");
    await pool.end();
  } catch (err) {
    console.error("Error:", err);
    await pool.end();
  }
}

initTable().catch((err) => {
  console.error("Initialization failed:", err);
  process.exit(1);
});
insertMillionRecords().catch((err) => {
  console.error("Insertion failed:", err);
  process.exit(1);
});
