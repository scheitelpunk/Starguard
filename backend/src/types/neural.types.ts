/**
 * Neural Network Type Definitions
 * Type-safe neural processing interfaces
 */

/**
 * Neural network forward pass result
 */
export interface ForwardPassResult {
  output: number[];
  activations: number[];
  quantumState?: Map<string, number>;
}

/**
 * Training sample for neural networks
 */
export interface TrainingSample {
  input: number[];
  expectedOutput: number[];
  weight?: number;
}

/**
 * Neural network training result
 */
export interface TrainingResult {
  networkId: string;
  epochs: number;
  finalLoss: number;
  accuracy: number;
  quantumEfficiency: number;
}

/**
 * Network analytics data
 */
export interface NetworkAnalytics {
  id: string;
  layers: number;
  neurons: number;
  quantumNodes: number;
  efficiency: number;
  accuracy: number;
}

/**
 * Overall neural analytics
 */
export interface NeuralAnalytics {
  networks: NetworkAnalytics[];
  totalPatterns: number;
  processingLoad: number;
  quantumEntanglement: number;
}

/**
 * Neural processing queue item
 */
export interface ProcessingQueueItem {
  id: string;
  data: unknown;
  type: string;
  priority: number;
  timestamp: Date;
}

/**
 * Preprocessed data types
 */
export type PreprocessedData = string | number[] | Record<string, unknown> | unknown;

/**
 * Type guard for training sample
 */
export function isTrainingSample(obj: unknown): obj is TrainingSample {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'input' in obj &&
    'expectedOutput' in obj &&
    Array.isArray((obj as TrainingSample).input) &&
    Array.isArray((obj as TrainingSample).expectedOutput)
  );
}

/**
 * Type guard for forward pass result
 */
export function isForwardPassResult(obj: unknown): obj is ForwardPassResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'output' in obj &&
    Array.isArray((obj as ForwardPassResult).output)
  );
}
