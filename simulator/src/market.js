const { pool } = require("./db.js");

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
const buyBeforeQuery = `
SELECT power FROM batteries WHERE id = (SELECT battery_id FROM power_plants WHERE id = 1) FOR UPDATE
`;
const buyQuery = `
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
 * Buys a specified amount of power from the power plant. Note that the amount bought might not
 * equal the amount specified if the power plants battery is depleted.
 * @param {Number} amount the amount of power to buy
 * @retuns the amount bought
 */
async function buyFromMarket(amount) {
  let boughtAmount = null;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const before = await client.query(buyBeforeQuery);
    const beforeAmount = before.rows[0].power;
    const after = await client.query(buyQuery, [amount]);
    boughtAmount = beforeAmount - after.rows[0].after_amount;
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Error while buying from the market: ", e);
  } finally {
    client.release();
  }
  return Number(boughtAmount);
}

module.exports = { sellToMarket, buyFromMarket, sellQuery, buyQuery };
