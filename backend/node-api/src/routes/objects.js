const express = require('express');
const router = express.Router();
const { getObjects, getConjunctions, acknowledgeConjunction } = require('../controllers/spaceController');
const { authenticateToken } = require('../middleware/auth');

router.get('/objects', authenticateToken, getObjects);
router.get('/conjunctions', authenticateToken, getConjunctions);
router.post('/conjunctions/:id/acknowledge', authenticateToken, acknowledgeConjunction);

module.exports = router;
