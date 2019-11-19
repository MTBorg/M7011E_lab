const express = require("express");
const expressGraphQL = require("express-graphql");
const schema = require("./schema.js");
const { startSimulation } = require("./simulator.js");

const app = express();
app.use(
  "/graphql",
  expressGraphQL({
    schema,
    graphiql: true
  })
);
const port = 8080;
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
