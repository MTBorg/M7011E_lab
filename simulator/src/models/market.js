const { pool } = require("../db.js");

// NOTE: Needs to change if more power plants
const sellQuery = `
WITH old_bat_state AS (
	SELECT power FROM batteries WHERE id = (SELECT battery_id FROM power_plants WHERE id = 1)	
)
UPDATE batteries
	SET power = (
		CASE
		WHEN power + $1 > max_capacity THEN
			max_capacity
		ELSE
			power + $1
		END
	)
	WHERE id = (SELECT battery_id FROM power_plants WHERE id = 1)
	RETURNING power - (SELECT power FROM old_bat_state) AS sold_amount
`;

// NOTE: Needs to change if more power plants
const powerPlantStatusQuery = `
SELECT status FROM power_plants WHERE id = 1
`;
const buyMarketSupplyBeforeQuery = `
SELECT market_electricity FROM power_plants WHERE id=1 FOR UPDATE
`;
const buyMarketSupplyQuery = `
UPDATE power_plants
  SET market_electricity = (
		CASE
			WHEN market_electricity - $1 < 0 THEN
				0
			ELSE
				market_electricity - $1
		END
	)
	WHERE id=1
	RETURNING market_electricity AS after_amount
`;
const buyBatteryBeforeQuery = `
SELECT power FROM batteries WHERE id = (SELECT battery_id FROM power_plants WHERE id = 1) FOR UPDATE
`;
const buyBatteryQuery = `
UPDATE batteries
	SET power = (
		CASE
		WHEN power - $1 < 0 THEN
			0
		ELSE
			power - $1
		END
	)
	WHERE id = (SELECT battery_id FROM power_plants WHERE id = 1)
	RETURNING power AS after_amount
`;

/**
 * Sells a specified amount of power to the power plant. Note that amount sold might not
 * equal the amount specified if the power plants battery capacity is reached.
 * @param {Number} amount the amount of power to sell
 * @returns the amount sold
 */
async function sellToMarket(amount) {
  let soldAmount = null;
  try {
    const res = await pool.query(sellQuery, [amount]);
    soldAmount = res.rows[0].sold_amount;
  } catch (e) {
    console.error("Error while selling to market: ", e);
  }
  return Number(soldAmount);
}

/**
 * Buys a specified amount of power from the power plant,
 * if the power plant is producing the electricity directed to the market is bought (battery if not producing).
 * Note that the amount bought might not equal the amount specified if the full amount can not be supplied.
 * @param {Number} amount the amount of power to buy
 * @retuns the amount bought
 */
async function buyFromMarket(amount) {
  let boughtAmount = null;
  const client = await pool.connect();
  try {
    const res = await client.query(powerPlantStatusQuery);
    const powerPlantStatus = res.rows[0].status;
    await client.query("BEGIN");
    // if the power plant is not producing buy electricity from battery
    if (powerPlantStatus !== "started") {
      const before = await client.query(buyBatteryBeforeQuery);
      const beforeAmount = before.rows[0].power;
      const after = await client.query(buyBatteryQuery, [amount]);
      boughtAmount = beforeAmount - after.rows[0].after_amount;
    } else {
      // buy directly from the electricity supplied for the market while producing
      const before = await client.query(buyMarketSupplyBeforeQuery);
      const beforeAmount = before.rows[0].market_electricity;
      const after = await client.query(buyMarketSupplyQuery, [amount]);
      boughtAmount = beforeAmount - after.rows[0].after_amount;
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Error while buying from the market: ", e);
  } finally {
    client.release();
  }
  return Number(boughtAmount);
}

async function calculateMarketDemand() {
  const result = await pool.query(`
	SELECT
		SUM((current_consumption - current_production) * ratio_deficit_market) as demand
	FROM prosumers
	WHERE current_consumption >= current_production;
	`);

  return result.rows[0].demand;
}

module.exports = {
  sellToMarket,
  buyFromMarket,
  sellQuery,
  buyBatteryQuery,
  buyBatteryBeforeQuery,
  buyMarketSupplyBeforeQuery,
  buyMarketSupplyQuery,
  calculateMarketDemand,
  powerPlantStatusQuery
};
