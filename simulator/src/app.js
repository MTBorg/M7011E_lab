const express = require("express");
const expressGraphQL = require("express-graphql");
const cors = require("cors");
const schema = require("./schema.js");
const { startSimulation } = require("./simulator.js");
const { authMiddleWare } = require("./auth.js");

const app = express();
const port = 8080;

app.use(
  cors({
    origin: `http://${process.env.APP_HOST}:${process.env.APP_PORT}`
  })
);
app.use(authMiddleWare);
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

app.listen(port, () => {
  console.log(
    `Express GraphQl Server Now Running On localhost:${port}/graphql`
  );
});

const SIM_TICK_INTERVAL = 1000;
const SIM_TICK_RATIO = 24;
const SIM_TIME_SCALE = 1000 * 3600 * 24; // One day
const SIM_START_TIME = Date.now(); //Simulate time starting from now

startSimulation({
  timeScale: SIM_TIME_SCALE,
  timeStart: SIM_START_TIME,
  tickInterval: SIM_TICK_INTERVAL,
  tickRatio: SIM_TICK_RATIO
});
