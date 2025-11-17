/**
 * Software-Defined Perimeter (SDP) Types
 *
 * Zero-trust network architecture with identity-centric micro-perimeters
 * Implements dynamic access control, device posture checking, and micro-segmentation
 */

/**
 * SDP Component Type
 */
export type SDPComponentType = 'controller' | 'gateway' | 'client';

/**
 * Connection State
 */
export type ConnectionState = 'pending' | 'authenticating' | 'authorized' | 'active' | 'denied' | 'expired' | 'terminated';

/**
 * Access Level
 */
export type AccessLevel = 'none' | 'read' | 'write' | 'admin' | 'full';

/**
 * Device Posture Status
 */
export type PostureStatus = 'compliant' | 'non_compliant' | 'unknown' | 'checking';

/**
 * Authentication Method
 */
export type AuthenticationMethod = 'certificate' | 'oauth' | 'saml' | 'multi_factor' | 'zero_knowledge';

/**
 * Policy Action
 */
export type PolicyAction = 'allow' | 'deny' | 'challenge' | 'log';

/**
 * Device Information
 */
export interface DeviceInfo {
  id: string;
  type: 'desktop' | 'laptop' | 'mobile' | 'iot' | 'server';
  os: string;
  version: string;
  hostname: string;
  macAddress?: string;
  ipAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
    country?: string;
    city?: string;
  };
  lastSeen: number;
}

/**
 * Device Posture Check
 */
export interface DevicePosture {
  deviceId: string;
  status: PostureStatus;
  checks: {
    antivirus: {
      installed: boolean;
      upToDate: boolean;
      enabled: boolean;
    };
    firewall: {
      enabled: boolean;
      configured: boolean;
    };
    encryption: {
      diskEncryption: boolean;
      transportEncryption: boolean;
    };
    patches: {
      osUpToDate: boolean;
      criticalPatchesApplied: boolean;
      lastPatchDate: number;
    };
    software: {
      unauthorizedSoftware: string[];
      requiredSoftware: string[];
      installedSoftware: string[];
    };
  };
  score: number; // 0-100
  timestamp: number;
  issues: string[];
}

/**
 * User Identity
 */
export interface UserIdentity {
  id: string;
  username: string;
  email: string;
  roles: string[];
  groups: string[];
  attributes: Record<string, any>;
  mfaEnabled: boolean;
  certificateFingerprint?: string;
  createdAt: number;
  lastAuthentication?: number;
}

/**
 * Access Policy
 */
export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  priority: number; // Lower number = higher priority
  enabled: boolean;
  conditions: {
    users?: string[]; // User IDs
    groups?: string[]; // Group names
    roles?: string[]; // Role names
    devices?: string[]; // Device IDs
    deviceTypes?: Array<'desktop' | 'laptop' | 'mobile' | 'iot' | 'server'>;
    locations?: {
      allowedCountries?: string[];
      deniedCountries?: string[];
      allowedCities?: string[];
    };
    timeWindows?: Array<{
      start: string; // HH:MM
      end: string; // HH:MM
      daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
    }>;
    postureRequired?: {
      minimumScore: number;
      requiredChecks: Array<keyof DevicePosture['checks']>;
    };
    networkSegments?: string[];
  };
  resources: {
    type: 'service' | 'network' | 'application' | 'api';
    identifiers: string[]; // Service names, IP ranges, URLs, etc.
    ports?: number[];
    protocols?: string[];
  }[];
  action: PolicyAction;
  accessLevel: AccessLevel;
  sessionDuration: number; // milliseconds
  requiresMfa: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * SDP Session
 */
export interface SDPSession {
  id: string;
  userId: string;
  deviceId: string;
  state: ConnectionState;
  authenticationMethod: AuthenticationMethod;
  accessPolicies: string[]; // Policy IDs
  grantedResources: {
    resourceId: string;
    accessLevel: AccessLevel;
    expiresAt: number;
  }[];
  startTime: number;
  expiresAt: number;
  lastActivity: number;
  ipAddress: string;
  gatewayId?: string;
  metadata: Record<string, any>;
}

/**
 * Network Segment
 */
export interface NetworkSegment {
  id: string;
  name: string;
  description: string;
  cidr: string; // CIDR notation
  vlanId?: number;
  gateway: string; // Gateway IP
  isolation: 'strict' | 'partial' | 'none';
  allowedSegments: string[]; // IDs of segments that can communicate
  resources: string[]; // Resource IDs in this segment
  policies: string[]; // Policy IDs applicable to this segment
  createdAt: number;
  updatedAt: number;
}

/**
 * SDP Gateway Configuration
 */
export interface SDPGateway {
  id: string;
  name: string;
  type: 'accepting' | 'initiating';
  publicEndpoint: string; // URL or IP:Port
  privateEndpoint?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  controllerId: string;
  supportedProtocols: string[];
  maxConnections: number;
  activeConnections: number;
  segments: string[]; // Network segment IDs
  capabilities: {
    singlePacketAuthorization: boolean;
    mutualTLS: boolean;
    quantumResistant: boolean;
    loadBalancing: boolean;
  };
  metrics: {
    totalConnections: number;
    activeConnections: number;
    deniedConnections: number;
    averageLatency: number; // ms
    bytesTransferred: number;
  };
  createdAt: number;
  lastHeartbeat: number;
}

/**
 * Single Packet Authorization (SPA)
 */
export interface SPAPacket {
  timestamp: number;
  deviceId: string;
  userId: string;
  requestedResource: string;
  signature: string;
  nonce: string;
  encryptedPayload: string;
}

/**
 * Connection Request
 */
export interface ConnectionRequest {
  id: string;
  sessionId?: string;
  userId: string;
  deviceId: string;
  resourceId: string;
  resourceType: 'service' | 'network' | 'application' | 'api';
  requestedAccess: AccessLevel;
  authenticationMethod: AuthenticationMethod;
  devicePosture?: DevicePosture;
  sourceIp: string;
  timestamp: number;
}

/**
 * Connection Response
 */
export interface ConnectionResponse {
  requestId: string;
  decision: 'allow' | 'deny' | 'challenge';
  reason?: string;
  sessionId?: string;
  gatewayEndpoint?: string;
  credentials?: {
    token: string;
    certificate?: string;
    expiresAt: number;
  };
  allowedResources?: string[];
  restrictions?: {
    rateLimit?: number; // requests per minute
    bandwidthLimit?: number; // bytes per second
    timeWindow?: {
      start: number;
      end: number;
    };
  };
  timestamp: number;
}

/**
 * Micro-Segment
 */
export interface MicroSegment {
  id: string;
  name: string;
  type: 'user' | 'device' | 'application' | 'service';
  members: string[]; // IDs of users, devices, apps, or services
  rules: {
    inbound: {
      allowed: string[]; // Micro-segment IDs
      denied: string[]; // Micro-segment IDs
    };
    outbound: {
      allowed: string[]; // Micro-segment IDs
      denied: string[]; // Micro-segment IDs
    };
  };
  policies: string[]; // Policy IDs
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Trust Score
 */
export interface TrustScore {
  userId: string;
  deviceId: string;
  score: number; // 0-100
  factors: {
    authentication: number; // 0-100
    devicePosture: number; // 0-100
    behavior: number; // 0-100
    location: number; // 0-100
    timeOfDay: number; // 0-100
  };
  history: Array<{
    score: number;
    timestamp: number;
    event: string;
  }>;
  lastUpdated: number;
}

/**
 * SDP Event
 */
export interface SDPEvent {
  id: string;
  type: 'connection_request' | 'connection_granted' | 'connection_denied' | 'session_created' | 'session_expired' | 'policy_violation' | 'posture_check_failed' | 'anomaly_detected';
  severity: 'info' | 'warning' | 'critical';
  userId?: string;
  deviceId?: string;
  sessionId?: string;
  resourceId?: string;
  policyId?: string;
  gatewayId?: string;
  details: Record<string, any>;
  timestamp: number;
}

/**
 * SDP Metrics
 */
export interface SDPMetrics {
  totalSessions: number;
  activeSessions: number;
  totalGateways: number;
  activeGateways: number;
  totalPolicies: number;
  activePolicies: number;
  connections: {
    total: number;
    allowed: number;
    denied: number;
    challenged: number;
  };
  postureChecks: {
    total: number;
    compliant: number;
    nonCompliant: number;
  };
  trustScores: {
    average: number;
    median: number;
    distribution: {
      '0-20': number;
      '21-40': number;
      '41-60': number;
      '61-80': number;
      '81-100': number;
    };
  };
  performance: {
    averageConnectionTime: number; // ms
    averageAuthenticationTime: number; // ms
    averagePostureCheckTime: number; // ms
  };
  timestamp: number;
}

/**
 * SDP Configuration
 */
export interface SDPConfig {
  controllerId: string;
  defaultSessionDuration: number; // milliseconds
  maxSessionDuration: number; // milliseconds
  sessionRenewalWindow: number; // milliseconds before expiry
  postureCheckInterval: number; // milliseconds
  trustScoreUpdateInterval: number; // milliseconds
  minTrustScore: number; // 0-100
  enableSPA: boolean; // Single Packet Authorization
  enableMutualTLS: boolean;
  enableQuantumResistant: boolean;
  defaultPolicy: PolicyAction;
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    retentionDays: number;
  };
  rateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
    burstSize: number;
  };
}

/**
 * Policy Evaluation Result
 */
export interface PolicyEvaluationResult {
  requestId: string;
  decision: 'allow' | 'deny' | 'challenge';
  matchedPolicies: string[]; // Policy IDs
  reason: string;
  accessLevel: AccessLevel;
  sessionDuration: number;
  requiresMfa: boolean;
  restrictions: Record<string, any>;
  timestamp: number;
}

/**
 * Audit Log Entry
 */
export interface AuditLogEntry {
  id: string;
  timestamp: number;
  eventType: string;
  userId?: string;
  deviceId?: string;
  sessionId?: string;
  action: string;
  resource?: string;
  result: 'success' | 'failure';
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
