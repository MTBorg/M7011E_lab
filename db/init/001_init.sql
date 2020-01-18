\set db_user `echo "${DB_USER:-gle}"`
\set db_name `echo "${DB_DATABASE:-gle}"`
CREATE USER :db_user;
CREATE DATABASE :db_name;
GRANT ALL PRIVILEGES ON DATABASE :db_name TO :db_user;
ALTER DATABASE :db_name OWNER TO :db_user;

\c :db_name

CREATE TABLE batteries (
	id SERIAL,
	power NUMERIC DEFAULT 0,
	max_capacity NUMERIC,
	PRIMARY KEY (id)
);
ALTER TABLE batteries OWNER TO :db_user;

CREATE TABLE accounts (
	id SERIAL,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	image BYTEA,
	last_activity TIMESTAMP (0),
	online BOOLEAN NOT NULL DEFAULT false,
	PRIMARY KEY (id)
);
ALTER TABLE accounts OWNER TO :db_user;

CREATE TABLE prosumers (
	id SERIAL,
	account_id INT NOT NULL,
	mean_day_wind_speed NUMERIC DEFAULT 0.0,
	current_wind_speed NUMERIC DEFAULT 0.0,
	current_consumption NUMERIC DEFAULT 0.0,
	current_production NUMERIC DEFAULT 0.0,
	ratio_excess_market NUMERIC DEFAULT 0.5,
	ratio_deficit_market NUMERIC DEFAULT 0.5,
	battery_id INTEGER NOT NULL,
	blocked BOOLEAN DEFAULT false,
	blackout BOOLEAN DEFAULT false,
	PRIMARY KEY (id),
	FOREIGN KEY (account_id) REFERENCES accounts(id),
	FOREIGN KEY (battery_id) REFERENCES batteries (id)
);
ALTER TABLE prosumers OWNER TO :db_user;

CREATE TYPE power_plant_status as ENUM('stopped', 'started', 'starting');
CREATE TABLE power_plants (
	id SERIAL,
	battery_id INTEGER,
	market_electricity NUMERIC DEFAULT 0,
	ratio_production_market NUMERIC DEFAULT 0.5,
	status power_plant_status,
	PRIMARY KEY (id),
	FOREIGN KEY (battery_id) REFERENCES batteries (id)
);
ALTER TABLE power_plants OWNER TO :db_user;

CREATE TABLE managers(
	id SERIAL,
	account_id INT NOT NULL,
	power_plant_id INT NOT NULL DEFAULT 1,
	PRIMARY KEY (id),
	FOREIGN KEY (account_id) REFERENCES accounts (id),
	FOREIGN KEY (power_plant_id) REFERENCES power_plants (id)
);
ALTER TABLE managers OWNER TO :db_user;

CREATE TABLE prices(
	price NUMERIC NOT NULL,
	PRIMARY KEY (price)
);
ALTER TABLE prices OWNER TO :db_user;
