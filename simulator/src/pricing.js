const { pool } = require("./db.js");
const { turbineOutput } = require("./windturbine");

// Price in SEK
const START_PRICE = 0.5;
const PRICE_COEFFICIENT = 0.05;

async function getPricing() {
  let consumptionRes = null;
  try {
    consumptionRes = pool.query(
      `
				SELECT SUM(current_consumption) FROM prosumers;
    `
    );
  } catch (e) {
    console.error(e);
    return null;
  }

  let windSpeedRes = null;
  try {
    windSpeedRes = pool.query(
      `
			SELECT current_wind_speed FROM prosumers
		`
    );
  } catch (e) {
    console.error(e);
    return null;
  }

  let pricing = 0;
  await Promise.all([consumptionRes, windSpeedRes])
    .then(values => {
      const consumptionSum = values[0].rows[0].sum;
      const windSpeeds = values[1];
      // Sum the production
      const productionSum = windSpeeds.rows.reduce(
        (sum, row) => sum + turbineOutput(row.current_wind_speed),
        0
      );
      pricing =
        START_PRICE + (consumptionSum - productionSum) * PRICE_COEFFICIENT;
    })
    .catch(err => console.error(err));
  return pricing;
}

module.exports = { getPricing };
