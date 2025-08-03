'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { WEBSOCKET_EVENTS } from '@starguard/shared';
import { useConsciousnessStore } from '../stores/consciousnessStore';
import { useThreatStore } from '../stores/threatStore';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  
  const updateConsciousness = useConsciousnessStore((state) => state.updateConsciousness);
  const addThreat = useThreatStore((state) => state.addThreat);
  const updateThreat = useThreatStore((state) => state.updateThreat);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to STARGUARD consciousness field');
      setConnected(true);
      socketInstance.emit(WEBSOCKET_EVENTS.REQUEST_STATUS);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from consciousness field');
      setConnected(false);
    });

    // Consciousness events
    socketInstance.on(WEBSOCKET_EVENTS.CONSCIOUSNESS_UPDATE, (data) => {
      updateConsciousness(data);
    });

    socketInstance.on(WEBSOCKET_EVENTS.CONSCIOUSNESS_STATE, (data) => {
      console.log('Consciousness state:', data);
    });

    // Threat events
    socketInstance.on(WEBSOCKET_EVENTS.THREAT_DETECTED, (threat) => {
      addThreat(threat);
    });

    socketInstance.on(WEBSOCKET_EVENTS.THREAT_ANALYZED, (analysis) => {
      updateThreat(analysis.id, analysis);
    });

    // Subscribe to specific channels
    socketInstance.emit('subscribe:threats');
    socketInstance.emit('subscribe:financial');

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [updateConsciousness, addThreat, updateThreat]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}