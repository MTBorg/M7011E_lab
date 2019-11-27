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
const buyQuery = `
WITH old_bat_state AS (
	SELECT power FROM batteries WHERE id = (SELECT battery_id FROM power_plants WHERE id = 1)
)
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
	RETURNING (SELECT power FROM old_bat_state) - power AS bought_amount
`;

/**
 * Sells a specified amount of power to the power plant. Note that amount sold might not
 * equal the amount specified if the power plants battery capacity is reached.
 * @param {Number} amount the amount of power to sell
 * @returns the amount sold
 */
async function sellToMarket(amount) {
  let soldAmount = null;
  await pool
    .query(sellQuery, [amount])
    .then(res => (soldAmount = res.rows[0].sold_amount))
    .catch(err => console.error("Error while selling to market: ", err));
  return soldAmount;
}

/**
 * Buys a specified amount of power from the power plant. Note that the amount bought might not
 * equal the amount specified if the power plants battery is depleted.
 * @param {Number} amount the amount of power to buy
 * @retuns the amount bought
 */
async function buyFromMarket(amount) {
  let boughtAmount = null;
  await pool
    .query(buyQuery, [amount])
    .then(res => (boughtAmount = res.rows[0].bought_amount))
    .catch(err => console.error("Error while buying from the market: ", err));
  return boughtAmount;
}

module.exports = { sellToMarket, buyFromMarket };
