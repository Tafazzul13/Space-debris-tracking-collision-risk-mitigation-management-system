CREATE DATABASE IF NOT EXISTS space_debris_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE space_debris_db;

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('OPERATOR','ANALYST','ADMIN') DEFAULT 'OPERATOR',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE space_objects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    norad_id INT UNIQUE,
    name VARCHAR(255),
    object_type ENUM('SATELLITE','DEBRIS','ROCKET_BODY','PAYLOAD') DEFAULT 'DEBRIS',
    owner_country VARCHAR(100),
    launch_date DATE,
    rcs_m2 DECIMAL(10,4),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_norad (norad_id),
    INDEX idx_type (object_type)
);

CREATE TABLE tle_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    object_id BIGINT NOT NULL,
    line1 VARCHAR(100) NOT NULL,
    line2 VARCHAR(100) NOT NULL,
    epoch DATETIME NOT NULL,
    source VARCHAR(100),
    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (object_id) REFERENCES space_objects(id) ON DELETE CASCADE,
    INDEX idx_object_epoch (object_id, epoch)
);

CREATE TABLE ephemeris (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    object_id BIGINT NOT NULL,
    timestamp DATETIME NOT NULL,
    x_km DECIMAL(15,4),
    y_km DECIMAL(15,4),
    z_km DECIMAL(15,4),
    vx_kms DECIMAL(10,4),
    vy_kms DECIMAL(10,4),
    vz_kms DECIMAL(10,4),
    lat_deg DECIMAL(10,6),
    lon_deg DECIMAL(10,6),
    alt_km DECIMAL(10,4),
    FOREIGN KEY (object_id) REFERENCES space_objects(id) ON DELETE CASCADE,
    INDEX idx_object_time (object_id, timestamp),
    INDEX idx_time (timestamp)
);

CREATE TABLE conjunctions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    primary_object_id BIGINT NOT NULL,
    secondary_object_id BIGINT NOT NULL,
    tca DATETIME NOT NULL,
    min_distance_km DECIMAL(12,4) NOT NULL,
    poc DECIMAL(15,10) NOT NULL,
    risk_level ENUM('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'LOW',
    is_acknowledged TINYINT(1) DEFAULT 0,
    acknowledged_by BIGINT NULL,
    acknowledged_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_object_id) REFERENCES space_objects(id),
    FOREIGN KEY (secondary_object_id) REFERENCES space_objects(id),
    FOREIGN KEY (acknowledged_by) REFERENCES users(id),
    INDEX idx_tca (tca),
    INDEX idx_risk (risk_level),
    INDEX idx_objects (primary_object_id, secondary_object_id)
);

CREATE TABLE maneuvers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    object_id BIGINT NOT NULL,
    conjunction_id BIGINT NULL,
    dv_ms DECIMAL(10,4) NOT NULL,
    direction ENUM('PROGRADE','RETROGRADE','RADIAL_IN','RADIAL_OUT','NORMAL','ANTINORMAL') DEFAULT 'PROGRADE',
    maneuver_time DATETIME NOT NULL,
    status ENUM('PLANNED','EXECUTED','CANCELLED') DEFAULT 'PLANNED',
    new_tle_line1 VARCHAR(100),
    new_tle_line2 VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (object_id) REFERENCES space_objects(id),
    FOREIGN KEY (conjunction_id) REFERENCES conjunctions(id),
    INDEX idx_status (status),
    INDEX idx_object (object_id)
);

CREATE TABLE alerts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conjunction_id BIGINT NOT NULL,
    severity ENUM('INFO','WARNING','CRITICAL') NOT NULL,
    message TEXT NOT NULL,
    channel ENUM('IN_APP','EMAIL','SMS') DEFAULT 'IN_APP',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read TINYINT(1) DEFAULT 0,
    FOREIGN KEY (conjunction_id) REFERENCES conjunctions(id),
    INDEX idx_severity (severity),
    INDEX idx_sent (sent_at)
);

CREATE TABLE audit_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT NULL,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
);

INSERT IGNORE INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@spacedebris.local', '$2a$10$sE.Bnil9GjmLt9AGdEAtmOf0zpJT45a1EMWE6vso/QbDe6DWu5auO', 'ADMIN'),
('analyst', 'analyst@spacedebris.local', '$2a$10$ksReRUICx1FHDo7omE.zg.cm1BOk0Rj1SQhhnETyVihVOdQkkNly.', 'ANALYST'),
('operator', 'operator@spacedebris.local', '$2a$10$690skZc7u68DPkRvEFOeHOIMWf8eRKG8gR5S6050l/SQXWvfv4aZi', 'OPERATOR');
