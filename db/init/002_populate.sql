\c gle

-- Creates 10 batteries with varying max capacities
INSERT INTO batteries (max_capacity) VALUES
	(50),
	(75),	
	(100),	
	(65),	
	(55),	
	(50),	
	(75),	
	(125),	
	(65),	
	(55);

INSERT INTO prosumers (mean_day_wind_speed, battery_id, ratio_excess_market, ratio_deficit_market) VALUES
	(15, 1, 0.3, 0.2),
	(10, 2, 0.3, 0.2),
	(5, 3, 0.3, 0.2),
	(2, 4, 0.3, 0.2),
	(0, 5, 0.3, 0.2),
	(7, 6, 0.3, 0.2),
	(8, 7, 0.3, 0.2),
	(4, 8, 0.3, 0.2),
	(6, 9, 0.3, 0.2),
	(12, 10, 0.3, 0.2);

WITH power_plant_bat AS (
	INSERT INTO batteries (max_capacity, power) VALUES(5000, 0) RETURNING id
)
INSERT INTO power_plants (current_production, battery_id, status) VALUES(0, (SELECT id FROM power_plant_bat), 'stopped');
