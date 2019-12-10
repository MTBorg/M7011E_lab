const express = require("express");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../client/views"));

app.get("/", (req, res) => {
  res.render("pages/index");
});

app.get("/login", (req, res) => {
  res.render("pages/login");
});

app.get("/profile", (req, res) => {
  res.render("pages/profile");
});

app.get("/register", (req, res) => {
  res.render("pages/register");
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(
    `Web app running on http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`
  );
});
