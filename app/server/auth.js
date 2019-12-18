const jwt = require("jsonwebtoken");

const { getCookie } = require("./util.js");

const privateKey = process.env.secret || "secret";
const TOKEN_NAME = "authToken";
const JWT_ALGORITHM = "HS256";

function authenticateRequest(req, res, next) {
  if (typeof req.headers.cookie !== "undefined") {
    const token = getCookie(TOKEN_NAME, req.headers.cookie);

    jwt.verify(token, privateKey, { algorithm: JWT_ALGORITHM }, err => {
      if (err) {
        res.redirect("/login");
      } else {
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
}

function authenticateLoggedOut(req, res, next) {
  if (typeof req.headers.cookie !== "undefined") {
    const token = getCookie(TOKEN_NAME, req.headers.cookie);
    if (token) {
      // Make sure that the token is valid
      jwt.verify(token, privateKey, { algorithm: JWT_ALGORITHM }, err => {
        if (!err) {
          res.redirect("/profile");
        } else {
          next();
        }
      });
    }
  } else {
    next();
  }
}

function logoutUser(req, res) {
  if (getCookie(TOKEN_NAME, req.headers.cookie)) {
    res.cookie(TOKEN_NAME, undefined);
    res.redirect("/");
  } else {
    res.status(500).json({ error: "Failed to log out user" });
  }
}

module.exports = {
  authenticateRequest,
  authenticateLoggedOut,
  logoutUser
};
