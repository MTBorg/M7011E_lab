const { pool } = require("./db");

const newBatteryQuery = `
	WITH new_bat AS (
		INSERT INTO batteries (max_capacity) VALUES ($1) RETURNING id AS battery_id
	)
	UPDATE prosumers SET battery_id = (SELECT battery_id FROM new_bat) WHERE id = $2
`;

const chargeBatteryQuery = `
	WITH old_bat_state AS (
		SELECT power FROM batteries WHERE id = (SELECT battery_id FROM prosumers WHERE id = $1)
	)
	UPDATE batteries 
		SET power = (
			CASE
				WHEN power + $2 > max_capacity THEN
					max_capacity
			ELSE
				power + $2
			END
		)
		WHERE id = (SELECT battery_id FROM prosumers WHERE id = $1)
		RETURNING power - (SELECT power FROM old_bat_state) AS charged_amount
`;

const useBatteryPowerQuery = `
WITH old_state AS (
	SELECT power FROM batteries WHERE id = (SELECT battery_id FROM prosumers WHERE id = $1)
)
UPDATE batteries
	SET power = (
		CASE
			WHEN power - $2 < 0 THEN
				0
			ELSE
				power - $2
		END
	)
	WHERE id = (SELECT battery_id FROM prosumers WHERE id = $1)
	RETURNING (SELECT power FROM old_state)  - power AS used_power
`;

/**
 * Creates a new battery in the database and adds it to the prosumer in the database
 * @param {Number} prosumerId the prosumer who receives the battery
 * @param {Number} maxCapacity the maximum capacity of the new battery in kW
 */
function newBattery(prosumerId, maxCapacity) {
  // create new battery with maxCapacity
  pool.query(newBatteryQuery, [maxCapacity, prosumerId], (err, _res) => {
    if (err) {
      console.error("Error while creating new battery");
    }
  });
}

/**
 * Charges the owners battery by adding the specified amount to the current power stored in the battery
 * up to the max capacity of the battery. The charged amount will be returned.
 * @param {Number} ownerId the owner of the battery to charge
 * @param {Number} amount the amount (in kW) to charge the battery with
 */
// TODO: ownerId should be able to be both prosumer and manager later on,
// maybe add boolean to indicate prosumer or manager (different tables in the database)
async function chargeBattery(ownerId, amount) {
  let chargedAmount = null;
  await pool
    .query(chargeBatteryQuery, [ownerId, amount])
    .then(res => (chargedAmount = res.rows[0].charged_amount))
    .catch(err => console.error("Error while charging battery: ", err));

  return chargedAmount;
}

/**
 * Uses a specified amount of power from the owners battery. If the specified amount exceeds the
 * stored power on the battery, the amount that was used will be returned instead of the full amount specified.
 * @param {Number} ownerId the id of the battery owner
 * @param {Number} amount the amount of power to use from the battery
 * @returns the amount of power used from the battery
 */
async function useBatteryPower(ownerId, amount) {
  let usedAmount = null;
  await pool
    .query(useBatteryPowerQuery, [ownerId, amount])
    .then(res => (usedAmount = res.rows[0].used_power))
    .catch(err => console.error("Error while using battery: ", err));

  return usedAmount;
}

module.exports = { newBattery, chargeBattery, useBatteryPower };
