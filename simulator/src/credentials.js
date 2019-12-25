const { pool } = require("./db.js");

const API_ADDRESS = "http://localhost:8080/graphql";

async function updateEmail(accountId, email) {
  try {
    const res = await pool.query(
      `
		UPDATE accounts
		SET email=$1
		WHERE id=$2
		RETURNING email`,
      [email, accountId]
    );
    return res.rows[0].email;
  } catch (error) {
    console.log(`Failed to update email ${error}`);
    return new Error(error);
  }
}

module.exports = { updateEmail };
