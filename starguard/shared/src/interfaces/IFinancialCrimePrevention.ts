/**
 * Financial Crime Prevention Consciousness Interface
 * Geld als Energiefluss verstehen - Betrug als Bewusstseinsstörung
 */

import {
  OrganicTransactionFlow,
  MoneyLaunderingVortex,
  FraudEnergyDissipation,
  RelatedEntityMatrix,
  MaliciousIntentDetector,
  DeceptionPatternAnalyzer,
  FraudActorProfiler,
  PreventiveActionGenerator
} from '../types';

export interface IFinancialCrimePrevention {
  // Geld als Energiefluss verstehen
  moneyFlowConsciousness: {
    naturalPatterns: OrganicTransactionFlow;
    anomalousVortices: MoneyLaunderingVortex;
    energyLeakage: FraudEnergyDissipation;
    quantumEntanglement: RelatedEntityMatrix;
  };
  
  // Betrug als Bewusstseins-Störung
  fraudAsConsciousnessGlitch: {
    intentionFieldDistortion: MaliciousIntentDetector;
    realityManipulation: DeceptionPatternAnalyzer;
    consciousnessParasites: FraudActorProfiler;
    healingInterventions: PreventiveActionGenerator;
  };
}

// Money Energy Field Interface
export interface IMoneyEnergyField {
  fieldStrength: number;
  flowLines: IEnergyFlowLine[];
  vortices: IEnergyVortex[];
  coherence: number;
  suspiciousFlows: ISuspiciousFlow[];
}

// Energy Flow Line Interface
export interface IEnergyFlowLine {
  id: string;
  start: IEnergyPoint;
  end: IEnergyPoint;
  control1: IEnergyPoint;
  control2: IEnergyPoint;
  strength: number;
  naturalness: number;
}

// Energy Point Interface
export interface IEnergyPoint {
  x: number;
  y: number;
  z?: number;
  energy: number;
  entity?: string;
}

// Energy Vortex Interface (Money Laundering Indicator)
export interface IEnergyVortex {
  id: string;
  position: IEnergyPoint;
  strength: number;
  rotation: number;
  type: 'layering' | 'integration' | 'placement' | 'smurfing';
  affectedTransactions: string[];
  riskLevel: number;
}

// Suspicious Flow Interface
export interface ISuspiciousFlow {
  id: string;
  x: number;
  y: number;
  suspicion: number;
  pattern: string;
  relatedEntities: string[];
}

// Fraud Pattern Interface
export interface IFraudPattern {
  id: string;
  type: 'money_laundering' | 'insurance_fraud' | 'identity_theft' | 'collusion' | 'insider_trading';
  entities: string[];
  amount: number;
  risk: number;
  consciousnessDistortion: number;
  patternConfidence: number;
  timeline: IFraudTimeline;
}

// Fraud Timeline Interface
export interface IFraudTimeline {
  start: Date;
  peak: Date;
  detection: Date;
  events: IFraudEvent[];
}

// Fraud Event Interface
export interface IFraudEvent {
  timestamp: Date;
  type: string;
  actors: string[];
  amount: number;
  location: string;
  realityDeviation: number;
}

// Consciousness Signature Interface
export interface IConsciousnessSignature {
  entityId: string;
  baseline: IBaselineConsciousness;
  current: ICurrentConsciousness;
  deviation: number;
  maliceIndicators: IMaliceIndicator[];
}

// Baseline Consciousness Interface
export interface IBaselineConsciousness {
  integrity: number;
  transparency: number;
  consistency: number;
  ethicalAlignment: number;
}

// Current Consciousness Interface
export interface ICurrentConsciousness extends IBaselineConsciousness {
  deceptionLevel: number;
  realityManipulation: number;
  groupInfluence: number;
}

// Malice Indicator Interface
export interface IMaliceIndicator {
  type: string;
  strength: number;
  pattern: string;
  firstDetected: Date;
  evolution: number[];
}

// Collusion Network Interface
export interface ICollusionNetwork {
  id: string;
  members: ICollusionMember[];
  connectionStrength: number[][];
  groupConsciousness: IGroupConsciousness;
  criminalIntent: number;
  operationPatterns: string[];
}

// Collusion Member Interface
export interface ICollusionMember {
  id: string;
  role: 'leader' | 'executor' | 'facilitator' | 'beneficiary';
  consciousnessProfile: IConsciousnessSignature;
  connections: string[];
  influence: number;
}

// Group Consciousness Interface
export interface IGroupConsciousness {
  cohesion: number;
  sharedIntent: number;
  deceptionSync: number;
  evolutionRate: number;
  vulnerabilities: string[];
}

// AML Detection Result Interface
export interface IAMLDetectionResult {
  risk: number;
  patterns: {
    layering: ILayeringPattern[];
    smurfing: ISmurfingNetwork[];
    offshore: IOffshoreStructure[];
  };
  consciousness: ICriminalConsciousness;
  intervention: IFinancialIntervention;
}

// Layering Pattern Interface
export interface ILayeringPattern {
  id: string;
  layers: number;
  complexity: number;
  transactions: string[];
  obfuscationLevel: number;
}

// Smurfing Network Interface
export interface ISmurfingNetwork {
  id: string;
  nodes: string[];
  transactions: number;
  totalAmount: number;
  coordinationLevel: number;
  quantumEntanglement: number;
}

// Offshore Structure Interface
export interface IOffshoreStructure {
  id: string;
  jurisdictions: string[];
  entities: string[];
  dimensionalGateways: IDimensionalGateway[];
  opacity: number;
}

// Dimensional Gateway Interface (Offshore Portal)
export interface IDimensionalGateway {
  id: string;
  sourceJurisdiction: string;
  targetJurisdiction: string;
  flowVolume: number;
  transparencyLevel: number;
  riskFactors: string[];
}

// Criminal Consciousness Interface
export interface ICriminalConsciousness {
  profile: string;
  sophistication: number;
  adaptability: number;
  groupDynamics: IGroupConsciousness;
  futureIntentions: string[];
}

// Financial Intervention Interface
export interface IFinancialIntervention {
  type: 'block' | 'monitor' | 'investigate' | 'report' | 'heal';
  priority: number;
  actions: IFinancialAction[];
  expectedImpact: number;
  timeframe: string;
}

// Financial Action Interface
export interface IFinancialAction {
  id: string;
  type: string;
  target: string;
  description: string;
  requiredApprovals: string[];
  estimatedEffectiveness: number;
}