const { dbClient } = require("./db_client");
const { randomProsumerConsumption } = require("./consumption.js");
const { meanWindSpeed, currWindSpeed } = require("./windspeed.js");
const { turbineOutput } = require("./windturbine.js");

// Create database connection
const client = dbClient();
client.connect(error => {
  if (error) console.error(`Database connection error: ${error}`);
});

/**
 * Update a prosumer's current production.
 *
 * @param prosumerId The id of the prosumer to update
 * */
function updateProsumerProduction(prosumerId) {
  client
    .query(
      `
			SELECT mean_day_wind_speed FROM prosumers WHERE id=$1
		`,
      [prosumerId]
    )
    .then(res => {
      client.query(
        `
				Update prosumers SET current_production=$1 WHERE id=$2
				`,
        [
          turbineOutput(currWindSpeed(res.rows[0].mean_day_wind_speed)),
          prosumerId
        ],
        (err, _res) => {
          if (err) {
            console.error(`Failed to update prosumer: ${err}`);
          }
        }
      );
    })
    .catch(err => console.error(err));
}

function updateProsumerCurrentWindSpeed(prosumerId) {
  client
    .query(
      `
			SELECT mean_day_wind_speed FROM prosumers WHERE id=$1
		`,
      [prosumerId]
    )
    .then(res => {
      client.query(
        `
				Update prosumers SET current_wind_speed=$1 WHERE id=$2
				`,
        [currentWindSpeed(res.rows[0].mean_day_wind_speed), prosumerId],
        (err, _res) => {
          if (err) {
            console.error(`Failed to update prosumer: ${err}`);
          }
        }
      );
    })
    .catch(err => console.error(err));
}

/**
 * Update a prosumers's current consumption.
 *
 * @param prosumerId The id of the prosumer to update
 * */
function updateProsumerConsumption(prosumerId) {
  client.query(
    `
				Update prosumers SET current_consumption=$1 WHERE id=$2
				`,
    [randomProsumerConsumption(), prosumerId],
    (err, _res) => {
      if (err) {
        console.error(`Failed to update prosumer: ${err}`);
      }
    }
  );
}

/**
 * Update a prosumers's mean wind speed.
 *
 * @param prosumerId The id of the prosumer to update
 * */
function updateProsumerMeanWindSpeed(prosumerId) {
  client.query(
    `
			Update prosumers SET mean_day_wind_speed=$1 WHERE id=$2
		`,
    [meanWindSpeed(), prosumerId],
    (err, res) => {
      if (err) {
        console.error(`Failed to update prosumer: ${err}`);
      }
    }
  );
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
function startSimulation({ timeScale, timeStart, tickInterval, tickRatio }) {
  let tickCount = 0;
  let time = timeStart;
  return setInterval(() => {
    console.log(
      `SIMUPDATE (tick ${tickCount}, time: ${new Date(time).toISOString()})`
    );
    tickCount++;
    time += timeScale / tickRatio;
    let tickReset = false;
    if (tickCount >= tickRatio) {
      tickCount = 0;
      tickReset = true;
    }
    updateProsumers(tickReset);
  }, tickInterval);
}

function updateProsumers(tickReset) {
  client.query(
    `
			SELECT id FROM prosumers
		`,
    (err, res) => {
      if (err) {
        console.error(`Failed to fetch prosumers: ${err}`);
      } else {
        res.rows.forEach(prosumer => {
          updateProsumerConsumption(prosumer.id);
          updateProsumerProduction(prosumer.id);
          updateProsumerCurrentWindSpeed(prosumer.id);
          if (tickReset) updateProsumerMeanWindSpeed(prosumer.id);
        });
      }
    }
  );
}

module.exports = { startSimulation };
