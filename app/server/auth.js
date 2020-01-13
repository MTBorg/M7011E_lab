const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

const { getCookie, API_ADDRESS } = require("./util.js");

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
        timestampUser(token);
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

function parseAuthToken(authToken) {
  return jwt.verify(authToken, privateKey, { algorithm: JWT_ALGORITHM });
}

function authenticateIsManager(req, res, next) {
  const cookies = req.headers.cookie;
  const authToken = getCookie("authToken", cookies);
  if (authToken != null) {
    const user = parseAuthToken(authToken);
    if (user.manager) {
      next();
    } else {
      res.render("partials/permissionDenied");
      next();
    }
  } else {
    res.redirect("pages/login");
  }
}

function timestampUser(authToken) {
  fetch(API_ADDRESS, {
    method: "POST",
    headers: { "content-type": "application/json", authToken },
    body: JSON.stringify({
      query: `
					mutation {
						timestamp
					}`
    })
  }).catch(err =>
    console.error(
      `Failed to timestamp userFailed to timestamp userFailed to timestamp userFailed to timestamp userFailed to timestamp userFailed to timestamp userFailed to timestamp userFailed to timestamp userFailed to timestamp userFailed to timestamp userFailed to timestamp userFailed to timestamp userFailed to timestamp userFailed to timestamp userFailed to timestamp user: ${err}`
    )
  );
}

module.exports = {
  authenticateRequest,
  authenticateLoggedOut,
  authenticateIsManager,
  logoutUser,
  timestampUser,
  parseAuthToken
};
