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
  authenticateIsManager,
  logoutUser,
  parseAuthToken
} = require("./auth.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../client/views"));

app.use("/js", express.static(path.join(__dirname, "../client/js")));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const cookies = req.headers.cookie;
  const authToken = getCookie("authToken", cookies);
  const user = authToken ? parseAuthToken(authToken) : null;
  res.render("pages/index", { user });
});

app.get("/login", authenticateLoggedOut, (req, res) => {
  res.render("pages/login");
});

app.get("/profile", authenticateRequest, async (req, res) => {
  const cookies = req.headers.cookie;
  const authToken = getCookie("authToken", cookies);
  const user = authToken ? parseAuthToken(authToken) : null;
  try {
    const imageQuery = fetch("http://localhost:8080/api/get_image", {
      method: "GET",
      headers: { "Content-type": "image/jpeg", authToken }
    });
    const accountQuery = fetch(API_ADDRESS, {
      method: "POST",
      headers: { "content-type": "application/json", authToken },
      body: JSON.stringify({
        query: `
					{
						me{
							... on prosumer{
								account{
									email
								}
								battery{
									maxCapacity
									power
								}
							},
							... on manager{
								powerplant{
									battery{
										power
										maxCapacity
									}
								}
								account{
									email
								}
							}
						}
					}`
      })
    });
    const values = await Promise.all([imageQuery, accountQuery]);
    const image = await values[0].buffer();
    const accountResponse = await values[1].json();
    const { email } = accountResponse.data.me.account;
    const { battery } = user.manager
      ? accountResponse.data.me.powerplant
      : accountResponse.data.me;
    res.render("pages/profile", {
      user: { manager: user.manager, email, image, battery }
    });
  } catch (error) {
    console.log(error);
    res.render("partials/error");
  }
});

app.get("/dashboard", authenticateRequest, (req, res) => {
  const cookies = req.headers.cookie;
  const authToken = getCookie("authToken", cookies);
  const user = authToken ? parseAuthToken(authToken) : null;
  if (user.manager) {
    res.render("pages/managerDashboard", { user });
  } else {
    res.render("pages/prosumerDashboard", { user });
  }
});

app.get("/register", authenticateLoggedOut, (req, res) => {
  res.render("pages/register");
});

app.get(
  "/prosumer-overview",
  authenticateRequest,
  authenticateIsManager,
  async (req, res) => {
    const cookies = req.headers.cookie;
    const authToken = getCookie("authToken", cookies);
    const user = authToken ? parseAuthToken(authToken) : null;
    try {
      const response = await fetch(API_ADDRESS, {
        method: "POST",
        headers: { "content-type": "application/json", authToken },
        body: JSON.stringify({
          query: `
					{
						prosumers{
							id
							blocked
							account{
								email
							}
						}
					}`
        })
      });
      const json = await response.json();
      const { prosumers } = json.data;
      res.render("pages/prosumerOverview", { prosumers, user });
    } catch (error) {
      console.log(error);
      res.render("partials/error");
    }
  }
);

app.get(
  "/prosumer-summary/:prosumerid",
  authenticateRequest,
  authenticateIsManager,
  async (req, res) => {
    const cookies = req.headers.cookie;
    const authToken = getCookie("authToken", cookies);
    const user = authToken ? parseAuthToken(authToken) : null;
    try {
      if (req.params.prosumerid == null) {
        throw new Error("null prosumerid parameter");
      }

      const cookies = req.headers.cookie;
      const authToken = getCookie("authToken", cookies);

      const imageQuery = fetch(
        `http://localhost:8080/api/get_prosumer_image/${req.params.prosumerid}`,
        {
          method: "GET",
          headers: { "Content-type": "image/jpeg", authToken }
        }
      );

      const prosumerQuery = fetch(API_ADDRESS, {
        method: "POST",
        headers: { "content-type": "application/json", authToken },
        body: JSON.stringify({
          query: `
					{
						prosumer(id:${req.params.prosumerid}){
							id
							account{
								email
							}
						}
					}`
        })
      });
      const values = await Promise.all([imageQuery, prosumerQuery]);
      const image = await values[0].buffer();
      const prosumerJson = await values[1].json();
      const { prosumer } = prosumerJson.data;
      res.render("pages/prosumerSummary", { user, prosumer, image });
    } catch (error) {
      console.log(error);
      res.render("partials/error");
    }
  }
);

app.listen(process.env.SERVER_PORT, () => {
  console.log(
    `Web app running on http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`
  );
});
