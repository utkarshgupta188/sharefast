const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for WebRTC connections
app.use(cors({
  origin: '*' // In production, specify your frontend URL
}));

// Signaling server for WebRTC (simplified)
const connections = new Map();

app.get('/api/otp', (req, res) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  connections.set(otp, { peers: [] });
  res.json({ otp });
});

// WebSocket would be better for production (using ws library)
app.post('/api/connect', express.json(), (req, res) => {
  const { otp } = req.body;
  if (connections.has(otp)) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Invalid OTP' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
