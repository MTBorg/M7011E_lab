const { pool } = require("./db.js");
const { turbineOutput } = require("./windturbine");

// Price in SEK
const START_PRICE = 0.5;
const PRICE_COEFFICIENT = 0.05;

const PROSUMERS_QUERY =
  "SELECT consumption, current_wind_speed, ratio_excess_market, ratio_deficit_market FROM prosumers";

async function getPricing() {
  const prosumersRes = await pool.query(PROSUMERS_QUERY);

  let demandSum = 0;
  prosumersRes.rows.forEach(prosumer => {
    const production = turbineOutput(prosumer.current_wind_speed);
    const diff = prosumer.consumption - production;
    demandSum +=
      diff *
      (diff > 0 ? prosumer.ratio_deficit_market : prosumer.ratio_excess_market);
  });

  const pricing = START_PRICE + demandSum * PRICE_COEFFICIENT;
  return pricing < START_PRICE ? START_PRICE : pricing;
}

module.exports = {
  getPricing,
  START_PRICE,
  PRICE_COEFFICIENT,
  PROSUMERS_QUERY
};
