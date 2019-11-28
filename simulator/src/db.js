const { Pool } = require("pg");

// Return object with empty functions if testing since tests run without database
// but still need the properties in order to be mocked.
const pool =
  process.env.NODE_ENV === "test"
    ? { connect() {}, query() {}, end() {}, on() {} }
    : new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
      });

module.exports = { pool };
