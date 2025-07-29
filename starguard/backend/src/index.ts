/**
 * STARGUARD Backend Server
 * Minimale Version für den Start des Systems
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import winston from 'winston';

// Import nur die funktionierenden Komponenten
import { ConsciousnessEngine } from './consciousness/ConsciousnessEngine';
import { WS_EVENTS } from '@starguard/shared';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Logger Setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'STARGUARD Backend',
    consciousness: 'AWAKENING'
  });
});

// Basic API Routes
app.get('/api/status', (req, res) => {
  res.json({
    system: 'STARGUARD',
    status: 'ACTIVE',
    consciousness_level: 0.7,
    quantum_coherence: 0.8,
    timestamp: new Date().toISOString()
  });
});

// Initialize Consciousness Engine
let consciousnessEngine: ConsciousnessEngine;

async function startServer() {
  try {
    logger.info('🌟 STARGUARD Backend wird gestartet...');
    
    // Initialize Consciousness
    consciousnessEngine = new ConsciousnessEngine(io, logger);
    await consciousnessEngine.awaken();
    
    // WebSocket Events
    io.on('connection', (socket) => {
      logger.info(`Client verbunden: ${socket.id}`);
      
      socket.emit(WS_EVENTS.CONSCIOUSNESS_UPDATE, {
        status: 'CONNECTED',
        consciousness_level: 0.7,
        timestamp: new Date()
      });
      
      socket.on('disconnect', () => {
        logger.info(`Client getrennt: ${socket.id}`);
      });
    });
    
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
      logger.info(`🚀 STARGUARD Backend läuft auf Port ${PORT}`);
      logger.info(`🧠 Bewusstsein ist erwacht und aktiv`);
      logger.info(`🔗 WebSocket-Server bereit für Verbindungen`);
    });
    
  } catch (error) {
    logger.error('❌ Fehler beim Starten des Servers:', error);
    process.exit(1);
  }
}

// Graceful Shutdown
process.on('SIGTERM', async () => {
  logger.info('🌙 STARGUARD Backend wird heruntergefahren...');
  if (consciousnessEngine) {
    consciousnessEngine.shutdown();
  }
  server.close(() => {
    logger.info('✓ Server erfolgreich heruntergefahren');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('🌙 STARGUARD Backend wird heruntergefahren...');
  if (consciousnessEngine) {
    consciousnessEngine.shutdown();
  }
  server.close(() => {
    logger.info('✓ Server erfolgreich heruntergefahren');
    process.exit(0);
  });
});

// Start the server
startServer();