export interface ThreatIndicator {
  id: string;
  type: 'ip' | 'url' | 'domain' | 'hash' | 'email';
  value: string;
  source: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  firstSeen: Date;
  lastSeen: Date;
  tags: string[];
  description?: string;
  geolocation?: {
    country: string;
    region: string;
    city: string;
    lat: number;
    lng: number;
  };
  malwareFamily?: string;
  threatType?: string[];
}

export interface ThreatFeed {
  id: string;
  name: string;
  url: string;
  type: 'json' | 'csv' | 'txt';
  updateInterval: number; // minutes
  lastUpdate: Date;
  isActive: boolean;
  parser: string;
  reliability: number; // 0-100
}

export interface ThreatAnalysis {
  indicator: ThreatIndicator;
  riskScore: number;
  correlatedThreats: ThreatIndicator[];
  patterns: ThreatPattern[];
  timeline: ThreatEvent[];
  geographicCluster?: {
    center: { lat: number; lng: number };
    radius: number;
    threatCount: number;
  };
}

export interface ThreatPattern {
  id: string;
  type: 'temporal' | 'geographic' | 'behavioral' | 'infrastructure';
  description: string;
  confidence: number;
  indicators: string[];
  timeline: {
    start: Date;
    end: Date;
    peaks: Date[];
  };
  metadata: Record<string, unknown>;
}

/**
 * Security anomaly from analysis
 */
export interface SecurityAnomaly {
  id: string;
  type: 'access_violation' | 'data_exfiltration' | 'privilege_escalation' | 'malware_signature' | 'network_intrusion' | 'behavioral_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  location: string;
  timestamp: Date;
  evidence: Record<string, unknown>;
  quantumSignature: string;
}

export interface ThreatEvent {
  timestamp: Date;
  indicator: string;
  event: string;
  source: string;
  severity: string;
  location?: {
    country: string;
    lat: number;
    lng: number;
  };
}

export interface ThreatIntelligence {
  summary: {
    totalThreats: number;
    newThreats: number;
    criticalThreats: number;
    topSources: string[];
    topCountries: string[];
    trendDirection: 'increasing' | 'decreasing' | 'stable';
  };
  landscape: {
    malwareFamilies: Array<{
      name: string;
      count: number;
      trend: number;
    }>;
    attackVectors: Array<{
      type: string;
      count: number;
      severity: string;
    }>;
    geographicDistribution: Array<{
      country: string;
      threatCount: number;
      severity: number;
    }>;
  };
  predictions: {
    nextHotspots: Array<{
      region: string;
      probability: number;
      timeframe: string;
    }>;
    emergingThreats: Array<{
      type: string;
      confidence: number;
      description: string;
    }>;
  };
}

export interface FeedProcessingResult {
  processed: number;
  newIndicators: number;
  updatedIndicators: number;
  errors: string[];
  processingTime: number;
}

export interface ThreatAlert {
  id: string;
  timestamp: Date;
  type: 'new_threat' | 'threat_update' | 'pattern_detected' | 'anomaly';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  indicators: ThreatIndicator[];
  recommendations: string[];
  affectedSystems?: string[];
}