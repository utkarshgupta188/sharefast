const express = require('express');
const cors = require('cors');
const app = express();

// Required for Render health checks
app.use(require('express-status-monitor')());

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST']
}));

// In-memory store
const connections = new Map();

// Generate OTP endpoint
app.get('/api/otp', (req, res) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  connections.set(otp, { peers: [], createdAt: Date.now() });
  res.json({ otp });
});

// Verify OTP endpoint
app.post('/api/connect', (req, res) => {
  const { otp } = req.body;
  res.json({ valid: connections.has(otp) });
});

// Render requires this exact health check endpoint
app.get('/health', (req, res) => {
  res.sendStatus(200);
});

// Critical fix: Must bind to Render's provided PORT
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
