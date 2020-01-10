const { pool } = require("../../db");

const BLOCK_TIME = 10000;

async function blockProsumer(prosumerId) {
  const response = await pool.query(
    `
		UPDATE prosumers
		SET blocked=true
		WHERE id=$1
		RETURNING blocked`,
    [prosumerId]
  );
  if (response.rowCount == 0 || !response.rows[0].blocked) {
    return false;
  }
  setTimeout(async () => {
    const response = await pool.query(
      `
		UPDATE prosumers
		SET blocked=false
		WHERE id=$1
		RETURNING blocked
		`,
      [prosumerId]
    );
    if (response.rowCount == 0 || !response.rows[0].blocked) {
      return false;
    }
    return true;
  }, BLOCK_TIME);

  return true;
}

module.exports = { blockProsumer };
