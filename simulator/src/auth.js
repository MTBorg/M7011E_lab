const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { pool } = require("./db.js");

const privateKey = process.env.SECRET || "secret";
const JWT_ALGORITHM = "HS256";
const SALT_ROUNDS = 10;
const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD || "admin";

function authMiddleWare(req, res, next) {
  if (req.headers.authtoken) {
    const token = req.headers.authtoken;
    const user = jwt.verify(token, privateKey);

    // Validate the fields of the token
    if (user == null || user.accountId == null || user.manager == null) {
      res.status(401).send({
        error:
          "Invalid token. Try clearing your cache or to log out and in again."
      });
      next(res);
    }

    req.user = user;
  }
  next();
}

const authenticateLoggedIn = next => (parent, args, context, resolveInfo) => {
  if (context.user) {
    return next(parent, args, context, resolveInfo);
  }
  return new Error("Not authorized: not logged in");
};

const authenticateIsMe = next => (parent, args, context, resolveInfo) => {
  if (context.user.id === args.id) {
    return next(parent, args, context, resolveInfo);
  }
  return new Error("Not authorized: access to resource denied");
};

const authenticateIsManager = next => (parent, args, context, resolveInfo) => {
  if (context.user.manager) {
    return next(parent, args, context, resolveInfo);
  }
  return new Error("Not authorized: insufficient role");
};

async function userIsManager(email) {
  const res = await pool.query(
    `
			SELECT EXISTS(
				SELECT * 
				FROM managers 
				INNER JOIN accounts ON managers.account_id=accounts.id
			)
		`
  );
  return res.rows[0].exists;
}

async function checkAccountCredentials(accountId, password) {
  try {
    const res = await pool.query(
      "SELECT password_hash FROM accounts WHERE id=$1",
      [accountId]
    );
    const hash = res.rows[0].password_hash;
    return bcrypt.compareSync(password, hash);
  } catch (error) {
    return false;
  }
}

async function logInUser(email, password) {
  if (email && password) {
    try {
      const res = await pool.query("SELECT id FROM accounts WHERE email=$1", [
        email
      ]);
      const { id } = res.rows[0];
      if (await checkAccountCredentials(id, password)) {
        const isAdmin = await userIsManager(email);
        const token = jwt.sign(
          { accountId: id, manager: isAdmin },
          privateKey,
          {
            algorithm: JWT_ALGORITHM
          }
        );
        return token;
      }
    } catch (error) {
      console.log(`User login failed ${error}`);
    }
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
    const accountRes = await client.query(
      `INSERT INTO accounts (email, password_hash)
			VALUES ($1, $2) 
			RETURNING id`,
      [email, hash]
    );
    const accountId = accountRes.rows[0].id;
    await client.query(
      `INSERT INTO prosumers
			(account_id)
			VALUES($1)`,
      [accountId]
    );
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
    const accountRes = await client.query(
      `INSERT INTO accounts (email, password_hash)
			VALUES ($1, $2) 
			RETURNING id`,
      [email, hash]
    );
    const accountId = accountRes.rows[0].id;
    await client.query(
      `INSERT INTO managers
			(account_id)
			VALUES($1)`,
      [accountId]
    );
    const token = jwt.sign({ accountId, manager: false }, privateKey, {
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

module.exports = {
  authMiddleWare,
  logInUser,
  authenticateLoggedIn,
  authenticateIsMe,
  authenticateIsManager,
  registerProsumer,
  registerManager
};
