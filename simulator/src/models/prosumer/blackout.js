const { pool } = require("../../db.js");

const blackoutQuery = `
UPDATE prosumers SET blackout = $2 WHERE id = $1
`;

/**
 * Sets the prosumers house hold blackout status
 * @param {Number} prosumerId the prosumer id
 * @param {Boolean} status true or false dependant on blackout or not
 */
async function setBlackout(prosumerId, status) {
  try {
    await pool.query(blackoutQuery, [prosumerId, status]);
  } catch (e) {
    console.error(e);
  }
  return status;
}

module.exports = { setBlackout, blackoutQuery };
