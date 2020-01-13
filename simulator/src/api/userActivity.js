const { pool } = require("../db.js");

const TIMESTAMP_QUERY = `
	UPDATE accounts SET last_activity=CURRENT_TIMESTAMP, online=true WHERE id=$1 RETURNING last_activity
`;
const SET_OFFLINE_QUERY = `
	UPDATE accounts SET online=false WHERE id=$1 RETURNING online
`;

/**
 * Timestamps a users activity and marks them as online
 * @param {Number} accountId the users account id
 */
async function timestampUser(accountId) {
  try {
    const res = await pool.query(TIMESTAMP_QUERY, [accountId]);
    return res.rows[0].last_activity;
  } catch (error) {
    console.log(`Failed to timestamp user: ${error}`);
    return new Error(error);
  }
}

/**
 * Marks a user as offline
 * @param {Number} accountId the users account id
 */
async function setUserOffline(accountId) {
  try {
    const res = await pool.query(SET_OFFLINE_QUERY, [accountId]);
    return !res.rows[0].online ? "offline" : null;
  } catch (error) {
    console.log(`Failed to set user as offline: ${error}`);
    return new Error(error);
  }
}

module.exports = { timestampUser, setUserOffline };
