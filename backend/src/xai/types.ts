/**
 * Explainable AI (XAI) Types
 *
 * Provides interpretability and explainability for ML models
 * Supports SHAP, LIME, feature importance, and counterfactual explanations
 */

/**
 * Explanation Method Types
 */
export type ExplanationMethod = 'shap' | 'lime' | 'feature_importance' | 'counterfactual' | 'anchor' | 'integrated_gradients';

/**
 * Model Type
 */
export type ModelType = 'classification' | 'regression' | 'anomaly_detection' | 'clustering';

/**
 * Feature Type
 */
export type FeatureType = 'numerical' | 'categorical' | 'text' | 'image';

/**
 * Feature Definition
 */
export interface Feature {
  name: string;
  type: FeatureType;
  index: number;
  description?: string;
  range?: [number, number];
  categories?: string[];
}

/**
 * Model Prediction
 */
export interface Prediction {
  value: number | string;
  probability?: number;
  confidence?: number;
  classLabel?: string;
  timestamp: number;
}

/**
 * SHAP Value Explanation
 */
export interface SHAPExplanation {
  method: 'shap';
  featureValues: Record<string, number>;
  shapValues: Record<string, number>;
  baseValue: number;
  prediction: number;
  expectedValue: number;
  featureImportance: Array<{
    feature: string;
    value: number;
    contribution: number;
    absoluteContribution: number;
  }>;
}

/**
 * LIME Explanation
 */
export interface LIMEExplanation {
  method: 'lime';
  featureWeights: Record<string, number>;
  intercept: number;
  score: number;
  localModel: string;
  perturbations: number;
  featureImportance: Array<{
    feature: string;
    weight: number;
    impact: 'positive' | 'negative';
  }>;
}

/**
 * Feature Importance Explanation
 */
export interface FeatureImportanceExplanation {
  method: 'feature_importance';
  importances: Record<string, number>;
  normalizedImportances: Record<string, number>;
  topFeatures: Array<{
    feature: string;
    importance: number;
    rank: number;
  }>;
  method_used: 'permutation' | 'gain' | 'split';
}

/**
 * Counterfactual Explanation
 */
export interface CounterfactualExplanation {
  method: 'counterfactual';
  original: Record<string, any>;
  counterfactual: Record<string, any>;
  changes: Array<{
    feature: string;
    from: any;
    to: any;
    distance: number;
  }>;
  totalDistance: number;
  targetClass?: string;
  feasible: boolean;
}

/**
 * Anchor Explanation
 */
export interface AnchorExplanation {
  method: 'anchor';
  rules: string[];
  precision: number;
  coverage: number;
  examples: Array<Record<string, any>>;
}

/**
 * Integrated Gradients Explanation
 */
export interface IntegratedGradientsExplanation {
  method: 'integrated_gradients';
  attributions: Record<string, number>;
  baseline: Record<string, number>;
  steps: number;
  convergenceDelta: number;
}

/**
 * Unified Explanation Type
 */
export type Explanation =
  | SHAPExplanation
  | LIMEExplanation
  | FeatureImportanceExplanation
  | CounterfactualExplanation
  | AnchorExplanation
  | IntegratedGradientsExplanation;

/**
 * Explanation Request
 */
export interface ExplanationRequest {
  method: ExplanationMethod;
  instance: Record<string, any>;
  modelType: ModelType;
  targetClass?: string | number;
  options?: {
    numSamples?: number;
    numFeatures?: number;
    kernelWidth?: number;
    distance?: 'euclidean' | 'manhattan' | 'cosine';
    maxChanges?: number;
  };
}

/**
 * Model Interpretability Metrics
 */
export interface InterpretabilityMetrics {
  modelComplexity: number; // 0-1, lower is more interpretable
  featureCount: number;
  averageDepth?: number; // For tree-based models
  averageExplanationTime: number; // milliseconds
  consistencyScore: number; // 0-1, how consistent explanations are
  fidelityScore: number; // 0-1, how well explanations match model
}

/**
 * Global Model Explanation
 */
export interface GlobalExplanation {
  modelType: ModelType;
  featureImportances: Record<string, number>;
  topFeatures: string[];
  interactions?: Array<{
    feature1: string;
    feature2: string;
    strength: number;
  }>;
  partialDependence?: Record<string, Array<{
    value: number;
    effect: number;
  }>>;
  metrics: InterpretabilityMetrics;
}

/**
 * Explanation History Entry
 */
export interface ExplanationHistoryEntry {
  id: string;
  timestamp: number;
  method: ExplanationMethod;
  instance: Record<string, any>;
  prediction: Prediction;
  explanation: Explanation;
  duration: number;
}

/**
 * XAI Configuration
 */
export interface XAIConfig {
  defaultMethod: ExplanationMethod;
  enableCaching: boolean;
  cacheExpiration: number; // milliseconds
  maxHistorySize: number;
  defaultNumSamples: number;
  defaultNumFeatures: number;
  enableGlobalExplanations: boolean;
  parallelExplanations: boolean;
}
