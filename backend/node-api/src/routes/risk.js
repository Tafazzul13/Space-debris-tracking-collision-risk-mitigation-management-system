const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { scanConjunctions, getEphemeris, calculateDeltaV } = require('../services/javaClient');

router.post('/scan', authenticateToken, scanConjunctions);
router.get('/objects/:objectId/ephemeris', authenticateToken, getEphemeris);
router.post('/calculate-dv', authenticateToken, calculateDeltaV);

module.exports = router;
