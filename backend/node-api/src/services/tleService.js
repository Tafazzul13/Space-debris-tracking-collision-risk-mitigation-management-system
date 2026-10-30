const axios = require('axios');
const { getPool } = require('../config/db');

const CELESTRAK_URL = process.env.CELESTRAK_BASE_URL || 'https://celestrak.org/NORAD/elements/gp.php';

async function ingestTLE(req, res) {
  try {
    const { category = 'active' } = req.query;
    const response = await axios.get(CELESTRAK_URL, {
      params: { GROUP: category, FORMAT: 'tle' },
      timeout: 30000
    });

    const tleText = response.data;
    const lines = tleText.split('\n').filter(l => l.trim());
    const pool = await getPool();
    let inserted = 0;

    for (let i = 0; i < lines.length - 1; i += 3) {
      const nameLine = lines[i].trim();
      const line1 = lines[i + 1].trim();
      const line2 = lines[i + 2].trim();

      if (!line1.startsWith('1 ') || !line2.startsWith('2 ')) continue;

      const noradId = parseInt(line1.substring(2, 7), 10);
      const epochStr = line1.substring(18, 32).trim();
      const epoch = parseTLEEpoch(epochStr);

      // Insert object
      const [objResult] = await pool.query(
        'INSERT IGNORE INTO space_objects (norad_id, name, object_type) VALUES (?, ?, ?)',
        [noradId, nameLine, 'SATELLITE']
      );

      let objectId;
      if (objResult.insertId) {
        objectId = objResult.insertId;
      } else {
        const [existing] = await pool.query('SELECT id FROM space_objects WHERE norad_id = ?', [noradId]);
        objectId = existing[0].id;
      }

      // Insert TLE
      await pool.query(
        'INSERT IGNORE INTO tle_records (object_id, line1, line2, epoch, source) VALUES (?, ?, ?, ?, ?)',
        [objectId, line1, line2, epoch, 'celestrak']
      );
      inserted++;
    }

    res.json({ success: true, inserted, source: 'celestrak' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function parseTLEEpoch(epochStr) {
  // TLE epoch format: YYDDD.DDDDDDDD
  const yy = parseInt(epochStr.substring(0, 2), 10);
  const ddd = parseFloat(epochStr.substring(2));
  const year = yy < 57 ? 2000 + yy : 1900 + yy;
  const dayOfYear = Math.floor(ddd);
  const fraction = ddd - dayOfYear;
  const date = new Date(Date.UTC(year, 0, dayOfYear));
  const msOfDay = fraction * 24 * 60 * 60 * 1000;
  date.setUTCMilliseconds(date.getUTCMilliseconds() + msOfDay);
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

module.exports = { ingestTLE };
