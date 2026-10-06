USE space_debris_db;

INSERT INTO satellite (name, operator, status) VALUES
('SAT-008', 'ISRO', 'ACTIVE'),
('SAT-014', 'ESA', 'ACTIVE'),
('SAT-021', 'NASA', 'ACTIVE');

INSERT INTO debris (object_name, object_type, status) VALUES
('D-2098', 'Fragment', 'TRACKED'),
('D-8831', 'Defunct Payload', 'TRACKED'),
('D-3312', 'Rocket Body', 'TRACKED');

INSERT INTO orbital_data (satellite_id, debris_id, altitude_km, inclination) VALUES
(1, NULL, 540.00, 97.40),
(2, NULL, 700.00, 98.60),
(3, NULL, 620.00, 97.80),
(NULL, 1, 538.50, 97.30),
(NULL, 2, 705.10, 98.70),
(NULL, 3, 618.00, 97.70);

INSERT INTO ground_station (station_name, country, status) VALUES
('Bengaluru GS', 'India', 'ACTIVE'),
('Toulouse GS', 'France', 'ACTIVE');

INSERT INTO observation (debris_id, station_id, signal_quality) VALUES
(1, 1, 'GOOD'),
(1, 2, 'FAIR'),
(2, 2, 'GOOD'),
(3, 1, 'GOOD');

INSERT INTO close_approach (satellite_id, debris_id, minimum_distance) VALUES
(2, 1, 3.20),
(3, 2, 5.80),
(1, 3, 2.10);

INSERT INTO risk_assessment (approach_id, risk_level, assessment_date) VALUES
(1, 'HIGH', '2026-01-20'),
(2, 'MEDIUM', '2026-01-21'),
(3, 'CRITICAL', '2026-01-22');

INSERT INTO mitigation_action (approach_id, action_type, status) VALUES
(1, 'Orbit Adjustment', 'PLANNED'),
(3, 'Collision Avoidance Maneuver', 'EXECUTED');
