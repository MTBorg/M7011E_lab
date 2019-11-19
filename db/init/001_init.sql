CREATE USER gle;
CREATE DATABASE gle;
GRANT ALL PRIVILEGES ON DATABASE gle TO gle;
ALTER DATABASE gle OWNER TO gle;

\c gle

CREATE TABLE prosumers (
	id SERIAL,
	mean_day_wind_speed REAL,
	current_wind_speed REAL,
	current_consumption REAL,
	PRIMARY KEY (id)
);
ALTER TABLE prosumers OWNER TO gle;