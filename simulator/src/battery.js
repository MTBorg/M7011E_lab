const { dbClient } = require("./db_client");

const client = dbClient();
client.connect(error => {
  if (error) console.error("Databse connection error : ", error);
});

const newBatteryQuery = `
	WITH new_bat AS (
		INSERT INTO batteries (max_capacity) VALUES ($1) RETURNING id AS battery_id
	)
	UPDATE prosumers SET battery_id = (SELECT battery_id FROM new_bat) WHERE id = $2
`;

const chargeBatteryQuery = `
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
`;

/**
 * Creates a new battery in the database and adds it to the prosumer in the database
 * @param {Number} prosumerId the prosumer who receives the battery
 * @param {Number} maxCapacity the maximum capacity of the new battery in kW
 * @returns {Boolean} if the battery was created or not
 */
function newBattery(prosumerId, maxCapacity) {
  // create new battery with maxCapacity
  client.query(newBatteryQuery, [maxCapacity, prosumerId], (err, _res) => {
    if (err) {
      console.error("Error while creating new battery");
      return false;
    }
  });
  return true;
}

/**
 * Charges the owners battery by adding the specified amount to the current power stored in the battery
 * up to the max capacity of the battery.
 * @param {Number} ownerId the owner of the battery to charge
 * @param {Number} amount the amount (in kW) to charge the battery with
 * @returns {Boolean} if the battery was charged or not
 */
// TODO: ownerId should be able to be both prosumer and manager later on,
// maybe add boolean to indicate prosumer or manager (different tables in the database)
function chargeBattery(ownerId, amount) {
  client.query(chargeBatteryQuery, [ownerId, amount], (err, _res) => {
    if (err) {
      console.error("Error while charging battery");
      return false;
    }
  });
  return true;
}

module.exports = { newBattery, chargeBattery };
