const { pool } = require("../db.js");

const TIMESTAMP_QUERY = `
	UPDATE accounts SET last_activity=CURRENT_TIMESTAMP, online=true WHERE id=$1
`;

/**
 * Timestamps a users activity and marks them as online
 * @param {Number} accountId the users account id
 */
function timestampUser(accountId) {
  pool
    .query(TIMESTAMP_QUERY, [accountId])
    .catch(err => console.error(`Failed to timestamp user: ${err}`));
}

module.exports = { timestampUser };
