const express = require('express');
const router = express.Router();
const pool = require('../config/database').getPool();
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
    try {
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

router.put('/:id/read', authenticateToken, async (req, res) => {
    try {
        await pool.query('UPDATE alerts SET is_read = 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

function createAlert(conjunctionId, severity, message, channel = 'IN_APP') {
    const pool = require('../config/database').getPool();
    return pool.query(
        'INSERT INTO alerts (conjunction_id, severity, message, channel, sent_at) VALUES (?, ?, ?, ?, NOW())',
        [conjunctionId, severity, message, channel]
    );
}

module.exports = router;
module.exports.createAlert = createAlert;
