// Export main class from refactored version
export { ConsciousnessAuth } from './biometric-engine-refactored';

// Export all types from types module
export type {
  KeystrokeEvent,
  MouseEvent,
  BiometricProfile,
  AuthenticationResult,
  AuthenticationSession,
  KeystrokeDynamicsProfile,
  MouseMovementProfile,
  BehavioralPatternProfile,
  StatisticalMeasures,
  BiometricConfig,
  AnalysisScore
} from './biometric-types';

// Export component modules for advanced usage
export { KeystrokeAnalyzer } from './keystroke-analyzer';
export { MouseAnalyzer } from './mouse-analyzer';
export { BehavioralAnalyzer } from './behavioral-analyzer';