const bcrypt = require("bcryptjs");
const { pool } = require("./db.js");

const SALT_ROUNDS = 10;

const API_ADDRESS = "http://localhost:8080/graphql";
const UPDATE_EMAIL_QUERY = `
		UPDATE accounts
		SET email=$1
		WHERE id=$2
		RETURNING email`;
const UPDATE_PASSWORD_QUERY = `
		UPDATE accounts
		SET password_hash=$1
		WHERE id=$2
		RETURNING password_hash`;

async function updateEmail(accountId, email) {
  try {
    const res = await pool.query(UPDATE_EMAIL_QUERY, [email, accountId]);
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

    const res = await pool.query(UPDATE_PASSWORD_QUERY, [hash, accountId]);
    return res.rows[0].password_hash;
  } catch (error) {
    console.log(`Failed to update password: ${error}`);
    return new Error(error);
  }
}

async function deleteAccount(accountId) {
  const client = await pool.connect();
  let status = false;
  try {
    client.query("BEGIN");
    const deleteProsumerPromise = client.query(
      `DELETE FROM prosumers WHERE account_id=$1`,
      [accountId]
    );
    const deleteManagerPromise = client.query(
      "DELETE FROM managers WHERE account_id=$1",
      [accountId]
    );

    const [prosumerResponse, managerResponse] = await Promise.all([
      deleteProsumerPromise,
      deleteManagerPromise
    ]);

    const accountResponse = await client.query(
      "DELETE FROM accounts WHERE id=$1",
      [accountId]
    );
    await client.query("COMMIT");

    // If any of the queries delete any number of rows the action is considered
    // successful
    status =
      prosumerResponse.rowCount !== 0 ||
      managerResponse.rowCount !== 0 ||
      accountResponse.rowCount !== 0;
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(`Failed to delete user: ${error}`);
    status = false;
  } finally {
    client.release();
  }
  return status;
}

async function deleteProsumerAccount(prosumerId) {
  if (!prosumerId) {
    return false;
  }
  const client = await pool.connect();
  let status = false;
  try {
    client.query("BEGIN");
    const prosumerResponse = await client.query(
      `DELETE FROM prosumers WHERE id=$1 RETURNING account_id`,
      [prosumerId]
    );
    const accountResponse = await client.query(
      "DELETE FROM accounts WHERE id=$1",
      [prosumerResponse.rows[0].account_id]
    );

    await client.query("COMMIT");

    // If both of the queries delete any number of rows the action is considered
    // successful
    status = prosumerResponse.rowCount !== 0 && accountResponse.rowCount !== 0;
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(`Failed to delete prosumer: ${error}`);
    status = false;
  } finally {
    client.release();
  }
  return status;
}

module.exports = {
  updateEmail,
  updatePassword,
  deleteAccount,
  deleteProsumerAccount,
  UPDATE_EMAIL_QUERY,
  UPDATE_PASSWORD_QUERY
};
