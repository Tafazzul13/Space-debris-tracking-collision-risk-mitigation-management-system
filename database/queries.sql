USE space_debris_db;

-- Show all high-risk close approaches
SELECT ca.approach_id, s.name AS satellite, d.object_name AS debris, ca.minimum_distance, ra.risk_level
FROM close_approach ca
JOIN satellite s ON s.satellite_id = ca.satellite_id
JOIN debris d ON d.debris_id = ca.debris_id
JOIN risk_assessment ra ON ra.approach_id = ca.approach_id
WHERE ra.risk_level IN ('HIGH', 'CRITICAL')
ORDER BY ca.minimum_distance ASC;

-- Find the closest satellite-debris approach
SELECT ca.approach_id, s.name AS satellite, d.object_name AS debris, ca.minimum_distance
FROM close_approach ca
JOIN satellite s ON s.satellite_id = ca.satellite_id
JOIN debris d ON d.debris_id = ca.debris_id
ORDER BY ca.minimum_distance ASC
LIMIT 1;

-- Show pending mitigation actions
SELECT ma.action_id, s.name AS satellite, d.object_name AS debris, ma.action_type, ma.status
FROM mitigation_action ma
JOIN close_approach ca ON ca.approach_id = ma.approach_id
JOIN satellite s ON s.satellite_id = ca.satellite_id
JOIN debris d ON d.debris_id = ca.debris_id
WHERE ma.status = 'PLANNED';

-- Find the most-observed debris
SELECT d.object_name, COUNT(o.observation_id) AS observations
FROM observation o
JOIN debris d ON d.debris_id = o.debris_id
GROUP BY d.object_name
ORDER BY observations DESC;

-- Find satellites with highest number of close approaches
SELECT s.name, COUNT(*) AS approaches
FROM close_approach ca
JOIN satellite s ON s.satellite_id = ca.satellite_id
GROUP BY s.name
HAVING COUNT(*) >= 1
ORDER BY approaches DESC;

-- Count risk levels
SELECT risk_level, COUNT(*) AS total
FROM risk_assessment
GROUP BY risk_level;

-- Show observations by ground station
SELECT gs.station_name, d.object_name, o.signal_quality
FROM observation o
JOIN ground_station gs ON gs.station_id = o.station_id
JOIN debris d ON d.debris_id = o.debris_id
ORDER BY gs.station_name;

-- Show active satellites
SELECT satellite_id, name, operator
FROM satellite
WHERE status = 'ACTIVE';

-- Show tracked debris by type/status
SELECT object_type, status, COUNT(*) AS total
FROM debris
GROUP BY object_type, status
ORDER BY total DESC;

-- Dashboard view for quick summary
CREATE OR REPLACE VIEW v_dashboard_summary AS
SELECT
    (SELECT COUNT(*) FROM debris) AS total_tracked_debris,
    (SELECT COUNT(*) FROM satellite WHERE status = 'ACTIVE') AS active_satellites,
    (SELECT COUNT(*) FROM close_approach) AS close_approaches,
    (SELECT COUNT(*) FROM risk_assessment WHERE risk_level IN ('HIGH', 'CRITICAL')) AS high_risk_events,
    (SELECT COUNT(*) FROM mitigation_action WHERE status = 'PLANNED') AS pending_mitigation_actions;
