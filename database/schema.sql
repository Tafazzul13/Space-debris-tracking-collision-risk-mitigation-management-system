CREATE DATABASE IF NOT EXISTS space_debris_db;
USE space_debris_db;

CREATE TABLE satellite (
    satellite_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    operator VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE debris (
    debris_id INT PRIMARY KEY AUTO_INCREMENT,
    object_name VARCHAR(120) NOT NULL UNIQUE,
    object_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'TRACKED'
);

CREATE TABLE orbital_data (
    orbit_id INT PRIMARY KEY AUTO_INCREMENT,
    satellite_id INT NULL,
    debris_id INT NULL,
    altitude_km DECIMAL(8,2) NOT NULL,
    inclination DECIMAL(6,2) NOT NULL,
    CONSTRAINT fk_orbit_satellite FOREIGN KEY (satellite_id) REFERENCES satellite(satellite_id),
    CONSTRAINT fk_orbit_debris FOREIGN KEY (debris_id) REFERENCES debris(debris_id),
    CONSTRAINT chk_orbital_data_single_owner CHECK (
        (satellite_id IS NOT NULL AND debris_id IS NULL)
        OR
        (satellite_id IS NULL AND debris_id IS NOT NULL)
    )
);

CREATE TABLE ground_station (
    station_id INT PRIMARY KEY AUTO_INCREMENT,
    station_name VARCHAR(120) NOT NULL UNIQUE,
    country VARCHAR(80) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE observation (
    observation_id INT PRIMARY KEY AUTO_INCREMENT,
    debris_id INT NOT NULL,
    station_id INT NOT NULL,
    signal_quality VARCHAR(20) NOT NULL,
    CONSTRAINT fk_observation_debris FOREIGN KEY (debris_id) REFERENCES debris(debris_id),
    CONSTRAINT fk_observation_station FOREIGN KEY (station_id) REFERENCES ground_station(station_id)
);

CREATE TABLE close_approach (
    approach_id INT PRIMARY KEY AUTO_INCREMENT,
    satellite_id INT NOT NULL,
    debris_id INT NOT NULL,
    minimum_distance DECIMAL(8,2) NOT NULL,
    CONSTRAINT fk_close_approach_satellite FOREIGN KEY (satellite_id) REFERENCES satellite(satellite_id),
    CONSTRAINT fk_close_approach_debris FOREIGN KEY (debris_id) REFERENCES debris(debris_id)
);

CREATE TABLE risk_assessment (
    risk_id INT PRIMARY KEY AUTO_INCREMENT,
    approach_id INT NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    assessment_date DATE NOT NULL,
    CONSTRAINT fk_risk_approach FOREIGN KEY (approach_id) REFERENCES close_approach(approach_id),
    CONSTRAINT chk_risk_level CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

CREATE TABLE mitigation_action (
    action_id INT PRIMARY KEY AUTO_INCREMENT,
    approach_id INT NOT NULL,
    action_type VARCHAR(80) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    CONSTRAINT fk_action_approach FOREIGN KEY (approach_id) REFERENCES close_approach(approach_id),
    CONSTRAINT chk_action_status CHECK (status IN ('PLANNED', 'EXECUTED', 'RESOLVED'))
);
