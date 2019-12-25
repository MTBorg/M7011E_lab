const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { pool } = require("./db.js");

const privateKey = process.env.SECRET || "secret";
const JWT_ALGORITHM = "HS256";

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
  if (context.user.accountId === args.accountId) {
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
				WHERE email=$1
			)
		`,
    [email]
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
      if (res.rows.length === 0) {
        return null;
      }
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

module.exports = {
  authMiddleWare,
  logInUser,
  authenticateLoggedIn,
  authenticateIsMe,
  authenticateIsManager
};
