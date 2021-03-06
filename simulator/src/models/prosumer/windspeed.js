const gaussian = require("gaussian");

// wind config in m/s
const mean = 5.26;
const dev = 3.24;
const variance = dev ** 2;
const MAX_SPEED = 40;

/**
 * Samples a average day wind speed from a Gaussian distribution
 * and returns the result
 * @returns the average wind speed
 */
function meanWindSpeed() {
  const distrib = gaussian(mean, variance);

  while (true) {
    const sample = distrib.ppf(Math.random());

    if (sample > 0) {
      return sample;
    }
  }
}
/**
 * Returns the current wind speed
 * @param {Number} meanWindSpeed the average wind speed
 */
function currWindSpeed(meanWindSpeed) {
  const distrib = gaussian(meanWindSpeed, variance);
  let currWindSpeed = distrib.ppf(Math.random());

  if (currWindSpeed < 0) {
    currWindSpeed = 0;
  } else if (currWindSpeed > MAX_SPEED) {
    currWindSpeed = MAX_SPEED;
  }
  return currWindSpeed;
}

module.exports = { currWindSpeed, meanWindSpeed };
