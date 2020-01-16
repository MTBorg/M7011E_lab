const express = require("express");
const expressGraphQL = require("express-graphql");
const cors = require("cors");
const bodyParser = require("body-parser");
const schema = require("./api/schema.js");
const { startSimulation } = require("./simulator.js");
const { authMiddleWare } = require("./api/auth.js");
const { getImage, getProsumerImage } = require("./api/getPicture.js");
const { pool } = require("./db.js");

const app = express();
const port = 8080;

app.use(authMiddleWare);
// Increase the maximum request limit in order to serve images
app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));

// Detect if a request is too large
app.use(function(error, req, res, next) {
  if (error.type === "entity.too.large") {
    res.status(413).send();
    res.end();
  } else {
    next();
  }
});

app.use(
  "/graphql",
  expressGraphQL(req => ({
    schema,
    context: {
      user: req.user
    },
    graphiql: true
  }))
);

app.get("/api/get_image", async (req, res) => {
  if (req.user != null) {
    const image = await getImage(req.user.accountId);
    res.writeHead(200, { "Content-type": "image/jpeg" });
    res.end(image);
  } else {
    res.status(401).json({ error: "Not authorized: no token" });
  }
});

app.get("/api/get_prosumer_image/:prosumerid", async (req, res) => {
  if (req.user != null) {
    if (req.user.manager) {
      // console.log(req.params);
      const image = await getProsumerImage(req.params.prosumerid);
      res.writeHead(200, { "Content-type": "image/jpeg" });
      res.end(image);
    } else {
      res
        .status(401)
        .json({ error: "Not authorized: insufficient role permission" });
    }
  } else {
    res.status(401).json({ error: "Not authorized: no token" });
  }
});

app.post("/api/upload_image", async (req, res) => {
  if (req.user != null) {
    try {
      await pool.query(
        `
				UPDATE accounts
				SET image=$1
				WHERE id=$2;`,
        [req.body.image, req.user.accountId]
      );
      res.send({
        status: true
      });
      res.status(200).end();
    } catch (error) {
      console.log(`Failed to upload image: ${error}`);
      res.status(500).end();
    }
  } else {
    res
      .status(401)
      .json({ error: "Not authorized: no token" })
      .end();
  }
});

app.listen(port, () => {
  console.log(
    `Express GraphQl Server Now Running On localhost:${port}/graphql`
  );
});

const SIM_TICK_INTERVAL = 1000;
const SIM_TICK_RATIO = 24;
const SIM_TIME_SCALE = 1000 * 3600 * 24; // One day
const SIM_START_TIME = Date.now(); // Simulate time starting from now

startSimulation({
  timeScale: SIM_TIME_SCALE,
  timeStart: SIM_START_TIME,
  tickInterval: SIM_TICK_INTERVAL,
  tickRatio: SIM_TICK_RATIO
});
