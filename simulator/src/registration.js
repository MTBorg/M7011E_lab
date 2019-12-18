const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { pool } = require("./db.js");

const privateKey = process.env.SECRET || "secret";
const SALT_ROUNDS = 10;
const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD || "manager";
const JWT_ALGORITHM = "HS256";
const prosumerRegistrationProsumersQuery = `INSERT INTO prosumers
	(account_id)
	VALUES($1)`;
const managerRegistrationAccountsQuery = `
	INSERT INTO accounts (email, password_hash)
	VALUES ($1, $2) 
	RETURNING id`;
const prosumerRegistrationAccountsQuery = `
	INSERT INTO accounts (email, password_hash)
	VALUES ($1, $2) 
	RETURNING id`;

async function registerManager(email, password, managerPassword) {
  if (email == null || password == null || managerPassword == null) {
    return null;
  }

  if (managerPassword !== MANAGER_PASSWORD) {
    return null;
  }

  // Hash and salt the password
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const hash = bcrypt.hashSync(password, salt);

  const client = await pool.connect();
  try {
    client.query("BEGIN");
    const accountRes = await client.query(managerRegistrationAccountsQuery, [
      email,
      hash
    ]);
    const accountId = accountRes.rows[0].id;
    await client.query(
      `INSERT INTO managers
			(account_id)
			VALUES($1)`,
      [accountId]
    );
    const token = jwt.sign({ accountId, manager: true }, privateKey, {
      algorithm: JWT_ALGORITHM
    });
    await client.query("COMMIT");
    return token;
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(`Failed to register manager: ${error}`);
  } finally {
    client.release();
  }
  return null;
}

async function registerProsumer(email, password) {
  if (!email || !password) {
    return null;
  }

  // Hash and salt the password
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const hash = bcrypt.hashSync(password, salt);

  const client = await pool.connect();
  try {
    client.query("BEGIN");
    const accountRes = await client.query(prosumerRegistrationAccountsQuery, [
      email,
      hash
    ]);
    const accountId = accountRes.rows[0].id;
    await client.query(prosumerRegistrationProsumersQuery, [accountId]);
    const token = jwt.sign({ accountId, manager: false }, privateKey, {
      algorithm: JWT_ALGORITHM
    });
    await client.query("COMMIT");
    return token;
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(`Failed to register prosumer: ${error}`);
  } finally {
    client.release();
  }
  return null;
}

module.exports = {
  registerManager,
  registerProsumer,
  prosumerRegistrationProsumersQuery,
  prosumerRegistrationAccountsQuery,
  managerRegistrationAccountsQuery
};
