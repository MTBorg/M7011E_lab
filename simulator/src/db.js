const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

pool.on("error", (err, _client) => {
  console.error(`Unexpected database error: ${err}`);
});

module.exports = { pool };
