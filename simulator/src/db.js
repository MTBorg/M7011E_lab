const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "gle",
  password: "",
  database: "gle"
});

pool.on("error", (err, _client) => {
  console.error(`Unexpected database error: ${err}`);
});

module.exports = { pool };
