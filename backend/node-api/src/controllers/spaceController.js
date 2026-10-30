const { getPool } = require('../config/db');

async function getObjects(req, res) {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM space_objects WHERE is_active = 1 LIMIT 100');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getConjunctions(req, res) {
  try {
    const pool = await getPool();
    const { riskLevel } = req.query;
    let query = 'SELECT * FROM conjunctions WHERE is_acknowledged = 0';
    const params = [];
    if (riskLevel) {
      query += ' AND risk_level = ?';
      params.push(riskLevel);
    }
    query += ' ORDER BY tca ASC LIMIT 100';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function acknowledgeConjunction(req, res) {
  try {
    const pool = await getPool();
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    await pool.query(
      'UPDATE conjunctions SET is_acknowledged = 1, acknowledged_by = ?, acknowledged_at = NOW() WHERE id = ?',
      [userId, id]
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getManeuvers(req, res) {
  try {
    const pool = await getPool();
    const [rows] = await pool.query("SELECT * FROM maneuvers WHERE status = 'PLANNED' ORDER BY maneuver_time ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAlerts(req, res) {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM alerts ORDER BY sent_at DESC LIMIT 50');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getObjects, getConjunctions, acknowledgeConjunction, getManeuvers, getAlerts };
