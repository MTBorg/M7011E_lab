CREATE USER gle;
CREATE DATABASE gle;
GRANT ALL PRIVILEGES ON DATABASE gle TO gle;
ALTER DATABASE gle OWNER TO gle;

\c gle

CREATE TABLE batteries (
	id SERIAL,
	power REAL,
	max_capacity REAL,
	PRIMARY KEY (id)
);
ALTER TABLE batteries OWNER TO gle;

CREATE TABLE prosumers (
	id SERIAL,
	mean_day_wind_speed REAL,
	current_wind_speed REAL,
	current_consumption REAL,
	current_production REAL,
	battery_id INTEGER,
	PRIMARY KEY (id),
	FOREIGN KEY (battery_id) REFERENCES batteries (id)
);
ALTER TABLE prosumers OWNER TO gle;
