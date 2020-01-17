const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const validator = require("email-validator");

const { pool } = require("../db.js");

const privateKey = process.env.SECRET || "secret";
const SALT_ROUNDS = 10;
const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD || "manager";
const JWT_ALGORITHM = "HS256";
const prosumerRegistrationProsumersQuery = `INSERT INTO prosumers
	(account_id, battery_id)
	VALUES($1, $2)`;
const managerRegistrationAccountsQuery = `
	INSERT INTO accounts (email, password_hash)
	VALUES ($1, $2) 
	RETURNING id`;
const prosumerRegistrationAccountsQuery = `
	INSERT INTO accounts (email, password_hash)
	VALUES ($1, $2) 
	RETURNING id`;
const prosumerRegistrationBatteryQuery = `
	INSERT INTO batteries (max_capacity) VALUES (0) RETURNING id;
`;

async function registerManager(email, password, managerPassword) {
  if (email == null || password == null || managerPassword == null) {
    return null;
  }

  if (managerPassword !== MANAGER_PASSWORD) {
    return new Error("Invalid manager password");
  }

  if (!validator.validate(email)) {
    return new Error("Invalid email format");
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
    // Unique constraint violation code
    if (error.code == 23505) {
      return new Error("Email already exists");
    }
    console.log(`Failed to register manager: ${error}`);
    return new Error("Unknown error");
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

    const batteryRes = await client.query(prosumerRegistrationBatteryQuery);
    const batteryId = batteryRes.rows[0].id;

    await client.query(prosumerRegistrationProsumersQuery, [
      accountId,
      batteryId
    ]);
    const token = jwt.sign({ accountId, manager: false }, privateKey, {
      algorithm: JWT_ALGORITHM
    });
    await client.query("COMMIT");
    return token;
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(`Failed to register prosumer: ${error}`);
    // Unique constraint violation code
    if (error.code == 23505) {
      return new Error("Email already exists");
    }
    return new Error("Unknown error");
  } finally {
    client.release();
  }
}

module.exports = {
  registerManager,
  registerProsumer,
  prosumerRegistrationProsumersQuery,
  prosumerRegistrationAccountsQuery,
  prosumerRegistrationBatteryQuery,
  managerRegistrationAccountsQuery
};
