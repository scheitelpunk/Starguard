/**
 * SOAR Engine Types
 * Security Orchestration, Automation, and Response
 */

export interface Incident {
  id: string;
  type: IncidentType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'contained' | 'resolved';
  timestamp: number;

  // Affected resources
  hosts: string[];
  users: string[];
  targetIPs: string[];
  targetDomains: string[];
  sourceIPs: string[];
  affectedData: string[];
  c2Servers?: string[];

  // Threat intelligence
  attackVectors: string[];
  mitreAttackIds: string[];
  iocs: IOC[];

  // Metadata
  detectedBy: string;
  assignedTo?: string;
  priority: number;
  tags: string[];
}

export enum IncidentType {
  RANSOMWARE = 'ransomware',
  DDOS = 'ddos',
  PHISHING = 'phishing',
  DATA_BREACH = 'data_breach',
  MALWARE = 'malware',
  INSIDER_THREAT = 'insider_threat',
  APT = 'apt',
  CREDENTIAL_THEFT = 'credential_theft',
  LATERAL_MOVEMENT = 'lateral_movement',
  CRYPTOMINING = 'cryptomining'
}

export interface IOC {
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
  value: string;
  confidence: number;
  source: string;
  firstSeen: number;
  lastSeen: number;
}

export interface PlaybookAction {
  id: string;
  name: string;
  description: string;
  execute: (incident: Incident) => Promise<ActionResult>;
  rollback?: (incident: Incident, result: ActionResult) => Promise<void>;
  timeout?: number;
  retries?: number;
}

export interface ActionResult {
  success: boolean;
  message: string;
  duration: number;
  data?: any;
  errors?: string[];
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  incidentTypes: IncidentType[];
  actions: PlaybookAction[];
  conditions?: PlaybookCondition[];
  parallelExecution?: boolean;
}

export interface PlaybookCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}

export interface PlaybookExecution {
  id: string;
  playbookId: string;
  incidentId: string;
  startTime: number;
  endTime?: number;
  status: 'running' | 'completed' | 'failed' | 'partial';
  actionResults: Map<string, ActionResult>;
  errors: string[];
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'pagerduty' | 'webhook' | 'sms';
  config: Record<string, any>;
  enabled: boolean;
}

export interface EscalationRule {
  severity: string;
  timeToEscalate: number; // milliseconds
  escalateTo: string[];
  notificationChannels: NotificationChannel[];
}
