const { Pool } = require("pg");

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "gle";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_DATABASE = process.env.DB_DATABASE || "gle";

// Return object with empty functions if testing since tests run without database
// but still need the properties in order to be mocked.
const pool =
  process.env.NODE_ENV === "test"
    ? { connect() {}, query() {}, end() {}, on() {} }
    : new Pool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_DATABASE
      });

module.exports = { pool };
