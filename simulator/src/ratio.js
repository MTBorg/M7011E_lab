const { pool } = require("./db.js");

const excessRatioQuery = `
SELECT ratio_excess_market FROM prosumers WHERE id = $1
`;

const deficitRatioQuery = `
SELECT ratio_deficit_market FROM prosumers WHERE id = $1
`;

const setDeficitRatioQuery = `
UPDATE prosumers SET ratio_deficit_market = $2 WHERE id = $1
`;

const setExcessRatioQuery = `
UPDATE prosumers SET ratio_excess_market = $2 WHERE id = $1
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

function setExcessRatio(prosumerId, ratio) {
  pool.query(setExcessRatioQuery, [prosumerId, ratio], (err, _res) => {
    if (err) console.error(err);
  });
  return ratio;
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

function setDeficitRatio(prosumerId, ratio) {
  pool.query(setDeficitRatioQuery, [prosumerId, ratio], (err, _res) => {
    if (err) console.error(err);
  });
  return ratio;
}

module.exports = {
  excessRatio,
  deficitRatio,
  setDeficitRatio,
  setExcessRatio,
  excessRatioQuery,
  deficitRatioQuery,
  setDeficitRatioQuery,
  setExcessRatioQuery
};
