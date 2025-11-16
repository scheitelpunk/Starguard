// Export main class from refactored version
export { DefenseDNA } from './defense-dna-refactored';

// Export all types from types module
export type {
  DefenseGene,
  DefenseOrganism,
  PerformanceMetrics,
  MutationStrategy,
  EvolutionEnvironment,
  ThreatProfile,
  ResourceConstraints,
  YARARule,
  YARAString,
  EvolutionResult,
  DefenseDNAConfig
} from './defense-dna-types';

// Export component modules for advanced usage
export { GeneticAlgorithm } from './genetic-algorithm';
export { FitnessEvaluator } from './fitness-evaluator';
export { MutationEngine } from './mutation-engine';
export { YARAGenerator } from './yara-generator';