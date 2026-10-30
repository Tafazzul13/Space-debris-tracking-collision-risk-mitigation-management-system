const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('ws');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api', require('./src/routes/objects'));
app.use('/api/risk', require('./src/routes/risk'));
app.use('/api/mitigation', require('./src/routes/mitigation'));
app.use('/api/ingest', require('./src/routes/ingest'));
app.use('/api/alerts', require('./src/routes/alerts'));
app.use('/api', require('./src/routes/health'));

// WebSocket for real-time alerts
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', () => {});
  ws.on('close', () => console.log('Client disconnected'));
});

function broadcastAlert(alert) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: 'ALERT', data: alert }));
    }
  });
}

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Seed sample space objects with TLE data on startup (if database is empty)
async function seedDatabase() {
  try {
    const { getPool } = require('./src/config/database');
    const pool = await getPool();
    const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM space_objects');
    if (rows[0].cnt > 0) {
      console.log('Database already seeded, skipping');
      return;
    }

    const sampleObjects = [
      { norad_id: 25544, name: 'ISS (ZARYA)', object_type: 'SATELLITE', owner_country: 'USA', rcs_m2: 700.0, lat: 51.6, lon: -0.1, alt: 420 },
      { norad_id: 43757, name: 'STARLINK-3005', object_type: 'SATELLITE', owner_country: 'USA', rcs_m2: 0.5, lat: 53.0, lon: 45.0, alt: 550 },
      { norad_id: 48274, name: 'STARLINK-4827', object_type: 'SATELLITE', owner_country: 'USA', rcs_m2: 0.5, lat: -23.5, lon: -46.6, alt: 540 },
      { norad_id: 54221, name: 'ONEWEB-12', object_type: 'SATELLITE', owner_country: 'UK', rcs_m2: 0.3, lat: 87.0, lon: 120.0, alt: 1200 },
      { norad_id: 29182, name: 'FENGYUN-1C DEB', object_type: 'DEBRIS', owner_country: 'CHN', rcs_m2: 0.1, lat: 86.0, lon: -75.0, alt: 850 },
      { norad_id: 39528, name: 'COSMOS-2251 DEB', object_type: 'DEBRIS', owner_country: 'RUS', rcs_m2: 0.2, lat: 78.0, lon: 30.0, alt: 780 },
      { norad_id: 43999, name: 'DEBRIS-8821', object_type: 'DEBRIS', owner_country: 'INTL', rcs_m2: 0.05, lat: 45.0, lon: 90.0, alt: 700 },
      { norad_id: 25930, name: 'ROCKET BODY R/B', object_type: 'ROCKET_BODY', owner_country: 'RUS', rcs_m2: 2.0, lat: 65.0, lon: -150.0, alt: 1400 },
      { norad_id: 37830, name: 'DEBRIS-CLOUD-A', object_type: 'DEBRIS', owner_country: 'USA', rcs_m2: 0.08, lat: 28.0, lon: -80.0, alt: 580 },
      { norad_id: 41672, name: 'DEBRIS-4167', object_type: 'DEBRIS', owner_country: 'CHN', rcs_m2: 0.12, lat: 56.0, lon: 110.0, alt: 800 },
    ];

    for (const obj of sampleObjects) {
      const [objResult] = await pool.query(
        'INSERT IGNORE INTO space_objects (norad_id, name, object_type, owner_country, rcs_m2, is_active) VALUES (?, ?, ?, ?, ?, 1)',
        [obj.norad_id, obj.name, obj.object_type, obj.owner_country, obj.rcs_m2]
      );
      let objectId;
      if (objResult.insertId) {
        objectId = objResult.insertId;
      } else {
        const [existing] = await pool.query('SELECT id FROM space_objects WHERE norad_id = ?', [obj.norad_id]);
        objectId = existing[0].id;
      }

      // Generate a TLE record
      const line1 = `1 ${String(obj.norad_id).padStart(5, '0')}U 98067A   26300.1234567  .00002034  00000+0  35024-3 0  9991`;
      const line2 = `2 ${String(obj.norad_id).padStart(5, '0')} ${obj.lat.toFixed(4)} ${obj.lon.toFixed(4)} 0001234 120.4567 239.8765 15.12345678123456`;
      await pool.query(
        'INSERT IGNORE INTO tle_records (object_id, line1, line2, epoch, source) VALUES (?, ?, ?, NOW(), ?)',
        [objectId, line1, line2, 'seed']
      );

      // Generate ephemeris for the next 24 hours
      const now = new Date();
      for (let h = 0; h < 24; h += 1) {
        const ts = new Date(now.getTime() + h * 3600000).toISOString().replace('T', ' ').substring(0, 19);
        const x = 6378 + obj.alt + Math.sin(h * 0.5) * 100;
        const y = Math.cos(h * 0.3) * 500;
        const z = Math.sin(h * 0.2) * 300;
        await pool.query(
          'INSERT IGNORE INTO ephemeris (object_id, timestamp, x_km, y_km, z_km, vx_kms, vy_kms, vz_kms, lat_deg, lon_deg, alt_km) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [objectId, ts, x, y, z, 7.5, 0.1, 0.05, obj.lat, obj.lon, obj.alt]
        );
      }

      // Generate conjunctions with risk levels for debris objects
      if (obj.object_type === 'DEBRIS' || obj.norad_id === 25544) {
        const targetObj = sampleObjects.find(o => o.norad_id !== obj.norad_id && (o.object_type === 'SATELLITE' || o.object_type === 'ROCKET_BODY'));
        if (targetObj) {
          const [targetResult] = await pool.query(
            'INSERT IGNORE INTO space_objects (norad_id, name, object_type, owner_country, rcs_m2, is_active) VALUES (?, ?, ?, ?, ?, 1)',
            [targetObj.norad_id, targetObj.name, targetObj.object_type, targetObj.owner_country, targetObj.rcs_m2]
          );
          let targetId;
          if (targetResult.insertId) {
            targetId = targetResult.insertId;
          } else {
            const [existing] = await pool.query('SELECT id FROM space_objects WHERE norad_id = ?', [targetObj.norad_id]);
            targetId = existing[0].id;
          }

          const riskLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
          const pocValues = [1e-10, 1e-7, 1e-5, 1e-4];
          const distances = [50.0, 15.0, 5.0, 2.0];

          for (let i = 0; i < 4; i++) {
            const tca = new Date(now.getTime() + (i + 1) * 2 * 3600000).toISOString().replace('T', ' ').substring(0, 19);
            await pool.query(
              'INSERT IGNORE INTO conjunctions (primary_object_id, secondary_object_id, tca, min_distance_km, poc, risk_level, is_acknowledged, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, NOW())',
              [objectId, targetId, tca, distances[i], pocValues[i], riskLevels[i]]
            );

            // Create alert for HIGH and CRITICAL
            if (riskLevels[i] === 'HIGH' || riskLevels[i] === 'CRITICAL') {
              await pool.query(
                'INSERT INTO alerts (conjunction_id, severity, message, channel, sent_at, is_read) VALUES (LAST_INSERT_ID(), ?, ?, \'IN_APP\', NOW(), 0)',
                [riskLevels[i] === 'CRITICAL' ? 'CRITICAL' : 'WARNING', `Collision risk: ${obj.name} vs ${targetObj.name} - PoC: ${pocValues[i].toExponential(2)}`]
              );
            }
          }
        }
      }
    }

    console.log('Database seeded with sample debris and conjunction data');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

server.listen(PORT, async () => {
  console.log(`Node API running on port ${PORT}`);
  await seedDatabase();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  wss.close();
  server.close();
});

module.exports = { app, server, broadcastAlert };
