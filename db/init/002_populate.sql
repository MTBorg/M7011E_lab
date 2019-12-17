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

INSERT INTO accounts(email, password_hash) VALUES
	('e1@email.com', 'password_hash'), 
	('e2@email.com', 'password_hash'), 
	('e3@email.com', 'password_hash'), 
	('e4@email.com', 'password_hash'), 
	('e5@email.com', 'password_hash'), 
	('e6@email.com', 'password_hash'), 
	('e7@email.com', 'password_hash'), 
	('e8@email.com', 'password_hash'), 
	('e9@email.com', 'password_hash'), 
	('e10@email.com', 'password_hash'),
	('manager@email.com', 'password_hash');


INSERT INTO prosumers (account_id, mean_day_wind_speed, battery_id, ratio_excess_market, ratio_deficit_market) VALUES
	(1, 15, 1, 0.3, 0.2),
	(2, 10, 2, 0.3, 0.2),
	(3, 5, 3, 0.3, 0.2),
	(4, 2, 4, 0.3, 0.2),
	(5, 0, 5, 0.3, 0.2),
	(6, 7, 6, 0.3, 0.2),
	(7, 8, 7, 0.3, 0.2),
	(8, 4, 8, 0.3, 0.2),
	(9, 6, 9, 0.3, 0.2),
	(10, 12, 10, 0.3, 0.2);

INSERT INTO managers (account_id) VALUES (11);

WITH power_plant_bat AS (
	INSERT INTO batteries (max_capacity, power) VALUES(5000, 0) RETURNING id
)
INSERT INTO power_plants (battery_id, status) VALUES((SELECT id FROM power_plant_bat), 'stopped');
