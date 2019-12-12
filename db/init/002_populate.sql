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

INSERT INTO prosumers (email, password_hash, mean_day_wind_speed, battery_id, ratio_excess_market, ratio_deficit_market) VALUES
	('e1@email.com', 'password_hash', 15, 1, 0.3, 0.2),
	('e2@email.com', 'password_hash', 10, 2, 0.3, 0.2),
	('e3@email.com', 'password_hash', 5, 3, 0.3, 0.2),
	('e4@email.com', 'password_hash', 2, 4, 0.3, 0.2),
	('e5@email.com', 'password_hash', 0, 5, 0.3, 0.2),
	('e6@email.com', 'password_hash', 7, 6, 0.3, 0.2),
	('e7@email.com', 'password_hash', 8, 7, 0.3, 0.2),
	('e8@email.com', 'password_hash', 4, 8, 0.3, 0.2),
	('e9@email.com', 'password_hash', 6, 9, 0.3, 0.2),
	('e10@email.com', 'password_hash', 12, 10, 0.3, 0.2);

WITH power_plant_bat AS (
	INSERT INTO batteries (max_capacity, power) VALUES(5000, 0) RETURNING id
)
INSERT INTO power_plants (battery_id, status) VALUES((SELECT id FROM power_plant_bat), 'stopped');
