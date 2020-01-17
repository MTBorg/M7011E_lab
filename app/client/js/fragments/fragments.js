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
	blackout,
	battery {
		power,
		maxCapacity
	}
} 
`;

const prosumerOverviewFields = `
fragment prosumerOverviewFields on prosumer{
	id
	blocked
	blackout
	account{
		online
		email
	}
}
`;

const powerPlantStatusFields = `
fragment powerPlantStatusFields on powerPlant{
	status,
	battery {
		power,
		maxCapacity
	},
	currentProduction
}
`;
