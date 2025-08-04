/**
 * STARGUARD Quantum Types
 * Additional quantum types that complement consciousness.types
 * Note: Uses existing types from consciousness.types, only adds new interfaces
 */

// Re-export base types for convenience (these are already defined in consciousness.types)
export type { ComplexNumber, Vector3D } from './consciousness.types';

// Additional Quantum Reality Types (not in consciousness.types)
export interface QuantumRealityState {
  readonly realityIndex: number;
  readonly dimensionalStability: number;
  readonly quantumCoherence: number;
  readonly temporalFlux: number;
  readonly causalityIntegrity: number;
}