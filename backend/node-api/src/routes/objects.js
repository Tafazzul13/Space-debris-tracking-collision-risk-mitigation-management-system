const express = require('express');
const router = express.Router();
const { getObjects, getConjunctions, acknowledgeConjunction, getManeuvers, getAlerts } = require('../controllers/spaceController');
const { authenticateToken } = require('../middleware/auth');

router.get('/objects', authenticateToken, getObjects);
router.get('/conjunctions', authenticateToken, getConjunctions);
router.post('/conjunctions/:id/acknowledge', authenticateToken, acknowledgeConjunction);
router.get('/maneuvers', authenticateToken, getManeuvers);
router.get('/alerts', authenticateToken, getAlerts);

module.exports = router;
