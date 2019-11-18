CREATE USER gle;
CREATE DATABASE gle;
GRANT ALL PRIVILEGES ON DATABASE gle TO gle;

\c gle

CREATE TABLE prosumers (
	id SERIAL,
	mean_day_wind_speed BIGINT,
	current_wind_speed BIGINT,
	current_consumption BIGINT,
	PRIMARY KEY (id)
);