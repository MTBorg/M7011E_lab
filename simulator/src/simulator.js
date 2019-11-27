const { pool } = require("./db");
const { randomProsumerConsumption } = require("./consumption.js");
const { meanWindSpeed, currWindSpeed } = require("./windspeed.js");
const { turbineOutput } = require("./windturbine.js");
const { chargeBattery, useBatteryPower } = require("./battery.js");
const { excessRatio, deficitRatio } = require("./ratio.js");
const { sellToMarket, buyFromMarket } = require("./market.js");
const { POWERPLANT_OUTPUT } = require("./powerplant");

/**
 * Update a prosumers's mean wind speed.
 *
 * @param prosumerId The id of the prosumer to update
 * */
function updateProsumerMeanWindSpeed(prosumerId) {
  const dayMeanWindSpeed = meanWindSpeed();

  pool.query(
    `
			Update prosumers SET mean_day_wind_speed=$1 WHERE id=$2
		`,
    [dayMeanWindSpeed, prosumerId],
    err => {
      if (err) {
        console.error(`Failed to update prosumer: ${err}`);
      }
    }
  );
}

function updateProsumerTick(prosumerId) {
  pool
    .query(
      `
			SELECT mean_day_wind_speed FROM prosumers WHERE id=$1
		`,
      [prosumerId]
    )
    .then(async res => {
      const currWind = currWindSpeed(res.rows[0].mean_day_wind_speed);
      const produced = turbineOutput(currWind);
      const consumed = randomProsumerConsumption();

      // Handle diffrences in production and consumption
      if (produced > consumed) {
        const excess = produced - consumed;
        const ratioExcessMarket = await excessRatio(prosumerId);
        let marketAmount = ratioExcessMarket * excess;
        const batteryAmount = (1 - ratioExcessMarket) * excess;
        const chargedAmount = await chargeBattery(prosumerId, batteryAmount);

        // add any excess power, which couldnt be stored in the battery, to the market amount
        if (chargedAmount !== batteryAmount) {
          marketAmount += batteryAmount - chargedAmount;
        }

        // TODO: Handle balance for prosumers etc
        sellToMarket(marketAmount);
      } else if (consumed > produced) {
        const deficit = consumed - produced;
        const ratioDeficitMarket = await deficitRatio(prosumerId);
        let marketAmount = ratioDeficitMarket * deficit;
        const batteryAmount = (1 - ratioDeficitMarket) * deficit;

        const usedAmount = await useBatteryPower(prosumerId, batteryAmount);

        // if the power stored in the battery was less than battery amount buy more from the market
        if (usedAmount !== batteryAmount) {
          marketAmount += batteryAmount - usedAmount;
        }

        // TODO: Handle balance for prosumers etc
        buyFromMarket(marketAmount);
      }

      pool.query(
        `
				Update prosumers 
				SET current_production=$1, current_consumption=$2, current_wind_speed=$3
				WHERE id=$4
				`,
        [produced, consumed, currWind, prosumerId],
        err => {
          if (err) {
            console.error(`Failed to update prosumer: ${err}`);
          }
        }
      );
    })
    .catch(err => console.error(err));
}

function updateProsumers(tickReset) {
  pool.query(
    `
			SELECT id FROM prosumers
		`,
    (err, res) => {
      if (err) {
        console.error(`Failed to fetch prosumers: ${err}`);
      } else {
        res.rows.forEach(prosumer => {
          updateProsumerTick(prosumer.id);
          if (tickReset) updateProsumerMeanWindSpeed(prosumer.id);
        });
      }
    }
  );
}

async function updatePowerPlants() {
  const powerPlants = await pool.query(
    `
		SELECT id, status FROM power_plants;
		`
  );

  // Note: There is only assumed to be one power plant in existence,
  // so this looping is kind of redundant, unless multiple power plants is
  // implemented in the future.
  powerPlants.rows.forEach(async powerPlant => {
    const powerDiff = await pool.query(
      `
				SELECT (
					(SELECT SUM(current_production) FROM prosumers) - 
					(SELECT SUM(current_consumption) FROM prosumers)) as diff
				`
    );
    pool
      .query(
        `
    UPDATE batteries
		SET power=(
			CASE 
			WHEN power+$1 > max_capacity then
				max_capacity
			WHEN power+$1 < 0 then
				0
			ELSE 
				power+$1
			end
		)
    WHERE id = (
    SELECT battery_id
    FROM power_plants
    WHERE id = $2
    )
    `,
        [POWERPLANT_OUTPUT - powerDiff.rows[0].diff, powerPlant.id]
      )
      .then()
      .catch(e => console.error(e));
  });
}

/**
 * Start the simulation.
 *
 * Start running the simulation by using an interval timer.
 * At the end of each time scale the simulation updates the database with new mean
 * values and etc.
 * Unless stopped, the simulation will be run indefinitely. It can be stopped
 * by calling clearInterval with the <Timeout> object return by this function.
 * @see https://nodejs.org/api/timers.html#timers_class_timeout
 *
 * @param An object with keys timeScale, startTime, tickInterval and tickRatio.
 * 	timeScale represents the scale (in milliseconds) of which time is to be simulated.
 *	timeStart represents the unix-time the simulation will start from.
 * 	tickInterval specifies the real time (in milliseconds) between the updates
 * 		of the simulation.
 * 	tickRatio specifies the ratio between each tick and the time scale, e.g. if
 * 		timeScale is set to one day and tickRatio is set to 24, then each tick represents
 * 		one hour of the simulated time. This means that the simulated time between each
 * 		updated is determined by the ratio of timeScale/tickRatio, e.g. if
 * 		timeScale=1000*3600*6 (six hours) and tickRatio=12, then each update will move the
 * 		simulation forward 30 minutes in time.
 *
 * @example To run a simulation that simulates time every other second starting from
 * 	now and where each update moves the simulation forward two hours of simulated time,
 * 	one may call this function as
 * 		startSimulation({
 * 			timeScale: 1000*3600*24,
 * 			timeStart: Date.now(),
 * 			tickInterval: 3600*1000*60,
 * 			tickRatio: 12
 * 		})
 *
 * @return A <Timeout> object which can be used to stop the simulation.
 * */
async function startSimulation({
  timeScale,
  timeStart,
  tickInterval,
  tickRatio
}) {
  let tickCount = 0;
  let time = timeStart;
  return setInterval(() => {
    console.log(
      `SIMUPDATE (tick ${tickCount}, time: ${new Date(time).toISOString()})`
    );
    tickCount += 1;
    time += timeScale / tickRatio;
    let tickReset = false;
    if (tickCount >= tickRatio) {
      tickCount = 0;
      tickReset = true;
    }
    updateProsumers(tickReset);
    updatePowerPlants();
  }, tickInterval);
}

module.exports = { startSimulation };
