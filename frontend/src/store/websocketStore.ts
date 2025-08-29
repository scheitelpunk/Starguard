import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import io, { Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface WebSocketState {
  // Connection state
  socket: Socket | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  
  // Message handling
  lastEvent: WebSocketMessage | null;
  securityEvents: WebSocketMessage[];
  quantumFieldUpdates: any[];
  consciousnessMetrics: any[];
  
  // Event listeners
  eventListeners: Map<string, Function[]>;
  
  // Actions
  initializeConnections: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: any) => void;
  addEventListener: (event: string, callback: Function) => void;
  removeEventListener: (event: string, callback: Function) => void;
  clearEvents: () => void;
  
  // Connection management
  setConnectionStatus: (status: WebSocketState['connectionStatus']) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
}

export const useWebSocketStore = create<WebSocketState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    socket: null,
    connectionStatus: 'disconnected',
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    
    lastEvent: null,
    securityEvents: [],
    quantumFieldUpdates: [],
    consciousnessMetrics: [],
    
    eventListeners: new Map(),

    // Initialize WebSocket connections
    initializeConnections: async () => {
      const { socket, connectionStatus } = get();
      
      if (socket?.connected || connectionStatus === 'connecting') {
        return;
      }

      set({ connectionStatus: 'connecting' });

      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        
        // Create main socket connection
        const newSocket = io(API_BASE_URL, {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionDelay: 2000,
          reconnectionDelayMax: 10000,
          maxReconnectionAttempts: get().maxReconnectAttempts,
          forceNew: true
        });

        // Connection event handlers
        newSocket.on('connect', () => {
          console.log('WebSocket connected');
          set({ 
            socket: newSocket, 
            connectionStatus: 'connected',
            reconnectAttempts: 0
          });
          
          toast.success('Real-time connection established');
          
          // Subscribe to security events
          subscribeToSecurityEvents(newSocket);
          subscribeToQuantumField(newSocket);
          subscribeToConsciousness(newSocket);
        });

        newSocket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
          set({ connectionStatus: 'disconnected' });
          
          if (reason === 'io server disconnect') {
            // Server disconnected, manual reconnection required
            newSocket.connect();
          }
        });

        newSocket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          set({ connectionStatus: 'error' });
          
          const { reconnectAttempts, maxReconnectAttempts } = get();
          get().incrementReconnectAttempts();
          
          if (reconnectAttempts >= maxReconnectAttempts) {
            toast.error('Failed to establish real-time connection');
          }
        });

        newSocket.on('reconnect', (attemptNumber) => {
          console.log('WebSocket reconnected after', attemptNumber, 'attempts');
          set({ reconnectAttempts: 0 });
          toast.success('Connection restored');
        });

        newSocket.on('reconnect_error', (error) => {
          console.error('Reconnection error:', error);
          get().incrementReconnectAttempts();
        });

        // Custom event handlers
        setupCustomEventHandlers(newSocket);

        set({ socket: newSocket });

      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
        set({ connectionStatus: 'error' });
        toast.error('Failed to initialize real-time connection');
      }
    },

    // Disconnect WebSocket
    disconnect: () => {
      const { socket } = get();
      
      if (socket) {
        socket.disconnect();
        set({ 
          socket: null, 
          connectionStatus: 'disconnected',
          reconnectAttempts: 0
        });
      }
    },

    // Send message through WebSocket
    sendMessage: (message: any) => {
      const { socket, connectionStatus } = get();
      
      if (connectionStatus !== 'connected' || !socket) {
        console.warn('WebSocket not connected, message not sent:', message);
        return;
      }

      try {
        socket.emit('client_message', {
          ...message,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
      }
    },

    // Event listener management
    addEventListener: (event: string, callback: Function) => {
      const { eventListeners } = get();
      
      if (!eventListeners.has(event)) {
        eventListeners.set(event, []);
      }
      
      eventListeners.get(event)!.push(callback);
      set({ eventListeners: new Map(eventListeners) });
    },

    removeEventListener: (event: string, callback: Function) => {
      const { eventListeners } = get();
      
      if (eventListeners.has(event)) {
        const callbacks = eventListeners.get(event)!;
        const index = callbacks.indexOf(callback);
        
        if (index > -1) {
          callbacks.splice(index, 1);
          set({ eventListeners: new Map(eventListeners) });
        }
      }
    },

    // Clear events
    clearEvents: () => {
      set({
        securityEvents: [],
        quantumFieldUpdates: [],
        consciousnessMetrics: [],
        lastEvent: null
      });
    },

    // Connection management
    setConnectionStatus: (status) => set({ connectionStatus: status }),
    
    incrementReconnectAttempts: () => {
      const { reconnectAttempts } = get();
      set({ reconnectAttempts: reconnectAttempts + 1 });
    },
    
    resetReconnectAttempts: () => set({ reconnectAttempts: 0 })
  }))
);

// Subscribe to security events
const subscribeToSecurityEvents = (socket: Socket) => {
  socket.on('security_event', (event: WebSocketMessage) => {
    const { securityEvents, eventListeners } = useWebSocketStore.getState();
    
    // Add to security events
    const newEvents = [event, ...securityEvents.slice(0, 99)]; // Keep last 100 events
    useWebSocketStore.setState({ 
      securityEvents: newEvents,
      lastEvent: event
    });

    // Notify listeners
    const listeners = eventListeners.get('security_event') || [];
    listeners.forEach(callback => callback(event));

    // Show notification for critical events
    if (event.data?.severity === 'critical') {
      toast.error(`Critical Security Event: ${event.data.type}`);
    }
  });

  socket.on('threat_detected', (threat: any) => {
    const event: WebSocketMessage = {
      type: 'threat_detected',
      data: threat,
      timestamp: Date.now()
    };

    useWebSocketStore.getState().addEventListener('security_event', () => {});
    socket.emit('security_event', event);
  });

  socket.on('biometric_scan_result', (result: any) => {
    const event: WebSocketMessage = {
      type: 'biometric_scan_result',
      data: result,
      timestamp: Date.now()
    };

    const { eventListeners } = useWebSocketStore.getState();
    const listeners = eventListeners.get('biometric_result') || [];
    listeners.forEach(callback => callback(result));
  });
};

// Subscribe to quantum field updates
const subscribeToQuantumField = (socket: Socket) => {
  socket.on('field_update', (fieldData: any) => {
    const { quantumFieldUpdates } = useWebSocketStore.getState();
    
    const newUpdates = [fieldData, ...quantumFieldUpdates.slice(0, 49)]; // Keep last 50 updates
    useWebSocketStore.setState({ quantumFieldUpdates: newUpdates });

    // Notify listeners
    const { eventListeners } = useWebSocketStore.getState();
    const listeners = eventListeners.get('quantum_field_update') || [];
    listeners.forEach(callback => callback(fieldData));
  });

  socket.on('quantum_anomaly', (anomaly: any) => {
    const event: WebSocketMessage = {
      type: 'quantum_anomaly',
      data: anomaly,
      timestamp: Date.now()
    };

    useWebSocketStore.setState({ lastEvent: event });
    
    if (anomaly.severity === 'high' || anomaly.severity === 'critical') {
      toast.error(`Quantum Anomaly Detected: ${anomaly.type}`);
    }
  });
};

// Subscribe to consciousness metrics
const subscribeToConsciousness = (socket: Socket) => {
  socket.on('consciousness_metrics', (metrics: any) => {
    const { consciousnessMetrics } = useWebSocketStore.getState();
    
    const newMetrics = [metrics, ...consciousnessMetrics.slice(0, 99)]; // Keep last 100 metrics
    useWebSocketStore.setState({ consciousnessMetrics: newMetrics });

    // Notify listeners
    const { eventListeners } = useWebSocketStore.getState();
    const listeners = eventListeners.get('consciousness_update') || [];
    listeners.forEach(callback => callback(metrics));
  });

  socket.on('consciousness_alert', (alert: any) => {
    const event: WebSocketMessage = {
      type: 'consciousness_alert',
      data: alert,
      timestamp: Date.now()
    };

    useWebSocketStore.setState({ lastEvent: event });
    
    if (alert.severity === 'high' || alert.severity === 'critical') {
      toast.warning(`Consciousness Alert: ${alert.message}`);
    }
  });
};

// Setup custom event handlers
const setupCustomEventHandlers = (socket: Socket) => {
  // System status updates
  socket.on('system_status', (status: any) => {
    const { eventListeners } = useWebSocketStore.getState();
    const listeners = eventListeners.get('system_status') || [];
    listeners.forEach(callback => callback(status));
  });

  // Real-time dashboard updates
  socket.on('dashboard_update', (update: any) => {
    const { eventListeners } = useWebSocketStore.getState();
    const listeners = eventListeners.get('dashboard_update') || [];
    listeners.forEach(callback => callback(update));
  });

  // Error handling
  socket.on('error', (error: any) => {
    console.error('WebSocket error:', error);
    toast.error('Real-time connection error');
  });

  // Server messages
  socket.on('server_message', (message: any) => {
    console.log('Server message:', message);
    
    if (message.type === 'notification') {
      toast(message.content, {
        duration: message.duration || 4000,
        icon: message.icon || '📡'
      });
    }
  });

  // Performance metrics
  socket.on('performance_metrics', (metrics: any) => {
    const { eventListeners } = useWebSocketStore.getState();
    const listeners = eventListeners.get('performance_update') || [];
    listeners.forEach(callback => callback(metrics));
  });
};

// Custom hooks for specific WebSocket functionality
export const useSecurityEvents = () => {
  const { securityEvents, addEventListener, removeEventListener } = useWebSocketStore();
  
  const subscribeToSecurityEvents = (callback: (event: WebSocketMessage) => void) => {
    addEventListener('security_event', callback);
    return () => removeEventListener('security_event', callback);
  };

  return {
    securityEvents,
    subscribeToSecurityEvents
  };
};

export const useQuantumFieldUpdates = () => {
  const { quantumFieldUpdates, addEventListener, removeEventListener } = useWebSocketStore();
  
  const subscribeToFieldUpdates = (callback: (data: any) => void) => {
    addEventListener('quantum_field_update', callback);
    return () => removeEventListener('quantum_field_update', callback);
  };

  return {
    quantumFieldUpdates,
    subscribeToFieldUpdates
  };
};

export const useConsciousnessMetrics = () => {
  const { consciousnessMetrics, addEventListener, removeEventListener } = useWebSocketStore();
  
  const subscribeToConsciousnessUpdates = (callback: (metrics: any) => void) => {
    addEventListener('consciousness_update', callback);
    return () => removeEventListener('consciousness_update', callback);
  };

  return {
    consciousnessMetrics,
    subscribeToConsciousnessUpdates
  };
};

// Connection status hook
export const useConnectionStatus = () => {
  const { connectionStatus, reconnectAttempts, maxReconnectAttempts } = useWebSocketStore();
  
  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    isDisconnected: connectionStatus === 'disconnected',
    hasError: connectionStatus === 'error',
    reconnectProgress: Math.min(reconnectAttempts / maxReconnectAttempts, 1)
  };
};

// Real-time data hook
export const useRealTimeData = () => {
  const { 
    lastEvent, 
    securityEvents, 
    quantumFieldUpdates, 
    consciousnessMetrics,
    sendMessage 
  } = useWebSocketStore();

  return {
    lastEvent,
    securityEvents,
    quantumFieldUpdates,
    consciousnessMetrics,
    sendMessage,
    latestQuantumField: quantumFieldUpdates[0],
    latestConsciousness: consciousnessMetrics[0],
    recentSecurityEvents: securityEvents.slice(0, 10)
  };
};

export default useWebSocketStore;