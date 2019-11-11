const gaussian = require("gaussian");

let dayWindSpeed;

function wind_speed() {
  // Wind configs in m/s
  const mean = 5.26;
  const dev = 3.24;
  let variance = dev ^ 2;

  dayMeanWindSpeed = startingWindSpeed(mean, variance);
  console.log("dayMeanWindSpeed = ", dayMeanWindSpeed);

  let curr = currWindSpeed();
  console.log("currWindSpeed = ", curr);
}

/**
 * Samples a starting wind speed from a Gaussian distribution created from
 * the mean and variance of the wind speed supplied to the function
 * @param {Number} mean the mean of the wind speed
 * @param {Number} variance the variance of the wind speed
 * @returns the wind speed
 */
function startingWindSpeed(mean, variance) {
  const distrib = gaussian(mean, variance);
  return distrib.ppf(Math.random());
}

function currWindSpeed() {
  const distrib = gaussian(dayMeanWindSpeed, 3.24 ^ 2);
  const currTime = 23 * 3600;
  return distrib.ppf(currTime / (3600 * 24));
}

wind_speed();
