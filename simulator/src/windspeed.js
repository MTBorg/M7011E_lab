const gaussian = require("gaussian");

// wind config in m/s
const mean = 5.26;
const dev = 3.24;
let variance = dev ** 2;

/**
 * Samples a average day wind speed from a Gaussian distribution
 * and returns the result
 * @returns the average wind speed
 */
function meanWindSpeed() {
  const distrib = gaussian(mean, variance);
  return distrib.ppf(Math.random());
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
  } else if (currWindSpeed > 40) {
    currWindSpeed = 40;
  }
  return currWindSpeed;
}

module.exports = { currWindSpeed, meanWindSpeed };

// let dayWS = meanWindSpeed();
// console.log("dayWS = ", dayWS);

// for (i = 0; i < 25; i++) {
//   hourWS = currWindSpeed(dayWS);
//   console.log("hourWS = ", hourWS);
// }