CREATE USER gle;
CREATE DATABASE gle;
GRANT ALL PRIVILEGES ON DATABASE gle TO gle;
ALTER DATABASE gle OWNER TO gle;

\c gle

CREATE TABLE batteries (
	id SERIAL,
	power NUMERIC DEFAULT 0,
	max_capacity NUMERIC,
	PRIMARY KEY (id)
);
ALTER TABLE batteries OWNER TO gle;

CREATE TABLE accounts (
	id SERIAL,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	image BYTEA,
	PRIMARY KEY (id)
);
ALTER TABLE accounts OWNER TO gle;

CREATE TABLE prosumers (
	id SERIAL,
	account_id INT NOT NULL,
	mean_day_wind_speed NUMERIC DEFAULT 0.0,
	current_wind_speed NUMERIC DEFAULT 0.0,
	current_consumption NUMERIC DEFAULT 0.0,
	current_production NUMERIC DEFAULT 0.0,
	ratio_excess_market NUMERIC DEFAULT 0.0,
	ratio_deficit_market NUMERIC DEFAULT 0.0,
	battery_id INTEGER NOT NULL,
	blocked BOOLEAN DEFAULT false,
	blackout BOOLEAN DEFAULT false,
	PRIMARY KEY (id),
	FOREIGN KEY (account_id) REFERENCES accounts(id),
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

CREATE TABLE managers(
	id SERIAL,
	account_id INT NOT NULL,
	power_plant_id INT NOT NULL DEFAULT 1,
	ratio_production_market NUMERIC DEFAULT 0.5,
	PRIMARY KEY (id),
	FOREIGN KEY (account_id) REFERENCES accounts (id),
	FOREIGN KEY (power_plant_id) REFERENCES power_plants (id)
);
ALTER TABLE managers OWNER TO gle;