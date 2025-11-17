/**
 * Edge AI Detection Types
 *
 * Distributed ML model deployment and threat detection at edge devices
 * Supports model optimization, federated learning, and real-time anomaly detection
 */

/**
 * Edge Device Types
 */
export type EdgeDeviceType = 'gateway' | 'sensor' | 'camera' | 'iot' | 'mobile' | 'embedded';

/**
 * Edge Device Status
 */
export type EdgeDeviceStatus = 'online' | 'offline' | 'degraded' | 'maintenance' | 'quarantined';

/**
 * Model Optimization Technique
 */
export type OptimizationTechnique = 'quantization' | 'pruning' | 'distillation' | 'compression' | 'partitioning';

/**
 * Anomaly Detection Method
 */
export type AnomalyDetectionMethod = 'statistical' | 'isolation_forest' | 'autoencoder' | 'one_class_svm' | 'local_outlier_factor';

/**
 * Threat Severity Level
 */
export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Edge Device Capabilities
 */
export interface EdgeDeviceCapabilities {
  cpu: {
    cores: number;
    frequency: number; // MHz
    architecture: string; // arm, x86, etc.
  };
  memory: {
    total: number; // MB
    available: number; // MB
  };
  storage: {
    total: number; // MB
    available: number; // MB
  };
  network: {
    bandwidth: number; // Mbps
    latency: number; // ms
    type: 'wifi' | 'cellular' | 'ethernet' | 'lora' | 'zigbee';
  };
  gpu?: {
    available: boolean;
    memory: number; // MB
    type: string;
  };
  accelerators?: {
    tpu?: boolean;
    npu?: boolean;
    fpga?: boolean;
  };
}

/**
 * Edge Device Configuration
 */
export interface EdgeDevice {
  id: string;
  name: string;
  type: EdgeDeviceType;
  status: EdgeDeviceStatus;
  location: {
    latitude?: number;
    longitude?: number;
    zone?: string;
    building?: string;
  };
  capabilities: EdgeDeviceCapabilities;
  models: string[]; // IDs of deployed models
  lastHeartbeat: number;
  createdAt: number;
  metadata?: Record<string, any>;
}

/**
 * ML Model for Edge Deployment
 */
export interface EdgeModel {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'regression' | 'anomaly_detection' | 'object_detection';
  framework: 'tensorflow' | 'pytorch' | 'onnx' | 'tflite' | 'coreml';
  size: number; // bytes
  accuracy: number; // 0-1
  latency: number; // ms
  requiredCapabilities: Partial<EdgeDeviceCapabilities>;
  optimizations: OptimizationTechnique[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Model Optimization Configuration
 */
export interface OptimizationConfig {
  techniques: OptimizationTechnique[];
  targetSize?: number; // bytes
  targetLatency?: number; // ms
  minAccuracy?: number; // 0-1
  quantization?: {
    bits: 8 | 16 | 32;
    method: 'post_training' | 'quantization_aware';
  };
  pruning?: {
    sparsity: number; // 0-1
    method: 'magnitude' | 'gradient' | 'structured';
  };
  distillation?: {
    temperature: number;
    alpha: number; // weight of distillation loss
  };
  compression?: {
    algorithm: 'gzip' | 'lz4' | 'zstd';
    level: number; // 1-9
  };
}

/**
 * Optimized Model Result
 */
export interface OptimizedModel {
  originalModel: EdgeModel;
  optimizedModel: EdgeModel;
  optimization: {
    techniques: OptimizationTechnique[];
    sizeReduction: number; // percentage
    speedup: number; // multiplier
    accuracyLoss: number; // percentage
    timestamp: number;
  };
}

/**
 * Anomaly Detection Configuration
 */
export interface AnomalyDetectionConfig {
  method: AnomalyDetectionMethod;
  threshold: number; // 0-1
  windowSize: number; // number of samples
  features: string[];
  updateInterval: number; // ms
  options?: {
    contamination?: number; // for Isolation Forest
    nu?: number; // for One-Class SVM
    neighbors?: number; // for LOF
    layers?: number[]; // for Autoencoder
  };
}

/**
 * Detected Anomaly
 */
export interface DetectedAnomaly {
  id: string;
  deviceId: string;
  timestamp: number;
  method: AnomalyDetectionMethod;
  score: number; // anomaly score
  threshold: number;
  features: Record<string, number>;
  severity: ThreatSeverity;
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Threat Pattern
 */
export interface ThreatPattern {
  id: string;
  name: string;
  description: string;
  severity: ThreatSeverity;
  indicators: {
    feature: string;
    operator: 'gt' | 'lt' | 'eq' | 'ne' | 'contains' | 'regex';
    value: any;
  }[];
  confidence: number; // 0-1
  occurrences: number;
  firstSeen: number;
  lastSeen: number;
}

/**
 * Federated Threat Intelligence
 */
export interface FederatedThreatIntel {
  id: string;
  pattern: ThreatPattern;
  sources: {
    deviceId: string;
    timestamp: number;
    confidence: number;
  }[];
  aggregatedConfidence: number; // 0-1
  geographicSpread: {
    zones: string[];
    deviceCount: number;
  };
  temporalAnalysis: {
    trend: 'increasing' | 'decreasing' | 'stable';
    velocity: number; // occurrences per hour
  };
  recommendations: string[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Edge Detection Event
 */
export interface EdgeDetectionEvent {
  id: string;
  type: 'anomaly' | 'threat' | 'pattern' | 'model_update' | 'device_status';
  deviceId: string;
  timestamp: number;
  severity: ThreatSeverity;
  data: DetectedAnomaly | ThreatPattern | any;
  processed: boolean;
  actions: string[];
}

/**
 * Model Deployment Status
 */
export interface ModelDeployment {
  modelId: string;
  deviceId: string;
  status: 'pending' | 'deploying' | 'active' | 'failed' | 'retired';
  deployedAt?: number;
  performance: {
    accuracy: number;
    latency: number; // ms
    throughput: number; // inferences per second
    resourceUsage: {
      cpu: number; // percentage
      memory: number; // MB
      power?: number; // watts
    };
  };
  errors?: string[];
}

/**
 * Edge AI Metrics
 */
export interface EdgeAIMetrics {
  totalDevices: number;
  activeDevices: number;
  totalModels: number;
  activeDeployments: number;
  detections: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<ThreatSeverity, number>;
  };
  performance: {
    averageLatency: number; // ms
    averageThroughput: number; // inferences per second
    averageAccuracy: number; // 0-1
  };
  network: {
    totalBandwidth: number; // Mbps
    bandwidthUsed: number; // Mbps
    averageLatency: number; // ms
  };
  timestamp: number;
}

/**
 * Edge AI Configuration
 */
export interface EdgeAIConfig {
  maxDevices: number;
  maxModelsPerDevice: number;
  heartbeatInterval: number; // ms
  heartbeatTimeout: number; // ms
  autoOptimization: boolean;
  federatedLearning: boolean;
  threatIntelSharing: boolean;
  modelUpdateStrategy: 'push' | 'pull' | 'hybrid';
  anomalyDetection: {
    enabled: boolean;
    defaultMethod: AnomalyDetectionMethod;
    defaultThreshold: number;
  };
  optimization: {
    enabled: boolean;
    autoTrigger: boolean;
    targetSizeReduction: number; // percentage
  };
}

/**
 * Device Health Status
 */
export interface DeviceHealth {
  deviceId: string;
  timestamp: number;
  overall: 'healthy' | 'warning' | 'critical';
  metrics: {
    cpuUsage: number; // percentage
    memoryUsage: number; // percentage
    storageUsage: number; // percentage
    temperature?: number; // celsius
    uptime: number; // seconds
  };
  issues: {
    severity: 'warning' | 'critical';
    message: string;
    timestamp: number;
  }[];
}

/**
 * Model Training Data
 */
export interface EdgeTrainingData {
  deviceId: string;
  modelId: string;
  samples: Array<{
    features: Record<string, number>;
    label?: number | string;
    timestamp: number;
  }>;
  statistics: {
    count: number;
    features: Record<string, {
      mean: number;
      std: number;
      min: number;
      max: number;
    }>;
  };
  collectedAt: number;
}

/**
 * Edge Sync Status
 */
export interface EdgeSyncStatus {
  deviceId: string;
  lastSync: number;
  pendingModels: string[];
  pendingUpdates: number;
  syncInProgress: boolean;
  errors: string[];
}
