const { pool } = require("../../db.js");

// The time it takes to start up the power plant (in milliseconds)
const POWERPLANT_STARTUP_TIME = 30 * 1000;
// TODO: Use some accurrate value
const POWERPLANT_OUTPUT = 100;

const POWERPLANT_STATUS_QUERY =
  "SELECT status FROM power_plants WHERE id=(SELECT power_plant_id FROM managers WHERE account_id=$1)";
const POWERPLANT_STOP_QUERY =
  "UPDATE power_plants SET status=$1 WHERE id=(SELECT power_plant_id FROM managers WHERE account_id=$2) RETURNING status";
const POWERPLANT_UPDATE_QUERY =
  "UPDATE power_plants SET status=$1 WHERE id=(SELECT power_plant_id FROM managers WHERE account_id=$2)";

function startPowerPlant(accountId) {
  setTimeout(() => {
    try {
      pool.query(POWERPLANT_UPDATE_QUERY, ["started", accountId]);
    } catch (e) {
      console.error(e);
    }
  }, POWERPLANT_STARTUP_TIME);
}

async function getCurrentProduction(accountId) {
  try {
    const statusRes = await pool.query(POWERPLANT_STATUS_QUERY, [accountId]);
    if (statusRes.rows[0].status === "started") {
      return POWERPLANT_OUTPUT;
    }
    return 0;
  } catch (e) {
    console.error(e);
  }
}

/**
 * Request to start the power plant.
 *
 * Starts the power plant only if it is stopped, otherwise does nothing.
 *
 * @param {Number} id The account id of the power plants manager
 *
 * @return The new status of the power plant
 * */
async function startRequestPowerPlant(accountId) {
  try {
    const statusRes = await pool.query(POWERPLANT_STATUS_QUERY, [accountId]);
    const { status } = statusRes.rows[0];
    if (status === "stopped") {
      pool.query(POWERPLANT_UPDATE_QUERY, ["starting", accountId]);
      startPowerPlant(accountId);
      return "starting";
    }
    return status;
  } catch (e) {
    console.error(e);
    return null;
  }
}

/**
 * Stop a power plant.
 *
 * @param {Number} accountId The account id of the power plants manager
 *
 * @return The new status of the power plant
 * */
async function stopPowerPlant(accountId) {
  return (await pool.query(POWERPLANT_STOP_QUERY, ["stopped", accountId]))
    .rows[0].status;
}

module.exports = {
  startRequestPowerPlant,
  stopPowerPlant,
  getCurrentProduction,
  POWERPLANT_OUTPUT,
  POWERPLANT_STATUS_QUERY,
  POWERPLANT_STOP_QUERY,
  POWERPLANT_UPDATE_QUERY
};
