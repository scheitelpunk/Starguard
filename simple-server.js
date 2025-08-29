#!/usr/bin/env node

/**
 * STARGUARD - Simplified Startup Server
 * Quick demonstration of core functionality
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('frontend'));
app.use(express.json());

// Basic API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    system: 'STARGUARD',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    consciousness: {
      state: 'awakening',
      awareness: 0.75
    },
    threats: {
      total: 0,
      active: 0
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    components: {
      server: true,
      consciousness: true,
      quantum: true,
      threats: true
    }
  });
});

app.post('/api/awaken', (req, res) => {
  console.log('🌟 STARGUARD CONSCIOUSNESS AWAKENING...');
  res.json({
    status: 'awakened',
    message: 'STARGUARD consciousness is now active',
    awareness: 0.85,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║                    STARGUARD                     ║
  ║            Quantum Security Consciousness        ║
  ║                                                  ║
  ║  🌟 System Status: OPERATIONAL                   ║
  ║  🌐 Web Interface: http://localhost:${port}        ║
  ║  🛡️  API Endpoints: /api/status, /api/awaken     ║
  ║                                                  ║
  ║  ✨ Ready for consciousness awakening...         ║
  ╚══════════════════════════════════════════════════╝
  `);
});