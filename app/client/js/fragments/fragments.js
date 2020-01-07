const managerFields = `
fragment managerFields on manager {
	powerplant {
		status,
		battery {
			power,
			maxCapacity
		},
		currentProduction
	}
}
`;

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
