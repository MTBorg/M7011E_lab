const { pool } = require("../db.js");

async function getImage(accountId) {
  const query = "SELECT image FROM accounts WHERE id=$1";
  try {
    const res = await pool.query(query, [accountId]);
    return res.rows[0].image;
  } catch (error) {
    console.log(`Failed to retrieve image: ${error};`);
  }
}

async function getProsumerImage(prosumerId) {
  const query = `
		SELECT image
		FROM accounts 
		WHERE id IN (
			SELECT account_id as id
			FROM prosumers
			WHERE id=$1
		)
		`;
  try {
    const res = await pool.query(query, [prosumerId]);
    return res.rows[0].image;
  } catch (error) {
    console.log(`Failed to retrieve image: ${error};`);
  }
}

module.exports = { getImage, getProsumerImage };
