/**
 * Type definitions for DefenseDNA system
 * Extracted from defense-dna.ts for better modularity
 */

export interface DefenseGene {
  id: string;
  type: 'SIGNATURE' | 'BEHAVIOR' | 'NETWORK' | 'HEURISTIC';
  sequence: string;
  strength: number;
  accuracy: number;
  falsePositiveRate: number;
  generation: number;
  parentIds: string[];
  mutations: string[];
  created: number;
}

export interface DefenseOrganism {
  id: string;
  genes: DefenseGene[];
  fitness: number;
  performance: PerformanceMetrics;
  generation: number;
  lineage: string[];
  created: number;
  lastEvaluation: number;
}

export interface PerformanceMetrics {
  detectionRate: number;
  falsePositiveRate: number;
  responseTime: number;
  resourceUsage: number;
  adaptabilityScore: number;
  survivabilityScore: number;
}

export interface MutationStrategy {
  type: 'POINT' | 'INSERTION' | 'DELETION' | 'INVERSION' | 'CROSSOVER';
  probability: number;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  targetGeneType?: string;
}

export interface EvolutionEnvironment {
  threatLandscape: ThreatProfile[];
  pressureIntensity: number;
  resourceConstraints: ResourceConstraints;
  selectionPressure: number;
  mutationRate: number;
}

export interface ThreatProfile {
  id: string;
  type: 'MALWARE' | 'INTRUSION' | 'DDOS' | 'APT' | 'ZERO_DAY';
  characteristics: string[];
  severity: number;
  frequency: number;
  samples: string[];
}

export interface ResourceConstraints {
  maxCpuUsage: number;
  maxMemoryUsage: number;
  maxResponseTime: number;
  maxFalsePositiveRate: number;
}

export interface YARARule {
  name: string;
  tags: string[];
  meta: Record<string, string>;
  strings: YARAString[];
  condition: string;
  generated: number;
  fitness: number;
}

export interface YARAString {
  name: string;
  type: 'text' | 'hex' | 'regex';
  value: string;
  modifiers: string[];
}

export interface EvolutionResult {
  generation: number;
  population: DefenseOrganism[];
  bestFitness: number;
  averageFitness: number;
  diversityIndex: number;
  convergenceRate: number;
  eliteOrganisms: DefenseOrganism[];
  newRules: YARARule[];
}

export interface DefenseDNAConfig {
  populationSize: number;
  eliteRatio: number;
  mutationRate: number;
  crossoverRate: number;
  maxGenerations: number;
  fitnessThreshold: number;
  diversityThreshold: number;
  stagnationLimit: number;
  resourcePenalty: number;
  adaptationWindow: number;
  yaraComplexityLimit: number;
}
