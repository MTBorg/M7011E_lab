const gaussian = require("gaussian");
const { pool } = require("./db");

const consumptionMean = 32;
const consumptionVariance = 10;

function getNormalSample(mean, variance) {
  const distribution = gaussian(mean, variance);

  return distribution.ppf(Math.random());
}

function randomProsumerConsumption() {
  return getNormalSample(consumptionMean, consumptionVariance);
}

async function getHouseholdConsumption(id) {
  let consumption = null;
  await pool
    .query(
      `
		SELECT current_consumption FROM prosumers WHERE id=$1
		`,
      [id]
    )
    .then(res => (consumption = res.rows[0].current_consumption))
    .catch(err => console.error(err));
  return consumption;
}

module.exports = { getHouseholdConsumption, randomProsumerConsumption };
