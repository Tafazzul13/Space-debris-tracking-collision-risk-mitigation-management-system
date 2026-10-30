const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ingestTLE } = require('../services/tleService');

router.post('/tle', authenticateToken, requireRole('ANALYST', 'ADMIN'), ingestTLE);

module.exports = router;
