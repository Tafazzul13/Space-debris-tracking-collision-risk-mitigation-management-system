const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

router.get('/health', (req, res) => res.json({ status: 'ok', service: 'node-api' }));

module.exports = router;
