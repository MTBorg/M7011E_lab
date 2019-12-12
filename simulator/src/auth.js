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

    // Validate fields
    if (!user || !user.id || !user.admin) {
      res.status(401).send({ error: "Invalid token" });
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
    return new Error("Not authorized");
  }
};

function userIsAdmin(email) {
  // TODO: implement
  return false;
}

async function checkUserCredentials(user, password) {
  try {
    const res = await pool.query(
      "SELECT password_hash FROM prosumers WHERE email=$1",
      [user]
    );
    const hash = res.rows[0].password_hash;
    return bcrypt.compareSync(password, hash);
  } catch (error) {
    return false;
  }
}

async function logInUser(email, password) {
  if (email && password) {
    if (await checkUserCredentials(email, password)) {
      const isAdmin = userIsAdmin(email);
      const token = jwt.sign({ email: email, admin: isAdmin }, privateKey, {
        algorithm: JWT_ALGORITHM
      });
      return token;
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
      "INSERT INTO prosumers (email, password_hash) VALUES($1, $2)",
      [email, hash]
    );
<<<<<<< Updated upstream
    const token = jwt.sign({ email: email }, privateKey, {
=======
    const userId = res.rows[0].id;
    const token = jwt.sign({ userId, isAdmin: false }, privateKey, {
>>>>>>> Stashed changes
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
  registerUser
};
