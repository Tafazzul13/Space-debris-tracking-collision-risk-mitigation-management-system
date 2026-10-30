const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('ws');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/objects', require('./routes/objects'));
app.use('/api/risk', require('./routes/risk'));
app.use('/api/mitigation', require('./routes/mitigation'));
app.use('/api/ingest', require('./routes/ingest'));

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Node API running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  wss.close();
  server.close();
});

module.exports = { app, server, broadcastAlert };
