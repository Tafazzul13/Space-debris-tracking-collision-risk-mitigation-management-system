const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(`
      SELECT a.*, c.min_distance_km, c.poc, c.risk_level
      FROM alerts a
      JOIN conjunctions c ON a.conjunction_id = c.id
      ORDER BY a.sent_at DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/alerts/:id/read', authenticateToken, async (req, res) => {
  try {
    const pool = await getPool();
    await pool.query('UPDATE alerts SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// _broadcast is wired from server.js after startup so alerts trigger WebSocket pushes
let _broadcast = null;
function setBroadcast(fn) { _broadcast = fn; }

async function createAlert(conjunctionId, severity, message, channel = 'IN_APP') {
  const pool = await getPool();
  const [result] = await pool.query(
    'INSERT INTO alerts (conjunction_id, severity, message, channel, sent_at) VALUES (?, ?, ?, ?, NOW())',
    [conjunctionId, severity, message, channel]
  );
  // Fixed: broadcast the new alert to all connected WebSocket clients
  if (_broadcast) {
    _broadcast({ id: result.insertId, conjunctionId, severity, message, channel });
  }
  return result;
}

module.exports = router;
module.exports.createAlert = createAlert;
module.exports.setBroadcast = setBroadcast;
