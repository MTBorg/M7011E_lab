const { Client } = require("pg");

const clientConfig = {
  host: "localhost",
  user: "gle",
  password: "",
  database: "gle"
};

/**
 * Returns a database client
 */
function dbClient() {
  return new Client(clientConfig);
}

module.exports = { dbClient };
