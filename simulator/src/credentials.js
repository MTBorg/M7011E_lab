const bcrypt = require("bcryptjs");
const { pool } = require("./db.js");

const SALT_ROUNDS = 10;

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

async function updatePassword(accountId, password) {
  try {
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    const hash = bcrypt.hashSync(password, salt);

    const res = await pool.query(
      `
		UPDATE accounts
		SET password_hash=$1
		WHERE id=$2
		RETURNING password_hash`,
      [hash, accountId]
    );
    return res.rows[0].password_hash;
  } catch (error) {
    console.log(`Failed to update password: ${error}`);
    return new Error(error);
  }
}

module.exports = { updateEmail, updatePassword };
