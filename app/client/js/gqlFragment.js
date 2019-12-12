/**
 * Helper fragments used in graphql queries
 *
 */

const prosumerFields = `
	fragment prosumerFields on prosumer {
		meanDayWindSpeed,
		currentWindSpeed,
		currentProduction,
		currentConsumption,
		ratioExcessMarket,
		ratioDeficitMarket,
		battery
	} 
 `;

module.exports = { prosumerFields };
