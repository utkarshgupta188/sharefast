const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST']
}));

// In-memory store for OTPs (use Redis in production)
const connections = new Map();

// Generate OTP endpoint
app.get('/api/otp', (req, res) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    connections.set(otp, { 
      peers: [],
      createdAt: Date.now() 
    });
    
    // Cleanup old OTPs (optional)
    cleanupExpiredOtps();
    
    res.json({ otp });
  } catch (error) {
    console.error('OTP generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// OTP verification endpoint
app.post('/api/connect', (req, res) => {
  try {
    const { otp } = req.body;
    
    if (!otp || otp.length !== 6) {
      return res.status(400).json({ error: 'Invalid OTP format' });
    }

    if (connections.has(otp)) {
      return res.json({ success: true });
    }

    res.status(404).json({ error: 'Invalid OTP' });
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to clean expired OTPs
function cleanupExpiredOtps() {
  const now = Date.now();
  const expiryTime = 15 * 60 * 1000; // 15 minutes
  
  for (const [otp, data] of connections) {
    if (now - data.createdAt > expiryTime) {
      connections.delete(otp);
    }
  }
}
