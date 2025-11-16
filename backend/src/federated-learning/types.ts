/**
 * Federated Learning Types
 * Privacy-preserving distributed machine learning for threat intelligence
 */

export interface FederatedNode {
  id: string;
  name: string;
  publicKey: string;
  endpoint: string;
  status: 'active' | 'inactive' | 'training' | 'updating';
  lastSeen: number;
  totalSamples: number;
  modelVersion: number;
  reputation: number; // 0-1, based on contribution quality
}

export interface ModelUpdate {
  nodeId: string;
  modelVersion: number;
  weights: Tensor;
  gradients?: Tensor;
  sampleCount: number;
  trainingLoss: number;
  timestamp: number;
  signature: string; // Cryptographic signature
  epsilon?: number; // Differential privacy parameter
}

export interface Tensor {
  shape: number[];
  data: Float32Array;
  dtype: 'float32' | 'float64' | 'int32';
}

export interface FederatedTrainingRound {
  id: string;
  roundNumber: number;
  startTime: number;
  endTime?: number;
  status: 'pending' | 'training' | 'aggregating' | 'completed' | 'failed';
  participatingNodes: string[];
  receivedUpdates: ModelUpdate[];
  aggregatedModel?: GlobalModel;
  convergenceMetric?: number;
}

export interface GlobalModel {
  version: number;
  weights: Tensor;
  metadata: {
    trainedOn: number; // Total samples
    accuracy?: number;
    loss?: number;
    createdAt: number;
    contributors: string[]; // Node IDs
  };
  checksum: string;
}

export interface DifferentialPrivacyConfig {
  enabled: boolean;
  epsilon: number; // Privacy budget (smaller = more private)
  delta: number; // Probability of privacy breach
  clipNorm: number; // Gradient clipping threshold
  noiseMultiplier: number; // Noise scale
}

export interface FederatedConfig {
  minNodesPerRound: number;
  maxNodesPerRound: number;
  roundTimeout: number; // milliseconds
  convergenceThreshold: number;
  maxRounds: number;
  aggregationStrategy: 'federated_averaging' | 'weighted_average' | 'median' | 'trimmed_mean';
  differentialPrivacy: DifferentialPrivacyConfig;
  byzantineDefense: boolean; // Protect against malicious updates
}

export interface ByzantineDetectionResult {
  isMalicious: boolean;
  confidence: number;
  reason: string;
  anomalyScore: number;
}

export interface ThreatPattern {
  id: string;
  patternType: 'network_anomaly' | 'malware_signature' | 'attack_sequence' | 'behavioral';
  features: number[];
  label: 'benign' | 'malicious';
  confidence: number;
  source: string; // Node ID
  timestamp: number;
}

export interface SecureAggregationProtocol {
  protocol: 'additive_secret_sharing' | 'homomorphic' | 'secure_multiparty';
  threshold: number; // Minimum nodes for decryption
  publicKeys: Map<string, string>;
}
