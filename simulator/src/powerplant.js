const { pool } = require("./db");

// The time it takes to start up the power plant (in milliseconds)
const POWERPLANT_STARTUP_TIME = 30 * 1000;
// TODO: Use some accurrate value
const POWERPLANT_OUTPUT = 1500;

function startPowerPlant(id) {
  setTimeout(() => {
    try {
      pool.query(`UPDATE power_plants SET status=$1 WHERE id=$2`, [
        "started",
        id
      ]);
    } catch (e) {
      console.error(e);
    }
  }, POWERPLANT_STARTUP_TIME);
}

async function getCurrentProduction(id) {
  try {
    const statusRes = await pool.query(
      "SELECT status FROM power_plants WHERE id=$1",
      [id]
    );
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
 * @param {Number} id The id of the power plant to start
 *
 * @return The new status of the power plant
 * */
async function startRequestPowerPlant(id) {
  try {
    const statusRes = await pool.query(
      "SELECT status FROM power_plants WHERE id=$1",
      [id]
    );
    const { status } = statusRes.rows[0];
    if (status === "stopped") {
      pool.query("UPDATE power_plants SET status=$1 WHERE id=$2", [
        "starting",
        id
      ]);
      startPowerPlant(id);
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
 * @param {Number} id The id of the power plant to stop
 *
 * @return The new status of the power plant
 * */
async function stopPowerPlant(id) {
  pool.query("UPDATE power_plants SET status=$1 WHERE id=$2", ["stopped", id]);
  return "stopped";
}

module.exports = {
  startRequestPowerPlant,
  stopPowerPlant,
  getCurrentProduction,
  POWERPLANT_OUTPUT
};
