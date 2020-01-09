const { pool } = require("./db.js");
const { turbineOutput } = require("./windturbine");

// Price in SEK
const START_PRICE = 0.5;
const PRICE_COEFFICIENT = 0.05;

const PROSUMERS_QUERY =
  "SELECT current_consumption, current_wind_speed, ratio_excess_market, ratio_deficit_market FROM prosumers";

const PRICE_QUERY = `
	SELECT price FROM prices;
`;

/**
 * Returns the suggested pricing calculated from the simulation data
 */
async function getSimPricing() {
  const prosumersRes = await pool.query(PROSUMERS_QUERY);
  let demandSum = 0;
  prosumersRes.rows.forEach(prosumer => {
    const production = turbineOutput(prosumer.current_wind_speed);
    const diff = prosumer.current_consumption - production;
    demandSum +=
      diff *
      (diff > 0 ? prosumer.ratio_deficit_market : prosumer.ratio_excess_market);
  });
  const pricing = START_PRICE + demandSum * PRICE_COEFFICIENT;
  return pricing < START_PRICE ? START_PRICE : pricing;
}

/**
 * Returns the electricity pricing set by the manager
 */
async function getPricing() {
  let price = null;
  try {
    const response = await pool.query(PRICE_QUERY);
    price = response.rows[0].price;
  } catch (err) {
    console.error(`Failed to get pricing: ${err}`);
  }
  return price;
}

module.exports = {
  getSimPricing,
  getPricing,
  START_PRICE,
  PRICE_COEFFICIENT,
  PROSUMERS_QUERY,
  PRICE_QUERY
};
