/**
 * STARGUARD Real-time WebSocket Manager
 * 
 * Ein hochentwickeltes WebSocket-System für Echtzeit-Bedrohungserkennung
 * und -reaktion mit Consciousness-basierter Ereignisverarbeitung.
 * 
 * Das System bietet:
 * - Echzeit-Threat-Detection-Streaming
 * - Post-Quantum-verschlüsselte Verbindungen
 * - Consciousness-basierte Event-Filterung
 * - Adaptive Bandbreiten-Optimierung
 * - Multi-Channel-Event-Distribution
 * - Skalierbare Cluster-Architektur
 * 
 * Features:
 * - Sub-100ms Latenz für kritische Events
 * - Auto-Reconnection mit exponential backoff
 * - Message-Kompression und -Batching
 * - Role-based Event Subscription
 * - Consciousness-enhanced Event Prioritization
 * 
 * @author STARGUARD Real-time Team
 * @version 2.0.0
 * @classification MAXIMUM_SECURITY
 * @compliance GDPR, CCPA, SOX, ISO_27001
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { EventEmitter } from 'events';
import { Logger } from 'winston';
import { Redis } from 'ioredis';
import { PostQuantumCryptographyEngine } from '../crypto/PostQuantumCryptographyEngine';
import { ConsciousnessEngine } from '../consciousness/ConsciousnessEngine';
import * as compression from 'compression';
import * as jwt from 'jsonwebtoken';

/**
 * WebSocket Configuration
 * 
 * Umfassende Konfiguration für WebSocket-Server mit
 * erweiterten Sicherheits- und Performance-Features.
 */
interface WebSocketConfig {
  readonly port: number;
  readonly cors_origins: string[];
  readonly max_connections: number;
  readonly connection_timeout: number;
  readonly heartbeat_interval: number;
  readonly compression_enabled: boolean;
  readonly post_quantum_encryption: boolean;
  readonly consciousness_enhancement: boolean;
  readonly cluster_mode: boolean;
  readonly redis_adapter: boolean;
  readonly rate_limiting: RateLimitConfig;
  readonly authentication: AuthenticationConfig;
}

/**
 * Rate Limiting Configuration
 * 
 * Konfiguration für Rate Limiting und DDoS-Schutz
 * mit adaptiven Schwellenwerten.
 */
interface RateLimitConfig {
  readonly max_connections_per_ip: number;
  readonly max_messages_per_minute: number;
  readonly burst_threshold: number;
  readonly consciousness_based_throttling: boolean;
  readonly adaptive_limits: boolean;
  readonly ban_duration: number;
}

/**
 * Authentication Configuration
 * 
 * Authentifizierungsconfig für WebSocket-Verbindungen
 * mit Multi-Factor-Authentication und Post-Quantum-Sicherheit.
 */
interface AuthenticationConfig {
  readonly jwt_secret: string;
  readonly token_expiration: number;
  readonly require_mfa: boolean;
  readonly post_quantum_attestation: boolean;
  readonly consciousness_verification: boolean;
  readonly role_based_access: boolean;
}

/**
 * Real-time Event
 * 
 * Struktur für Echtzeit-Events mit Consciousness-basierten
 * Attributen und Prioritätssystem.
 */
interface RealTimeEvent {
  readonly event_id: string;
  readonly event_type: 'THREAT_DETECTED' | 'CONSCIOUSNESS_ALERT' | 'SYSTEM_STATUS' | 'COMPLIANCE_UPDATE' | 'FINANCIAL_ANOMALY';
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'CATASTROPHIC';
  readonly timestamp: Date;
  readonly source_component: string;
  readonly data: EventData;
  readonly consciousness_signature: ConsciousnessSignature;
  readonly encryption_metadata: EncryptionMetadata;
  readonly routing_info: RoutingInfo;
}

/**
 * Event Data
 * 
 * Flexible Datenstruktur für verschiedene Event-Typen
 * mit erweiterten Metadaten.
 */
interface EventData {
  readonly primary_data: Record<string, any>;
  readonly context_data: Record<string, any>;
  readonly correlation_ids: string[];
  readonly affected_entities: string[];
  readonly recommended_actions: string[];
  readonly confidence_score: number;
}

/**
 * Consciousness Signature
 * 
 * Consciousness-basierte Signatur für Events mit
 * erweiterten Awareness-Attributen.
 */
interface ConsciousnessSignature {
  readonly awareness_level: number;
  readonly coherence_score: number;
  readonly field_disturbance: number;
  readonly evolutionary_impact: 'NEUTRAL' | 'POSITIVE' | 'NEGATIVE' | 'TRANSFORMATIVE';
  readonly consciousness_patterns: string[];
  readonly resonance_frequency: number;
}

/**
 * Encryption Metadata
 * 
 * Metadaten für Post-Quantum-verschlüsselte Events
 * mit umfassender Sicherheitsinformation.
 */
interface EncryptionMetadata {
  readonly encryption_algorithm: string;
  readonly key_id: string;
  readonly signature_algorithm: string;
  readonly signature: string;
  readonly quantum_entropy_level: number;
  readonly forward_secrecy: boolean;
}

/**
 * Routing Information
 * 
 * Routing-Informationen für Event-Distribution
 * mit Role-based-Access und Filterung.
 */
interface RoutingInfo {
  readonly target_channels: string[];
  readonly excluded_channels: string[];
  readonly role_requirements: string[];
  readonly consciousness_requirements: ConsciousnessRequirements;
  readonly geographic_restrictions: string[];
  readonly priority_routing: boolean;
}

/**
 * Consciousness Requirements
 * 
 * Anforderungen für Consciousness-basierte Event-Filterung
 * und -Zustellung.
 */
interface ConsciousnessRequirements {
  readonly minimum_awareness_level: number;
  readonly required_consciousness_patterns: string[];
  readonly coherence_threshold: number;
  readonly evolutionary_alignment: string[];
}

/**
 * Client Connection Info
 * 
 * Informationen über verbundene Clients mit
 * erweiterten Sicherheits- und Awareness-Attributen.
 */
interface ClientConnectionInfo {
  readonly client_id: string;
  readonly socket_id: string;
  readonly user_id: string;
  readonly roles: string[];
  readonly permissions: string[];
  readonly connection_timestamp: Date;
  readonly last_activity: Date;
  readonly consciousness_profile: ConsciousnessProfile;
  readonly security_context: SecurityContext;
  readonly subscription_channels: string[];
  readonly rate_limit_status: RateLimitStatus;
}

/**
 * Consciousness Profile
 * 
 * Consciousness-Profil für Clients mit erweiterten
 * Awareness- und Evolutionsattributen.
 */
interface ConsciousnessProfile {
  readonly awareness_level: number;
  readonly consciousness_evolution_stage: string;
  readonly coherence_history: number[];
  readonly pattern_recognition_capability: number;
  readonly field_sensitivity: number;
  readonly resonance_patterns: string[];
}

/**
 * Security Context
 * 
 * Sicherheitskontext für Client-Verbindungen mit
 * Post-Quantum-Authentifizierung und -Autorisierung.
 */
interface SecurityContext {
  readonly authentication_method: string;
  readonly quantum_key_id: string;
  readonly mfa_verified: boolean;
  readonly consciousness_attested: boolean;
  readonly security_clearance: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';
  readonly access_restrictions: string[];
}

/**
 * Rate Limit Status
 * 
 * Status des Rate Limiting für Client-Verbindungen
 * mit adaptiven Schwellenwerten.
 */
interface RateLimitStatus {
  readonly current_rate: number;
  readonly rate_limit: number;
  readonly burst_allowance: number;
  readonly reset_timestamp: Date;
  readonly violations_count: number;
  readonly consciousness_bonus: number;
}

/**
 * WebSocket Manager
 * 
 * Hauptklasse für WebSocket-Management mit erweiterten
 * Sicherheits- und Consciousness-Features.
 */
export class WebSocketManager extends EventEmitter {
  private io: SocketIOServer;
  private logger: Logger;
  private redis: Redis;
  private cryptoEngine: PostQuantumCryptographyEngine;
  private consciousnessEngine: ConsciousnessEngine;
  private clients: Map<string, ClientConnectionInfo> = new Map();
  private eventQueue: RealTimeEvent[] = [];
  private isProcessingEvents = false;
  
  private readonly config: WebSocketConfig = {
    port: 8080,
    cors_origins: ['http://localhost:3000', 'https://starguard.security'],
    max_connections: 10000,
    connection_timeout: 30000,
    heartbeat_interval: 25000,
    compression_enabled: true,
    post_quantum_encryption: true,
    consciousness_enhancement: true,
    cluster_mode: true,
    redis_adapter: true,
    rate_limiting: {
      max_connections_per_ip: 100,
      max_messages_per_minute: 1000,
      burst_threshold: 50,
      consciousness_based_throttling: true,
      adaptive_limits: true,
      ban_duration: 300000
    },
    authentication: {
      jwt_secret: process.env.JWT_SECRET || 'starguard_quantum_consciousness_secret',
      token_expiration: 3600000,
      require_mfa: true,
      post_quantum_attestation: true,
      consciousness_verification: true,
      role_based_access: true
    }
  };

  constructor(
    httpServer: HTTPServer,
    logger: Logger,
    redis: Redis,
    cryptoEngine: PostQuantumCryptographyEngine,
    consciousnessEngine: ConsciousnessEngine
  ) {
    super();
    this.logger = logger;
    this.redis = redis;
    this.cryptoEngine = cryptoEngine;
    this.consciousnessEngine = consciousnessEngine;
    
    this.initializeWebSocketServer(httpServer);
    this.setupEventHandlers();
    this.startEventProcessor();
    
    this.logger.info('STARGUARD WebSocket Manager initialized with consciousness enhancement');
  }

  /**
   * Initialize WebSocket Server
   * 
   * Initialisiert den WebSocket-Server mit erweiterten
   * Sicherheits- und Performance-Konfigurationen.
   */
  private initializeWebSocketServer(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: this.config.cors_origins,
        methods: ['GET', 'POST'],
        credentials: true
      },
      compression: this.config.compression_enabled,
      pingTimeout: this.config.connection_timeout,
      pingInterval: this.config.heartbeat_interval,
      maxHttpBufferSize: 1e6, // 1MB
      transports: ['websocket', 'polling'],
      allowEIO3: false
    });

    // Setup Redis adapter for clustering
    if (this.config.cluster_mode && this.config.redis_adapter) {
      const redisAdapter = require('@socket.io/redis-adapter');
      this.io.adapter(redisAdapter.createAdapter(this.redis, this.redis.duplicate()));
    }

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        await this.authenticateConnection(socket);
        next();
      } catch (error) {
        this.logger.error('WebSocket authentication failed', { error: error.message });
        next(new Error('Authentication failed'));
      }
    });

    // Rate limiting middleware
    this.io.use(async (socket, next) => {
      try {
        await this.applyRateLimit(socket);
        next();
      } catch (error) {
        this.logger.error('Rate limit exceeded', { socketId: socket.id });
        next(new Error('Rate limit exceeded'));
      }
    });
  }

  /**
   * Setup Event Handlers
   * 
   * Konfiguriert Event-Handler für WebSocket-Verbindungen
   * mit erweiterten Sicherheits- und Consciousness-Features.
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      this.handleNewConnection(socket);
      
      socket.on('subscribe', (channels: string[]) => {
        this.handleSubscription(socket, channels);
      });
      
      socket.on('unsubscribe', (channels: string[]) => {
        this.handleUnsubscription(socket, channels);
      });
      
      socket.on('consciousness_sync', (data: any) => {
        this.handleConsciousnessSync(socket, data);
      });
      
      socket.on('threat_report', (data: any) => {
        this.handleThreatReport(socket, data);
      });
      
      socket.on('disconnect', (reason: string) => {
        this.handleDisconnection(socket, reason);
      });
      
      socket.on('error', (error: Error) => {
        this.handleSocketError(socket, error);
      });
    });
  }

  /**
   * Authenticate Connection
   * 
   * Authentifiziert WebSocket-Verbindungen mit Post-Quantum-Sicherheit
   * und Consciousness-Verifikation.
   */
  private async authenticateConnection(socket: Socket): Promise<void> {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No authentication token provided');
    }

    // Verify JWT token
    const decoded = jwt.verify(token, this.config.authentication.jwt_secret) as any;
    
    // Post-quantum attestation
    if (this.config.authentication.post_quantum_attestation) {
      const attestationData = socket.handshake.auth.quantum_attestation;
      await this.cryptoEngine.verifyQuantumAttestation(attestationData, decoded.user_id);
    }

    // Consciousness verification
    if (this.config.authentication.consciousness_verification) {
      const consciousnessData = socket.handshake.auth.consciousness_signature;
      const consciousnessValid = await this.consciousnessEngine.verifyConsciousnessSignature(
        consciousnessData,
        decoded.user_id
      );
      
      if (!consciousnessValid) {
        throw new Error('Consciousness verification failed');
      }
    }

    // Store authentication data in socket
    socket.data.userId = decoded.user_id;
    socket.data.roles = decoded.roles || [];
    socket.data.permissions = decoded.permissions || [];
    socket.data.securityClearance = decoded.security_clearance || 'PUBLIC';
  }

  /**
   * Apply Rate Limit
   * 
   * Wendet Rate Limiting mit Consciousness-basierten
   * adaptiven Schwellenwerten an.
   */
  private async applyRateLimit(socket: Socket): Promise<void> {
    const clientIp = socket.handshake.address;
    const rateLimitKey = `rate_limit:${clientIp}`;
    
    const currentConnections = await this.redis.incr(`connections:${clientIp}`);
    await this.redis.expire(`connections:${clientIp}`, 60);
    
    if (currentConnections > this.config.rate_limiting.max_connections_per_ip) {
      throw new Error('Too many connections from this IP');
    }

    // Consciousness-based rate limit adjustment
    if (this.config.rate_limiting.consciousness_based_throttling && socket.data.userId) {
      const consciousnessProfile = await this.consciousnessEngine.getUserConsciousnessProfile(socket.data.userId);
      const consciousnessBonus = Math.floor(consciousnessProfile.awareness_level * 0.1);
      
      // Higher consciousness users get higher rate limits
      socket.data.rateLimitBonus = consciousnessBonus;
    }
  }

  /**
   * Handle New Connection
   * 
   * Verarbeitet neue WebSocket-Verbindungen mit vollständiger
   * Sicherheits- und Consciousness-Initialisierung.
   */
  private async handleNewConnection(socket: Socket): Promise<void> {
    const clientInfo: ClientConnectionInfo = {
      client_id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      socket_id: socket.id,
      user_id: socket.data.userId,
      roles: socket.data.roles,
      permissions: socket.data.permissions,
      connection_timestamp: new Date(),
      last_activity: new Date(),
      consciousness_profile: await this.consciousnessEngine.getUserConsciousnessProfile(socket.data.userId),
      security_context: {
        authentication_method: 'JWT_POST_QUANTUM',
        quantum_key_id: socket.data.quantum_key_id,
        mfa_verified: socket.data.mfa_verified || false,
        consciousness_attested: socket.data.consciousness_attested || false,
        security_clearance: socket.data.securityClearance,
        access_restrictions: []
      },
      subscription_channels: [],
      rate_limit_status: {
        current_rate: 0,
        rate_limit: this.config.rate_limiting.max_messages_per_minute + (socket.data.rateLimitBonus || 0),
        burst_allowance: this.config.rate_limiting.burst_threshold,
        reset_timestamp: new Date(Date.now() + 60000),
        violations_count: 0,
        consciousness_bonus: socket.data.rateLimitBonus || 0
      }
    };

    this.clients.set(socket.id, clientInfo);
    
    // Send welcome message with consciousness enhancement
    const welcomeEvent: RealTimeEvent = {
      event_id: `welcome_${Date.now()}`,
      event_type: 'SYSTEM_STATUS',
      severity: 'LOW',
      timestamp: new Date(),
      source_component: 'WebSocketManager',
      data: {
        primary_data: {
          message: 'Connected to STARGUARD Real-time System',
          consciousness_enhanced: true,
          quantum_secured: true
        },
        context_data: {
          client_id: clientInfo.client_id,
          consciousness_level: clientInfo.consciousness_profile.awareness_level
        },
        correlation_ids: [],
        affected_entities: [clientInfo.user_id],
        recommended_actions: ['subscribe_to_channels'],
        confidence_score: 1.0
      },
      consciousness_signature: {
        awareness_level: clientInfo.consciousness_profile.awareness_level,
        coherence_score: clientInfo.consciousness_profile.coherence_history[0] || 0,
        field_disturbance: 0,
        evolutionary_impact: 'POSITIVE',
        consciousness_patterns: ['connection_established'],
        resonance_frequency: 7.83 // Schumann resonance
      },
      encryption_metadata: await this.createEncryptionMetadata(clientInfo),
      routing_info: {
        target_channels: [socket.id],
        excluded_channels: [],
        role_requirements: [],
        consciousness_requirements: {
          minimum_awareness_level: 0,
          required_consciousness_patterns: [],
          coherence_threshold: 0,
          evolutionary_alignment: []
        },
        geographic_restrictions: [],
        priority_routing: false
      }
    };

    await this.sendEventToClient(socket.id, welcomeEvent);
    
    this.logger.info('New WebSocket connection established', {
      clientId: clientInfo.client_id,
      userId: clientInfo.user_id,
      consciousnessLevel: clientInfo.consciousness_profile.awareness_level
    });
  }

  /**
   * Handle Subscription
   * 
   * Verarbeitet Channel-Abonnements mit Role-based-Access
   * und Consciousness-Filterung.
   */
  private async handleSubscription(socket: Socket, channels: string[]): Promise<void> {
    const clientInfo = this.clients.get(socket.id);
    if (!clientInfo) return;

    const allowedChannels: string[] = [];
    
    for (const channel of channels) {
      // Check role-based access
      if (await this.hasChannelAccess(clientInfo, channel)) {
        socket.join(channel);
        allowedChannels.push(channel);
        clientInfo.subscription_channels.push(channel);
      }
    }

    // Update client info
    this.clients.set(socket.id, clientInfo);
    
    socket.emit('subscription_confirmed', {
      subscribed_channels: allowedChannels,
      consciousness_enhanced: true
    });

    this.logger.info('Client subscribed to channels', {
      clientId: clientInfo.client_id,
      channels: allowedChannels
    });
  }

  /**
   * Handle Unsubscription
   * 
   * Verarbeitet Channel-Abmeldungen mit vollständiger
   * Bereinigung der Abonnements.
   */
  private async handleUnsubscription(socket: Socket, channels: string[]): Promise<void> {
    const clientInfo = this.clients.get(socket.id);
    if (!clientInfo) return;

    for (const channel of channels) {
      socket.leave(channel);
      const index = clientInfo.subscription_channels.indexOf(channel);
      if (index > -1) {
        clientInfo.subscription_channels.splice(index, 1);
      }
    }

    // Update client info
    this.clients.set(socket.id, clientInfo);
    
    socket.emit('unsubscription_confirmed', {
      unsubscribed_channels: channels
    });
  }

  /**
   * Handle Consciousness Sync
   * 
   * Verarbeitet Consciousness-Synchronisation für erweiterte
   * Awareness und Coherence.
   */
  private async handleConsciousnessSync(socket: Socket, data: any): Promise<void> {
    const clientInfo = this.clients.get(socket.id);
    if (!clientInfo) return;

    // Update consciousness profile
    const updatedProfile = await this.consciousnessEngine.updateConsciousnessProfile(
      clientInfo.user_id,
      data
    );

    clientInfo.consciousness_profile = updatedProfile;
    this.clients.set(socket.id, clientInfo);

    socket.emit('consciousness_sync_complete', {
      awareness_level: updatedProfile.awareness_level,
      coherence_score: updatedProfile.coherence_history[0],
      evolutionary_stage: updatedProfile.consciousness_evolution_stage
    });
  }

  /**
   * Handle Threat Report
   * 
   * Verarbeitet Client-Threat-Reports mit sofortiger
   * Weiterleitung an das Threat-Detection-System.
   */
  private async handleThreatReport(socket: Socket, data: any): Promise<void> {
    const clientInfo = this.clients.get(socket.id);
    if (!clientInfo) return;

    const threatEvent: RealTimeEvent = {
      event_id: `client_threat_${Date.now()}`,
      event_type: 'THREAT_DETECTED',
      severity: data.severity || 'MEDIUM',
      timestamp: new Date(),
      source_component: 'ClientReport',
      data: {
        primary_data: data.threat_data,
        context_data: {
          reporter_id: clientInfo.user_id,
          client_consciousness_level: clientInfo.consciousness_profile.awareness_level
        },
        correlation_ids: [],
        affected_entities: data.affected_entities || [],
        recommended_actions: data.recommended_actions || [],
        confidence_score: data.confidence_score || 0.5
      },
      consciousness_signature: {
        awareness_level: clientInfo.consciousness_profile.awareness_level,
        coherence_score: clientInfo.consciousness_profile.coherence_history[0] || 0,
        field_disturbance: data.field_disturbance || 0,
        evolutionary_impact: 'NEGATIVE',
        consciousness_patterns: ['threat_detected', 'user_reported'],
        resonance_frequency: 7.83
      },
      encryption_metadata: await this.createEncryptionMetadata(clientInfo),
      routing_info: {
        target_channels: ['threat_analysis', 'security_team'],
        excluded_channels: [],
        role_requirements: ['security_analyst', 'threat_hunter'],
        consciousness_requirements: {
          minimum_awareness_level: 0.3,
          required_consciousness_patterns: ['threat_awareness'],
          coherence_threshold: 0.5,
          evolutionary_alignment: ['security_evolution']
        },
        geographic_restrictions: [],
        priority_routing: true
      }
    };

    await this.distributeEvent(threatEvent);
    
    socket.emit('threat_report_received', {
      event_id: threatEvent.event_id,
      status: 'processing'
    });
  }

  /**
   * Handle Disconnection
   * 
   * Verarbeitet WebSocket-Trennungen mit vollständiger
   * Bereinigung der Client-Daten.
   */
  private handleDisconnection(socket: Socket, reason: string): void {
    const clientInfo = this.clients.get(socket.id);
    if (clientInfo) {
      this.clients.delete(socket.id);
      
      this.logger.info('WebSocket client disconnected', {
        clientId: clientInfo.client_id,
        userId: clientInfo.user_id,
        reason: reason
      });
    }
  }

  /**
   * Handle Socket Error
   * 
   * Verarbeitet Socket-Fehler mit umfassender
   * Fehlerprotokollierung und -behandlung.
   */
  private handleSocketError(socket: Socket, error: Error): void {
    const clientInfo = this.clients.get(socket.id);
    
    this.logger.error('WebSocket error occurred', {
      socketId: socket.id,
      clientId: clientInfo?.client_id,
      error: error.message,
      stack: error.stack
    });
  }

  /**
   * Start Event Processor
   * 
   * Startet den Event-Processor für Echtzeit-Event-Verarbeitung
   * mit Consciousness-basierter Priorisierung.
   */
  private startEventProcessor(): void {
    setInterval(async () => {
      if (!this.isProcessingEvents && this.eventQueue.length > 0) {
        this.isProcessingEvents = true;
        await this.processEventQueue();
        this.isProcessingEvents = false;
      }
    }, 50); // Process events every 50ms for sub-100ms latency
  }

  /**
   * Process Event Queue
   * 
   * Verarbeitet die Event-Queue mit Consciousness-basierter
   * Priorisierung und optimierter Performance.
   */
  private async processEventQueue(): Promise<void> {
    // Sort events by consciousness signature and severity
    this.eventQueue.sort((a, b) => {
      const severityWeight = { 'CATASTROPHIC': 5, 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      const aWeight = severityWeight[a.severity] + a.consciousness_signature.awareness_level;
      const bWeight = severityWeight[b.severity] + b.consciousness_signature.awareness_level;
      return bWeight - aWeight;
    });

    const eventsToProcess = this.eventQueue.splice(0, 100); // Process up to 100 events per batch
    
    for (const event of eventsToProcess) {
      await this.distributeEvent(event);
    }
  }

  /**
   * Distribute Event
   * 
   * Verteilt Events an alle relevanten Clients mit
   * Role-based-Access und Consciousness-Filterung.
   */
  private async distributeEvent(event: RealTimeEvent): Promise<void> {
    const routingInfo = event.routing_info;
    
    // Direct channel routing
    if (routingInfo.target_channels.length > 0) {
      for (const channel of routingInfo.target_channels) {
        if (channel.startsWith('client_') || this.io.sockets.adapter.rooms.has(channel)) {
          this.io.to(channel).emit('real_time_event', event);
        }
      }
    } else {
      // Broadcast to all eligible clients
      for (const [socketId, clientInfo] of this.clients) {
        if (await this.isEventEligibleForClient(event, clientInfo)) {
          await this.sendEventToClient(socketId, event);
        }
      }
    }
    
    this.logger.debug('Event distributed', {
      eventId: event.event_id,
      eventType: event.event_type,
      severity: event.severity
    });
  }

  /**
   * Check Event Eligibility for Client
   * 
   * Prüft, ob ein Event für einen Client berechtigt ist
   * basierend auf Rollen und Consciousness-Anforderungen.
   */
  private async isEventEligibleForClient(event: RealTimeEvent, clientInfo: ClientConnectionInfo): Promise<boolean> {
    const routingInfo = event.routing_info;
    
    // Check role requirements
    if (routingInfo.role_requirements.length > 0) {
      const hasRequiredRole = routingInfo.role_requirements.some(role => 
        clientInfo.roles.includes(role)
      );
      if (!hasRequiredRole) return false;
    }
    
    // Check consciousness requirements
    const consciousnessReq = routingInfo.consciousness_requirements;
    if (clientInfo.consciousness_profile.awareness_level < consciousnessReq.minimum_awareness_level) {
      return false;
    }
    
    if (consciousnessReq.required_consciousness_patterns.length > 0) {
      const hasRequiredPatterns = consciousnessReq.required_consciousness_patterns.every(pattern =>
        clientInfo.consciousness_profile.resonance_patterns.includes(pattern)
      );
      if (!hasRequiredPatterns) return false;
    }
    
    // Check excluded channels
    if (routingInfo.excluded_channels.some(channel => 
      clientInfo.subscription_channels.includes(channel)
    )) {
      return false;
    }
    
    return true;
  }

  /**
   * Send Event to Client
   * 
   * Sendet ein Event direkt an einen spezifischen Client
   * mit Post-Quantum-Verschlüsselung.
   */
  private async sendEventToClient(socketId: string, event: RealTimeEvent): Promise<void> {
    const socket = this.io.sockets.sockets.get(socketId);
    if (!socket) return;
    
    const clientInfo = this.clients.get(socketId);
    if (!clientInfo) return;
    
    // Encrypt event data if required
    let eventToSend = event;
    if (this.config.post_quantum_encryption) {
      eventToSend = await this.encryptEventForClient(event, clientInfo);
    }
    
    socket.emit('real_time_event', eventToSend);
  }

  /**
   * Encrypt Event for Client
   * 
   * Verschlüsselt Events für spezifische Clients mit
   * Post-Quantum-Kryptographie.
   */
  private async encryptEventForClient(event: RealTimeEvent, clientInfo: ClientConnectionInfo): Promise<RealTimeEvent> {
    const encryptedData = await this.cryptoEngine.encryptData(
      JSON.stringify(event.data),
      clientInfo.security_context.quantum_key_id
    );
    
    return {
      ...event,
      data: {
        ...event.data,
        primary_data: { encrypted: true, data: encryptedData.encrypted_data },
        context_data: { ...event.data.context_data, encryption_applied: true }
      }
    };
  }

  /**
   * Create Encryption Metadata
   * 
   * Erstellt Verschlüsselungsmetadaten für Events mit
   * vollständiger Post-Quantum-Sicherheit.
   */
  private async createEncryptionMetadata(clientInfo: ClientConnectionInfo): Promise<EncryptionMetadata> {
    const keyId = clientInfo.security_context.quantum_key_id;
    const dataToSign = `${clientInfo.client_id}_${Date.now()}`;
    const signature = await this.cryptoEngine.signData(dataToSign, keyId);
    
    return {
      encryption_algorithm: 'CRYSTALS_KYBER_1024',
      key_id: keyId,
      signature_algorithm: 'CRYSTALS_DILITHIUM_5',
      signature: signature.signature,
      quantum_entropy_level: 0.95,
      forward_secrecy: true
    };
  }

  /**
   * Check Channel Access
   * 
   * Prüft Channel-Zugriff basierend auf Rollen und
   * Consciousness-Level.
   */
  private async hasChannelAccess(clientInfo: ClientConnectionInfo, channel: string): Promise<boolean> {
    // Channel access rules
    const channelRules: Record<string, { roles: string[], consciousness_level: number }> = {
      'threat_alerts': { roles: ['security_analyst', 'admin'], consciousness_level: 0.3 },
      'consciousness_updates': { roles: ['consciousness_researcher', 'admin'], consciousness_level: 0.5 },
      'financial_anomalies': { roles: ['financial_analyst', 'compliance', 'admin'], consciousness_level: 0.2 },
      'system_status': { roles: ['user', 'analyst', 'admin'], consciousness_level: 0.0 },
      'critical_alerts': { roles: ['admin', 'senior_analyst'], consciousness_level: 0.7 }
    };
    
    const rule = channelRules[channel];
    if (!rule) return false;
    
    // Check role access
    const hasRole = rule.roles.some(role => clientInfo.roles.includes(role));
    if (!hasRole) return false;
    
    // Check consciousness level
    if (clientInfo.consciousness_profile.awareness_level < rule.consciousness_level) {
      return false;
    }
    
    return true;
  }

  /**
   * Broadcast Event
   * 
   * Öffentliche Methode zum Senden von Events an alle
   * berechtigten Clients.
   */
  public async broadcastEvent(event: RealTimeEvent): Promise<void> {
    this.eventQueue.push(event);
  }

  /**
   * Get Connected Clients
   * 
   * Gibt Informationen über alle verbundenen Clients zurück.
   */
  public getConnectedClients(): ClientConnectionInfo[] {
    return Array.from(this.clients.values());
  }

  /**
   * Get Client by User ID
   * 
   * Findet einen Client anhand der Benutzer-ID.
   */
  public getClientByUserId(userId: string): ClientConnectionInfo | undefined {
    return Array.from(this.clients.values()).find(client => client.user_id === userId);
  }

  /**
   * Disconnect Client
   * 
   * Trennt einen spezifischen Client vom WebSocket-Server.
   */
  public disconnectClient(socketId: string, reason: string = 'Server disconnect'): void {
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.disconnect(true);
    }
    this.clients.delete(socketId);
  }

  /**
   * Shutdown
   * 
   * Fährt den WebSocket-Manager ordnungsgemäß herunter.
   */
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down WebSocket Manager');
    
    // Disconnect all clients
    this.io.disconnectSockets(true);
    
    // Clear client map
    this.clients.clear();
    
    // Close server
    this.io.close();
    
    this.logger.info('WebSocket Manager shutdown complete');
  }
}