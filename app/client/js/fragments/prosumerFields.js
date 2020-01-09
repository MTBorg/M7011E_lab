const prosumerFields = `
fragment prosumerFields on prosumer {
	meanDayWindSpeed,
	currentWindSpeed,
	currentProduction,
	currentConsumption,
	ratioExcessMarket,
	ratioDeficitMarket,
	blocked,
	battery {
		power,
		maxCapacity
	}
} 
`;
