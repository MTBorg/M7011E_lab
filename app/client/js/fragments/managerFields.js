const prosumerFields = `
fragment managerFields on prosumer {
	meanDayWindSpeed,
	currentWindSpeed,
	currentProduction,
	currentConsumption,
	ratioExcessMarket,
	ratioDeficitMarket,
	battery {
		power,
		maxCapacity
	}
}
`;
