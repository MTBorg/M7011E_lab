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
    if (tickCount >= tickRatio) {
      //TODO: Update mean values
      tickCount = 0;
    }
  }, tickInterval);
}

module.exports = { startSimulation };
