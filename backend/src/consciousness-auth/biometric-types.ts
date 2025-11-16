/**
 * Type definitions for biometric authentication system
 * Extracted from biometric-engine.ts for better modularity
 */

export interface KeystrokeEvent {
  key: string;
  eventType: 'keydown' | 'keyup';
  timestamp: number;
  pressure?: number;
  sessionId: string;
  dwellTime?: number;
  flightTime?: number;
}

export interface MouseEvent {
  x: number;
  y: number;
  timestamp: number;
  eventType: 'move' | 'click' | 'scroll';
  button?: number;
  velocity?: number;
  acceleration?: number;
  sessionId: string;
}

export interface BiometricProfile {
  userId: string;
  keystrokeDynamics: KeystrokeDynamicsProfile;
  mouseMovement: MouseMovementProfile;
  behavioralPattern: BehavioralPatternProfile;
  created: number;
  lastUpdated: number;
  sampleCount: number;
}

export interface KeystrokeDynamicsProfile {
  dwellTimes: Map<string, StatisticalMeasures>;
  flightTimes: StatisticalMeasures;
  pressurePatterns: Map<string, StatisticalMeasures>;
  typingRhythm: StatisticalMeasures;
  commonDigraphs: Map<string, StatisticalMeasures>;
}

export interface MouseMovementProfile {
  velocity: StatisticalMeasures;
  acceleration: StatisticalMeasures;
  trajectoryAngles: StatisticalMeasures;
  clickPatterns: StatisticalMeasures;
  scrollingBehavior: StatisticalMeasures;
  pauseDuration: StatisticalMeasures;
  movementSmoothing: number;
}

export interface BehavioralPatternProfile {
  sessionDuration: StatisticalMeasures;
  activityPattern: Map<number, number>;
  errorRate: StatisticalMeasures;
  interactionFrequency: StatisticalMeasures;
  multitaskingPattern: StatisticalMeasures;
  focusMetrics: StatisticalMeasures;
}

export interface StatisticalMeasures {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  samples: number;
  confidence: number;
}

export interface AuthenticationResult {
  userId: string;
  authenticated: boolean;
  confidence: number;
  riskScore: number;
  matchingFactors: string[];
  anomalies: string[];
  timestamp: number;
  sessionId: string;
}

export interface AuthenticationSession {
  sessionId: string;
  userId: string;
  startTime: number;
  keystrokeEvents: KeystrokeEvent[];
  mouseEvents: MouseEvent[];
  isActive: boolean;
  lastActivity: number;
}

export interface BiometricConfig {
  sessionTimeout: number;
  minSampleSize: number;
  confidenceThreshold: number;
  riskThreshold: number;
  updateThreshold: number;
  keystrokeTimingTolerance: number;
  mouseVelocityTolerance: number;
  profileRetentionDays: number;
  maxProfileAge: number;
}

export interface AnalysisScore {
  confidence: number;
  anomalies: string[];
}
