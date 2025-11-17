/**
 * Software-Defined Perimeter Controller
 *
 * Zero-trust network architecture controller for identity-centric micro-perimeters
 * Manages authentication, authorization, policy enforcement, and connection brokering
 */

import { EventEmitter } from 'events';
import {
  SDPConfig,
  UserIdentity,
  DeviceInfo,
  DevicePosture,
  PostureStatus,
  AccessPolicy,
  PolicyAction,
  AccessLevel,
  SDPSession,
  ConnectionState,
  AuthenticationMethod,
  ConnectionRequest,
  ConnectionResponse,
  SDPGateway,
  NetworkSegment,
  MicroSegment,
  TrustScore,
  SDPEvent,
  SDPMetrics,
  PolicyEvaluationResult,
  AuditLogEntry
} from './types';

/**
 * SDP Controller for zero-trust network access
 */
export class SDPController extends EventEmitter {
  private config: SDPConfig;
  private users: Map<string, UserIdentity> = new Map();
  private devices: Map<string, DeviceInfo> = new Map();
  private postures: Map<string, DevicePosture> = new Map();
  private policies: Map<string, AccessPolicy> = new Map();
  private sessions: Map<string, SDPSession> = new Map();
  private gateways: Map<string, SDPGateway> = new Map();
  private segments: Map<string, NetworkSegment> = new Map();
  private microSegments: Map<string, MicroSegment> = new Map();
  private trustScores: Map<string, TrustScore> = new Map();
  private events: SDPEvent[] = [];
  private auditLog: AuditLogEntry[] = [];
  private postureCheckTimers: Map<string, NodeJS.Timeout> = new Map();
  private sessionCleanupTimer?: NodeJS.Timeout;

  constructor(config?: Partial<SDPConfig>) {
    super();
    this.config = {
      controllerId: `controller_${Date.now()}`,
      defaultSessionDuration: 3600000, // 1 hour
      maxSessionDuration: 28800000, // 8 hours
      sessionRenewalWindow: 300000, // 5 minutes
      postureCheckInterval: 60000, // 1 minute
      trustScoreUpdateInterval: 300000, // 5 minutes
      minTrustScore: 50,
      enableSPA: true,
      enableMutualTLS: true,
      enableQuantumResistant: false,
      defaultPolicy: 'deny',
      logging: {
        enabled: true,
        level: 'info',
        retentionDays: 90
      },
      rateLimit: {
        enabled: true,
        requestsPerMinute: 100,
        burstSize: 20
      },
      ...config
    };

    this.startSessionCleanup();
  }

  /**
   * Register a user
   */
  async registerUser(user: UserIdentity): Promise<UserIdentity> {
    this.users.set(user.id, user);
    this.emit('user:registered', user);
    await this.logAudit({
      eventType: 'user_registered',
      userId: user.id,
      action: 'register',
      result: 'success',
      details: { username: user.username }
    });
    return user;
  }

  /**
   * Register a device
   */
  async registerDevice(device: DeviceInfo): Promise<DeviceInfo> {
    this.devices.set(device.id, device);
    this.emit('device:registered', device);

    // Start posture checking
    if (this.config.postureCheckInterval > 0) {
      this.startPostureChecking(device.id);
    }

    await this.logAudit({
      eventType: 'device_registered',
      deviceId: device.id,
      action: 'register',
      result: 'success',
      details: { hostname: device.hostname, type: device.type }
    });

    return device;
  }

  /**
   * Register an access policy
   */
  async registerPolicy(policy: AccessPolicy): Promise<AccessPolicy> {
    this.policies.set(policy.id, policy);
    this.emit('policy:registered', policy);
    await this.logAudit({
      eventType: 'policy_registered',
      action: 'register_policy',
      result: 'success',
      details: { policyId: policy.id, name: policy.name }
    });
    return policy;
  }

  /**
   * Register a gateway
   */
  async registerGateway(gateway: SDPGateway): Promise<SDPGateway> {
    this.gateways.set(gateway.id, gateway);
    this.emit('gateway:registered', gateway);
    await this.logAudit({
      eventType: 'gateway_registered',
      action: 'register_gateway',
      result: 'success',
      details: { gatewayId: gateway.id, name: gateway.name }
    });
    return gateway;
  }

  /**
   * Update device posture
   */
  async updateDevicePosture(posture: DevicePosture): Promise<void> {
    this.postures.set(posture.deviceId, posture);

    // Update trust score based on posture
    await this.updateTrustScore(posture.deviceId);

    // Check for existing sessions
    const deviceSessions = Array.from(this.sessions.values())
      .filter(s => s.deviceId === posture.deviceId && s.state === 'active');

    // Terminate sessions if posture is non-compliant
    if (posture.status === 'non_compliant') {
      for (const session of deviceSessions) {
        await this.terminateSession(session.id, 'posture_check_failed');
      }

      const event: SDPEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'posture_check_failed',
        severity: 'warning',
        deviceId: posture.deviceId,
        details: { issues: posture.issues, score: posture.score },
        timestamp: Date.now()
      };
      this.events.push(event);
      this.emit('posture:failed', event);
    }

    this.emit('posture:updated', posture);
  }

  /**
   * Start posture checking for a device
   */
  private startPostureChecking(deviceId: string): void {
    const timer = setInterval(() => {
      this.emit('posture:check:requested', { deviceId });
    }, this.config.postureCheckInterval);

    this.postureCheckTimers.set(deviceId, timer);
  }

  /**
   * Stop posture checking for a device
   */
  private stopPostureChecking(deviceId: string): void {
    const timer = this.postureCheckTimers.get(deviceId);
    if (timer) {
      clearInterval(timer);
      this.postureCheckTimers.delete(deviceId);
    }
  }

  /**
   * Handle connection request
   */
  async handleConnectionRequest(request: ConnectionRequest): Promise<ConnectionResponse> {
    const startTime = Date.now();

    // Validate user and device
    const user = this.users.get(request.userId);
    const device = this.devices.get(request.deviceId);

    if (!user || !device) {
      return this.denyConnection(request, 'Invalid user or device');
    }

    // Check device posture
    const posture = this.postures.get(request.deviceId);
    if (!posture || posture.status === 'non_compliant') {
      return this.denyConnection(request, 'Device posture non-compliant');
    }

    // Check trust score
    const trustScore = await this.getTrustScore(request.userId, request.deviceId);
    if (trustScore.score < this.config.minTrustScore) {
      return this.denyConnection(request, `Trust score too low: ${trustScore.score}`);
    }

    // Evaluate policies
    const evaluation = await this.evaluatePolicies(request, user, device, posture);

    if (evaluation.decision === 'deny') {
      return this.denyConnection(request, evaluation.reason);
    }

    if (evaluation.decision === 'challenge') {
      return {
        requestId: request.id,
        decision: 'challenge',
        reason: 'Multi-factor authentication required',
        timestamp: Date.now()
      };
    }

    // Create session
    const session = await this.createSession(request, evaluation);

    // Select gateway
    const gateway = this.selectGateway(request.resourceId);
    if (!gateway) {
      return this.denyConnection(request, 'No available gateway');
    }

    const response: ConnectionResponse = {
      requestId: request.id,
      decision: 'allow',
      sessionId: session.id,
      gatewayEndpoint: gateway.publicEndpoint,
      credentials: {
        token: `token_${session.id}`,
        expiresAt: session.expiresAt
      },
      allowedResources: session.grantedResources.map(r => r.resourceId),
      restrictions: evaluation.restrictions,
      timestamp: Date.now()
    };

    await this.logAudit({
      eventType: 'connection_granted',
      userId: request.userId,
      deviceId: request.deviceId,
      sessionId: session.id,
      action: 'connect',
      resource: request.resourceId,
      result: 'success',
      details: {
        accessLevel: evaluation.accessLevel,
        duration: Date.now() - startTime
      },
      ipAddress: request.sourceIp
    });

    const event: SDPEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'connection_granted',
      severity: 'info',
      userId: request.userId,
      deviceId: request.deviceId,
      sessionId: session.id,
      resourceId: request.resourceId,
      gatewayId: gateway.id,
      details: response,
      timestamp: Date.now()
    };
    this.events.push(event);
    this.emit('connection:granted', event);

    return response;
  }

  /**
   * Deny connection
   */
  private async denyConnection(request: ConnectionRequest, reason: string): Promise<ConnectionResponse> {
    await this.logAudit({
      eventType: 'connection_denied',
      userId: request.userId,
      deviceId: request.deviceId,
      action: 'connect',
      resource: request.resourceId,
      result: 'failure',
      details: { reason },
      ipAddress: request.sourceIp
    });

    const event: SDPEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'connection_denied',
      severity: 'warning',
      userId: request.userId,
      deviceId: request.deviceId,
      resourceId: request.resourceId,
      details: { reason },
      timestamp: Date.now()
    };
    this.events.push(event);
    this.emit('connection:denied', event);

    return {
      requestId: request.id,
      decision: 'deny',
      reason,
      timestamp: Date.now()
    };
  }

  /**
   * Evaluate access policies
   */
  private async evaluatePolicies(
    request: ConnectionRequest,
    user: UserIdentity,
    device: DeviceInfo,
    posture: DevicePosture
  ): Promise<PolicyEvaluationResult> {
    const applicablePolicies = Array.from(this.policies.values())
      .filter(p => p.enabled)
      .filter(p => this.policyApplies(p, user, device, posture, request))
      .sort((a, b) => a.priority - b.priority); // Lower priority number = higher priority

    if (applicablePolicies.length === 0) {
      return {
        requestId: request.id,
        decision: this.config.defaultPolicy === 'allow' ? 'allow' : 'deny',
        matchedPolicies: [],
        reason: 'No applicable policies found',
        accessLevel: 'none',
        sessionDuration: 0,
        requiresMfa: false,
        restrictions: {},
        timestamp: Date.now()
      };
    }

    // Use the highest priority policy
    const policy = applicablePolicies[0];

    return {
      requestId: request.id,
      decision: policy.action === 'allow' ? 'allow' : policy.action === 'deny' ? 'deny' : 'challenge',
      matchedPolicies: [policy.id],
      reason: `Matched policy: ${policy.name}`,
      accessLevel: policy.accessLevel,
      sessionDuration: Math.min(policy.sessionDuration, this.config.maxSessionDuration),
      requiresMfa: policy.requiresMfa,
      restrictions: {
        resources: policy.resources,
        sessionDuration: policy.sessionDuration
      },
      timestamp: Date.now()
    };
  }

  /**
   * Check if policy applies to request
   */
  private policyApplies(
    policy: AccessPolicy,
    user: UserIdentity,
    device: DeviceInfo,
    posture: DevicePosture,
    request: ConnectionRequest
  ): boolean {
    const conditions = policy.conditions;

    // Check user conditions
    if (conditions.users && !conditions.users.includes(user.id)) {
      return false;
    }

    // Check group conditions
    if (conditions.groups && !conditions.groups.some(g => user.groups.includes(g))) {
      return false;
    }

    // Check role conditions
    if (conditions.roles && !conditions.roles.some(r => user.roles.includes(r))) {
      return false;
    }

    // Check device conditions
    if (conditions.devices && !conditions.devices.includes(device.id)) {
      return false;
    }

    // Check device type conditions
    if (conditions.deviceTypes && !conditions.deviceTypes.includes(device.type)) {
      return false;
    }

    // Check posture requirements
    if (conditions.postureRequired) {
      if (posture.score < conditions.postureRequired.minimumScore) {
        return false;
      }
    }

    // Check resource matching
    const resourceMatches = policy.resources.some(r =>
      r.identifiers.includes(request.resourceId)
    );
    if (!resourceMatches) {
      return false;
    }

    // Check time windows
    if (conditions.timeWindows) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDay = now.getDay();

      const inTimeWindow = conditions.timeWindows.some(window => {
        if (!window.daysOfWeek.includes(currentDay)) {
          return false;
        }

        const [startHour, startMinute] = window.start.split(':').map(Number);
        const [endHour, endMinute] = window.end.split(':').map(Number);

        const currentTime = currentHour * 60 + currentMinute;
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        return currentTime >= startTime && currentTime <= endTime;
      });

      if (!inTimeWindow) {
        return false;
      }
    }

    return true;
  }

  /**
   * Create SDP session
   */
  private async createSession(
    request: ConnectionRequest,
    evaluation: PolicyEvaluationResult
  ): Promise<SDPSession> {
    const session: SDPSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: request.userId,
      deviceId: request.deviceId,
      state: 'active',
      authenticationMethod: request.authenticationMethod,
      accessPolicies: evaluation.matchedPolicies,
      grantedResources: [{
        resourceId: request.resourceId,
        accessLevel: evaluation.accessLevel,
        expiresAt: Date.now() + evaluation.sessionDuration
      }],
      startTime: Date.now(),
      expiresAt: Date.now() + evaluation.sessionDuration,
      lastActivity: Date.now(),
      ipAddress: request.sourceIp,
      metadata: {}
    };

    this.sessions.set(session.id, session);
    this.emit('session:created', session);

    return session;
  }

  /**
   * Terminate session
   */
  async terminateSession(sessionId: string, reason: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.state = 'terminated';
    this.emit('session:terminated', { sessionId, reason });

    await this.logAudit({
      eventType: 'session_terminated',
      userId: session.userId,
      deviceId: session.deviceId,
      sessionId: session.id,
      action: 'terminate',
      result: 'success',
      details: { reason }
    });

    this.sessions.delete(sessionId);
  }

  /**
   * Select gateway for resource
   */
  private selectGateway(resourceId: string): SDPGateway | undefined {
    const activeGateways = Array.from(this.gateways.values())
      .filter(g => g.status === 'active')
      .filter(g => g.activeConnections < g.maxConnections);

    if (activeGateways.length === 0) {
      return undefined;
    }

    // Simple round-robin: select gateway with fewest connections
    return activeGateways.reduce((prev, current) =>
      prev.activeConnections < current.activeConnections ? prev : current
    );
  }

  /**
   * Get or create trust score
   */
  private async getTrustScore(userId: string, deviceId: string): Promise<TrustScore> {
    const key = `${userId}:${deviceId}`;
    let trustScore = this.trustScores.get(key);

    if (!trustScore) {
      trustScore = {
        userId,
        deviceId,
        score: 50, // Default score
        factors: {
          authentication: 50,
          devicePosture: 50,
          behavior: 50,
          location: 50,
          timeOfDay: 50
        },
        history: [],
        lastUpdated: Date.now()
      };
      this.trustScores.set(key, trustScore);
    }

    return trustScore;
  }

  /**
   * Update trust score
   */
  private async updateTrustScore(deviceId: string): Promise<void> {
    for (const [key, score] of this.trustScores.entries()) {
      if (score.deviceId === deviceId) {
        const posture = this.postures.get(deviceId);
        if (posture) {
          score.factors.devicePosture = posture.score;
          score.score = Object.values(score.factors).reduce((a, b) => a + b, 0) / 5;
          score.history.push({
            score: score.score,
            timestamp: Date.now(),
            event: 'posture_updated'
          });
          score.lastUpdated = Date.now();
        }
      }
    }
  }

  /**
   * Start session cleanup timer
   */
  private startSessionCleanup(): void {
    this.sessionCleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.expiresAt < now) {
          this.terminateSession(sessionId, 'expired');
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Log audit entry
   */
  private async logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const auditEntry: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...entry
    };

    this.auditLog.push(auditEntry);

    // Trim audit log based on retention
    const retentionMs = this.config.logging.retentionDays * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - retentionMs;
    this.auditLog = this.auditLog.filter(e => e.timestamp > cutoff);
  }

  /**
   * Get metrics
   */
  getMetrics(): SDPMetrics {
    const activeSessions = Array.from(this.sessions.values()).filter(s => s.state === 'active');
    const activeGateways = Array.from(this.gateways.values()).filter(g => g.status === 'active');
    const activePolicies = Array.from(this.policies.values()).filter(p => p.enabled);

    const compliantPostures = Array.from(this.postures.values()).filter(p => p.status === 'compliant');
    const nonCompliantPostures = Array.from(this.postures.values()).filter(p => p.status === 'non_compliant');

    const trustScoreValues = Array.from(this.trustScores.values()).map(t => t.score);
    const avgTrustScore = trustScoreValues.reduce((a, b) => a + b, 0) / (trustScoreValues.length || 1);

    const connectionEvents = this.events.filter(e =>
      e.type === 'connection_granted' || e.type === 'connection_denied'
    );

    return {
      totalSessions: this.sessions.size,
      activeSessions: activeSessions.length,
      totalGateways: this.gateways.size,
      activeGateways: activeGateways.length,
      totalPolicies: this.policies.size,
      activePolicies: activePolicies.length,
      connections: {
        total: connectionEvents.length,
        allowed: connectionEvents.filter(e => e.type === 'connection_granted').length,
        denied: connectionEvents.filter(e => e.type === 'connection_denied').length,
        challenged: 0 // Would track challenges if implemented
      },
      postureChecks: {
        total: this.postures.size,
        compliant: compliantPostures.length,
        nonCompliant: nonCompliantPostures.length
      },
      trustScores: {
        average: avgTrustScore,
        median: this.calculateMedian(trustScoreValues),
        distribution: this.calculateTrustScoreDistribution(trustScoreValues)
      },
      performance: {
        averageConnectionTime: 50, // Would calculate from events
        averageAuthenticationTime: 100,
        averagePostureCheckTime: 200
      },
      timestamp: Date.now()
    };
  }

  /**
   * Calculate median
   */
  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  /**
   * Calculate trust score distribution
   */
  private calculateTrustScoreDistribution(scores: number[]): Record<string, number> {
    const distribution = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };

    for (const score of scores) {
      if (score <= 20) distribution['0-20']++;
      else if (score <= 40) distribution['21-40']++;
      else if (score <= 60) distribution['41-60']++;
      else if (score <= 80) distribution['61-80']++;
      else distribution['81-100']++;
    }

    return distribution;
  }

  /**
   * Get configuration
   */
  getConfig(): SDPConfig {
    return { ...this.config };
  }

  /**
   * Get audit log
   */
  getAuditLog(filter?: { userId?: string; deviceId?: string; startTime?: number; endTime?: number }): AuditLogEntry[] {
    let logs = this.auditLog;

    if (filter?.userId) {
      logs = logs.filter(l => l.userId === filter.userId);
    }

    if (filter?.deviceId) {
      logs = logs.filter(l => l.deviceId === filter.deviceId);
    }

    if (filter?.startTime) {
      logs = logs.filter(l => l.timestamp >= filter.startTime!);
    }

    if (filter?.endTime) {
      logs = logs.filter(l => l.timestamp <= filter.endTime!);
    }

    return logs;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Stop all timers
    if (this.sessionCleanupTimer) {
      clearInterval(this.sessionCleanupTimer);
    }

    for (const timer of this.postureCheckTimers.values()) {
      clearInterval(timer);
    }

    // Clear all data
    this.users.clear();
    this.devices.clear();
    this.postures.clear();
    this.policies.clear();
    this.sessions.clear();
    this.gateways.clear();
    this.segments.clear();
    this.microSegments.clear();
    this.trustScores.clear();
    this.events = [];
    this.auditLog = [];
    this.postureCheckTimers.clear();
  }
}
