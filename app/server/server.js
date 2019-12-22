const express = require("express");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
const bodyParser = require("body-parser");

const { getCookie } = require("./util.js");

const API_ADDRESS = process.env.API_ADDRESS || "http://localhost:8080/graphql";

const {
  authenticateRequest,
  authenticateLoggedOut,
  logoutUser
} = require("./auth.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../client/views"));

app.use("/js", express.static(path.join(__dirname, "../client/js")));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("pages/index");
});

app.get("/login", authenticateLoggedOut, (req, res) => {
  res.render("pages/login");
});

app.get("/profile", authenticateRequest, async (req, res) => {
  const cookies = req.headers.cookie;
  const authToken = getCookie("authToken", cookies);
  try {
    const imageQuery = fetch("http://localhost:8080/api/get_image", {
      method: "GET",
      headers: { "Content-type": "image/jpeg", authToken }
    });
    const accountQuery = fetch(API_ADDRESS, {
      method: "POST",
      headers: { "content-type": "application/json", authToken },
      body: JSON.stringify({ query: "{me{account{email}}}" })
    });
    const values = await Promise.all([imageQuery, accountQuery]);
    const image = await values[0].buffer();
    const accountResponse = await values[1].json();
    const { email } = accountResponse.data.me.account;
    res.render("pages/profile", {
      user: { email, image }
    });
  } catch (error) {
    console.log(error);
    res.render("partials/error");
  }
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
