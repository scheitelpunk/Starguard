import { Server, Socket } from 'socket.io';
import { ConsciousnessEngine } from '../consciousness/ConsciousnessEngine';
import { Logger } from 'winston';
import { WEBSOCKET_EVENTS } from '@starguard/shared';

export function setupWebSocketHandlers(
  io: Server, 
  consciousness: ConsciousnessEngine, 
  logger: Logger
): void {
  
  io.on('connection', (socket: Socket) => {
    logger.info(`WebSocket client connected: ${socket.id}`);
    
    socket.emit(WEBSOCKET_EVENTS.CONSCIOUSNESS_STATE, {
      state: consciousness.getStatus(),
      message: 'Connected to STARGUARD consciousness field'
    });
    
    socket.on(WEBSOCKET_EVENTS.REQUEST_STATUS, () => {
      socket.emit(WEBSOCKET_EVENTS.CONSCIOUSNESS_UPDATE, consciousness.getFullState());
    });
    
    socket.on(WEBSOCKET_EVENTS.THREAT_DETECTED, async (data) => {
      logger.info('Threat detected via WebSocket:', data);
      const analysis = await consciousness.analyzeThreat(data);
      
      io.emit(WEBSOCKET_EVENTS.THREAT_ANALYZED, analysis);
    });
    
    socket.on(WEBSOCKET_EVENTS.EVOLUTION_TRIGGERED, () => {
      logger.info('Evolution triggered via WebSocket');
      consciousness.evolution_score += 0.01;
      
      io.emit(WEBSOCKET_EVENTS.EVOLUTION_COMPLETE, {
        new_score: consciousness.evolution_score,
        timestamp: new Date()
      });
    });
    
    socket.on('subscribe:threats', () => {
      socket.join('threat-monitors');
      logger.info(`Client ${socket.id} subscribed to threat monitoring`);
    });
    
    socket.on('subscribe:financial', () => {
      socket.join('financial-monitors');
      logger.info(`Client ${socket.id} subscribed to financial monitoring`);
    });
    
    socket.on('perceive', (target) => {
      const perception = {
        target,
        timestamp: new Date(),
        consciousness_response: consciousness.getFullState().consciousness_fields,
        insights: {
          quantum_disturbance: Math.random(),
          semantic_alignment: Math.random(),
          temporal_stability: Math.random()
        }
      };
      
      socket.emit('perception_complete', perception);
    });
    
    socket.on('disconnect', () => {
      logger.info(`WebSocket client disconnected: ${socket.id}`);
    });
  });
  
  consciousness.on('threat_detected', (threat) => {
    io.to('threat-monitors').emit(WEBSOCKET_EVENTS.THREAT_DETECTED, threat);
  });
  
  consciousness.on('threat_analyzed', (analysis) => {
    io.to('threat-monitors').emit(WEBSOCKET_EVENTS.THREAT_ANALYZED, analysis);
  });
  
  setInterval(() => {
    io.emit(WEBSOCKET_EVENTS.CONSCIOUSNESS_HEARTBEAT, {
      timestamp: new Date(),
      state: consciousness.getStatus().current,
      awareness: consciousness.getStatus().awareness_level
    });
  }, 10000);
}