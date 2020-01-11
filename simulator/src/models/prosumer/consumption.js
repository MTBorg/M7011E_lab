const gaussian = require("gaussian");
const { pool } = require("../../db.js");

// Consumption configs
const consumptionMeanDay = 32; // [kWh]
const consumptionMeanHour = consumptionMeanDay / 24; // [kW]
const consumptionVariance = 1;

function getNormalSample(mean, variance) {
  const distribution = gaussian(mean, variance);

  return distribution.ppf(Math.random());
}

function randomProsumerConsumption() {
  while (true) {
    const consumption = getNormalSample(
      consumptionMeanHour,
      consumptionVariance
    );
    if (consumption > 0) return consumption;
  }
}

async function getHouseholdConsumption(id) {
  let consumption = null;
  await pool
    .query("SELECT current_consumption FROM prosumers WHERE id=$1", [id])
    .then(res => (consumption = res.rows[0].current_consumption))
    .catch(err => console.error(err));
  return consumption;
}

module.exports = { getHouseholdConsumption, randomProsumerConsumption };
