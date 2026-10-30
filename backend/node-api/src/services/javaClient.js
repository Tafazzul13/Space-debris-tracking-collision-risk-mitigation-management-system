const { getPool } = require('../config/db');

async function callJavaEngine(endpoint, method = 'GET', body = null) {
  const base = process.env.JAVA_ENGINE_URL || 'http://localhost:8081';
  const url = `${base}${endpoint}`;
  const options = { method, timeout: 30000 };
  if (body) {
    options.headers = { 'Content-Type': 'application/json' };
    options.data = body;
  }
  const axios = require('axios');
  const response = await axios(url, options);
  return response.data;
}

async function scanConjunctions(req, res) {
  try {
    const result = await callJavaEngine('/api/risk/scan', 'POST');
    res.json({ success: true, message: 'Scan triggered', result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getEphemeris(req, res) {
  try {
    const { objectId } = req.params;
    const { start, end } = req.query;
    const result = await callJavaEngine(`/api/risk/objects/${objectId}/ephemeris?start=${start}&end=${end}`);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function calculateDeltaV(req, res) {
  try {
    const { missDistanceKm, requiredMissDistanceKm } = req.body;
    const result = await callJavaEngine('/api/mitigation/maneuvers/calculate-dv', 'POST', { missDistanceKm, requiredMissDistanceKm });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { scanConjunctions, getEphemeris, calculateDeltaV };
