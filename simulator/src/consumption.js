const gaussian = require("gaussian");

const consumptionMean = 32;
const consumptionVariance = 10;

function getNormalSample(mean, variance) {
  const distribution = gaussian(mean, variance);

  return distribution.ppf(Math.random());
}

function getHouseholdConsumption() {
  const result = getNormalSample(consumptionMean, consumptionVariance);

  // Electricity consumption should not be allowed to be negative
  return result < 0 ? 0 : result;
}

module.exports = { getHouseholdConsumption };
