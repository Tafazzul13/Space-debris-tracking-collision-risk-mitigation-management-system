const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../config/database').getPool();
const { authenticateToken, requireRole } = require('../middleware/auth');
const JAVA_ENGINE_URL = process.env.JAVA_ENGINE_URL || 'http://localhost:8081';

router.post('/maneuvers', authenticateToken, requireRole('ADMIN', 'ANALYST'), async (req, res) => {
    try {
        const { objectId, conjunctionId, direction, maneuverTime, dvMs } = req.body;
        const response = await axios.post(`${JAVA_ENGINE_URL}/api/mitigation/maneuvers`, null, {
            params: { objectId, conjunctionId, direction, maneuverTime, dvMs }
        });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/maneuvers', authenticateToken, async (req, res) => {
    try {
        const response = await axios.get(`${JAVA_ENGINE_URL}/api/mitigation/maneuvers`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/maneuvers/:id/execute', authenticateToken, requireRole('ADMIN', 'ANALYST'), async (req, res) => {
    try {
        const response = await axios.post(`${JAVA_ENGINE_URL}/api/mitigation/maneuvers/${id}/execute`);
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/maneuvers/calculate-dv', authenticateToken, async (req, res) => {
    try {
        const { missDistanceKm, requiredMissDistanceKm } = req.body;
        const response = await axios.post(`${JAVA_ENGINE_URL}/api/mitigation/maneuvers/calculate-dv`, null, {
            params: { missDistanceKm, requiredMissDistanceKm }
        });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
