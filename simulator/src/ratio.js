const { pool } = require("./db.js");

const excessRatioQuery = `
SELECT ratio_excess_market FROM prosumers WHERE id = $1
`;

const deficitRatioQuery = `
SELECT ratio_deficit_market FROM prosumers WHERE id = $1
`;

/**
 * Gets the ratio of the excess power to redirect to the market
 * @param {Number} prosumerId the prosumers id
 * @returns the ratio
 */
async function excessRatio(prosumerId) {
  let ratioExcessMarket = null;
  await pool
    .query(excessRatioQuery, [prosumerId])
    .then(res => (ratioExcessMarket = res.rows[0].ratio_excess_market))
    .catch(err =>
      console.error("Error while querying excess market ratio: ", err)
    );
  return ratioExcessMarket;
}

/**
 * Gets the ratio of the deficit power to buy from the market
 * @param {Number} prosumerId the prosumers id
 * @returns the ratio
 */
async function deficitRatio(prosumerId) {
  let ratioDeficitMarket = null;
  await pool
    .query(deficitRatioQuery, [prosumerId])
    .then(res => (ratioDeficitMarket = res.rows[0].ratio_deficit_market))
    .catch(err =>
      console.error("Error while querying deficit market ratio: ", err)
    );
  return ratioDeficitMarket;
}

module.exports = {
  excessRatio,
  deficitRatio,
  excessRatioQuery,
  deficitRatioQuery
};
