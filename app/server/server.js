const express = require("express");
const path = require("path");

const app = express();
const bodyParser = require("body-parser");

const {
  authenticateRequest,
  authenticateLoggedOut,
  logoutUser
} = require("./auth.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../client/views"));

app.use("/js", express.static(path.join(__dirname, "../client/js")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("pages/index");
});

app.get("/login", authenticateLoggedOut, (req, res) => {
  res.render("pages/login");
});

app.get("/profile", authenticateRequest, (req, res) => {
  res.render("pages/profile");
});

app.get("/register", authenticateLoggedOut, (req, res) => {
  res.render("pages/register");
});

app.post("/action/logout", (req, res) => {
  logoutUser(req, res);
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(
    `Web app running on http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`
  );
});
