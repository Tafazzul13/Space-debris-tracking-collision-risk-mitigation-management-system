const axios = require('axios');
const pool = require('../config/database').getPool();
const { createAlert } = require('./routes/alerts');
const cron = require('node-cron');

const SOURCES = [
    { name: 'celestrak', url: 'https://celestrak.org/NORAD/elements/stations.txt' },
    { name: 'celestrak-debris', url: 'https://celestrak.org/NORAD/elements/debris.txt' }
];

function parseTLE(text) {
    const lines = text.trim().split('\n');
    const records = [];
    for (let i = 0; i < lines.length - 2; i++) {
        if (lines[i].startsWith('1 ') && lines[i + 1].startsWith('2 ')) {
            const name = lines[i - 1]?.trim() || 'UNKNOWN';
            records.push({ name, line1: lines[i], line2: lines[i + 1] });
            i++; // skip line2 in outer loop
        }
    }
    return records;
}

async function ingestSource(source) {
    try {
        const response = await axios.get(source.url, { timeout: 30000 });
        const records = parseTLE(response.data);
        let count = 0;

        for (const rec of records) {
            // Try to find NORAD ID from line1
            const noradMatch = rec.line1.match(/\d{5}/);
            const noradId = noradMatch ? parseInt(noradMatch[0]) : null;

            // Insert or find space object
            let [objRows] = await pool.query('SELECT id FROM space_objects WHERE norad_id = ?', [noradId]);
            let objectId;
            if (objRows.length > 0) {
                objectId = objRows[0].id;
            } else {
                const [result] = await pool.query(
                    'INSERT INTO space_objects (norad_id, name, object_type, rcs_m2) VALUES (?, ?, ?, ?)',
                    [noradId, rec.name, 'DEBRIS', 1.0]
                );
                objectId = result.insertId;
            }

            // Parse epoch from TLE line1 (columns 18-32)
            const epochStr = rec.line1.substring(17, 33).trim();
            const epoch = parseTLEEpoch(epochStr);

            // Insert TLE record
            await pool.query(
                'INSERT INTO tle_records (object_id, line1, line2, epoch, source) VALUES (?, ?, ?, ?, ?)',
                [objectId, rec.line1, rec.line2, epoch, source.name]
            );
            count++;
        }
        console.log(`Ingested ${count} records from ${source.name}`);
        return count;
    } catch (err) {
        console.error(`Error ingesting from ${source.name}:`, err.message);
        return 0;
    }
}

function parseTLEEpoch(epochStr) {
    // TLE epoch: YYDDD.DDDDDDDD
    try {
        const yy = parseInt(epochStr.substring(0, 2));
        const ddd = parseFloat(epochStr.substring(2));
        const year = yy < 50 ? 2000 + yy : 1900 + yy;
        const startOfYear = new Date(Date.UTC(year, 0, 1));
        const dayOffset = (ddd - 1) * 24 * 60 * 60 * 1000;
        return new Date(startOfYear.getTime() + dayOffset);
    } catch (e) {
        return new Date();
    }
}

function startIngestion(broadcastCallback) {
    // Initial ingest
    (async () => {
        for (const source of SOURCES) {
            await ingestSource(source);
        }
    })();

    // Schedule every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        for (const source of SOURCES) {
            await ingestSource(source);
        }
    });
}

module.exports = { startIngestion, ingestSource, parseTLE };
