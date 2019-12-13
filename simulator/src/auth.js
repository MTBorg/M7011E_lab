const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { pool } = require("./db.js");

const privateKey = process.env.SECRET || "secret";
const JWT_ALGORITHM = "HS256";
const TOKEN_NAME = "authToken";
const SALT_ROUNDS = 10;

function authMiddleWare(req, res, next) {
  if (req.headers.authtoken) {
    const token = req.headers.authtoken;
    const user = jwt.verify(token, privateKey);

    // Validate the fields of the token
    if (user == null || user.id == null || user.admin == null) {
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
  } else {
    return new Error("Not authorized: not logged in");
  }
};

const authenticateIsMe = next => (parent, args, context, resolveInfo) => {
  if (context.user.id === args.id) {
    return next(parent, args, context, resolveInfo);
  } else {
    return new Error("Not authorized: access to resource denied");
  }
};

function userIsAdmin(email) {
  // TODO: implement
  return false;
}

async function checkUserCredentials(userId, password) {
  try {
    const res = await pool.query(
      "SELECT password_hash FROM prosumers WHERE id=$1",
      [userId]
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
      const res = await pool.query("SELECT id FROM prosumers WHERE email=$1", [
        email
      ]);
      const id = res.rows[0].id;
      if (await checkUserCredentials(id, password)) {
        const isAdmin = userIsAdmin(email);
        const token = jwt.sign({ id, admin: isAdmin }, privateKey, {
          algorithm: JWT_ALGORITHM
        });
        return token;
      }
    } catch (error) {
      console.log(`User login failed ${error}`);
      return null;
    }
  }
}

async function registerUser(email, password) {
  if (!email || !password) {
    return null;
  }

  // Hash and salt the password
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const hash = bcrypt.hashSync(password, salt);

  try {
    let res = await pool.query(
      `INSERT INTO prosumers
			(email, password_hash)
			VALUES($1, $2) 
			RETURNING id`,
      [email, hash]
    );
    const id = res.rows[0].id;
    const token = jwt.sign({ id, admin: false }, privateKey, {
      algorithm: JWT_ALGORITHM
    });
    return token;
  } catch (error) {
    console.log(`Failed to register user: ${error}`);
  }
}

module.exports = {
  authMiddleWare,
  logInUser,
  authenticateLoggedIn,
  authenticateIsMe,
  registerUser
};
