CREATE USER gle;
CREATE DATABASE gle;
GRANT ALL PRIVILEGES ON DATABASE gle TO gle;
ALTER DATABASE gle OWNER TO gle;

\c gle

CREATE TABLE batteries (
	id SERIAL,
	power NUMERIC(5, 2) DEFAULT 0,
	max_capacity NUMERIC(5, 0),
	PRIMARY KEY (id)
);
ALTER TABLE batteries OWNER TO gle;

CREATE TABLE prosumers (
	id SERIAL,
	mean_day_wind_speed NUMERIC(5, 2),
	current_wind_speed NUMERIC(5, 2),
	current_consumption NUMERIC(5, 2),
	current_production NUMERIC(5, 2),
	ratio_excess_market NUMERIC(2, 1),
	ratio_deficit_market NUMERIC(2, 1),
	battery_id INTEGER,
	blackout BOOLEAN DEFAULT false,
	PRIMARY KEY (id),
	FOREIGN KEY (battery_id) REFERENCES batteries (id)
);
ALTER TABLE prosumers OWNER TO gle;

CREATE TYPE power_plant_status as ENUM('stopped', 'started', 'starting');
CREATE TABLE power_plants (
	id SERIAL,
	battery_id INTEGER,
	status power_plant_status,
	PRIMARY KEY (id),
	FOREIGN KEY (battery_id) REFERENCES batteries (id)
);
ALTER TABLE power_plants OWNER TO gle;
