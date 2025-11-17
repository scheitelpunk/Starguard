/**
 * Edge AI Detection Engine
 *
 * Distributed ML model deployment and threat detection at edge devices
 * Manages device fleet, model optimization, and federated threat intelligence
 */

import { EventEmitter } from 'events';
import {
  EdgeDevice,
  EdgeDeviceType,
  EdgeDeviceStatus,
  EdgeDeviceCapabilities,
  EdgeModel,
  OptimizationConfig,
  OptimizedModel,
  OptimizationTechnique,
  AnomalyDetectionConfig,
  AnomalyDetectionMethod,
  DetectedAnomaly,
  ThreatPattern,
  ThreatSeverity,
  FederatedThreatIntel,
  EdgeDetectionEvent,
  ModelDeployment,
  EdgeAIMetrics,
  EdgeAIConfig,
  DeviceHealth,
  EdgeTrainingData,
  EdgeSyncStatus
} from './types';

/**
 * Edge AI Engine for distributed threat detection
 */
export class EdgeAIEngine extends EventEmitter {
  private devices: Map<string, EdgeDevice> = new Map();
  private models: Map<string, EdgeModel> = new Map();
  private deployments: Map<string, ModelDeployment> = new Map();
  private anomalies: Map<string, DetectedAnomaly> = new Map();
  private threatPatterns: Map<string, ThreatPattern> = new Map();
  private federatedIntel: Map<string, FederatedThreatIntel> = new Map();
  private events: EdgeDetectionEvent[] = [];
  private config: EdgeAIConfig;
  private heartbeatTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config?: Partial<EdgeAIConfig>) {
    super();
    this.config = {
      maxDevices: 1000,
      maxModelsPerDevice: 10,
      heartbeatInterval: 30000, // 30 seconds
      heartbeatTimeout: 90000, // 90 seconds
      autoOptimization: true,
      federatedLearning: true,
      threatIntelSharing: true,
      modelUpdateStrategy: 'hybrid',
      anomalyDetection: {
        enabled: true,
        defaultMethod: 'isolation_forest',
        defaultThreshold: 0.7
      },
      optimization: {
        enabled: true,
        autoTrigger: true,
        targetSizeReduction: 50 // 50%
      },
      ...config
    };
  }

  /**
   * Register a new edge device
   */
  async registerDevice(device: Omit<EdgeDevice, 'lastHeartbeat' | 'createdAt'>): Promise<EdgeDevice> {
    if (this.devices.size >= this.config.maxDevices) {
      throw new Error(`Maximum device limit reached: ${this.config.maxDevices}`);
    }

    if (this.devices.has(device.id)) {
      throw new Error(`Device already registered: ${device.id}`);
    }

    const fullDevice: EdgeDevice = {
      ...device,
      lastHeartbeat: Date.now(),
      createdAt: Date.now()
    };

    this.devices.set(device.id, fullDevice);
    this.startHeartbeatMonitor(device.id);

    this.emit('device:registered', fullDevice);
    return fullDevice;
  }

  /**
   * Unregister an edge device
   */
  async unregisterDevice(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }

    // Remove all deployments for this device
    for (const [key, deployment] of this.deployments.entries()) {
      if (deployment.deviceId === deviceId) {
        this.deployments.delete(key);
      }
    }

    this.stopHeartbeatMonitor(deviceId);
    this.devices.delete(deviceId);

    this.emit('device:unregistered', { deviceId });
  }

  /**
   * Update device status
   */
  async updateDeviceStatus(deviceId: string, status: EdgeDeviceStatus): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }

    device.status = status;
    device.lastHeartbeat = Date.now();

    this.emit('device:status:changed', { deviceId, status });
  }

  /**
   * Process device heartbeat
   */
  async processHeartbeat(deviceId: string, health?: Partial<DeviceHealth>): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }

    device.lastHeartbeat = Date.now();

    if (device.status === 'offline') {
      device.status = 'online';
      this.emit('device:status:changed', { deviceId, status: 'online' });
    }

    if (health) {
      this.emit('device:health:updated', { deviceId, health });
    }
  }

  /**
   * Start heartbeat monitoring for a device
   */
  private startHeartbeatMonitor(deviceId: string): void {
    const timer = setInterval(() => {
      this.checkDeviceHeartbeat(deviceId);
    }, this.config.heartbeatInterval);

    this.heartbeatTimers.set(deviceId, timer);
  }

  /**
   * Stop heartbeat monitoring for a device
   */
  private stopHeartbeatMonitor(deviceId: string): void {
    const timer = this.heartbeatTimers.get(deviceId);
    if (timer) {
      clearInterval(timer);
      this.heartbeatTimers.delete(deviceId);
    }
  }

  /**
   * Check device heartbeat timeout
   */
  private checkDeviceHeartbeat(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (!device) return;

    const timeSinceHeartbeat = Date.now() - device.lastHeartbeat;
    if (timeSinceHeartbeat > this.config.heartbeatTimeout && device.status !== 'offline') {
      device.status = 'offline';
      this.emit('device:status:changed', { deviceId, status: 'offline' });
      this.emit('device:timeout', { deviceId, timeSinceHeartbeat });
    }
  }

  /**
   * Register a model
   */
  async registerModel(model: EdgeModel): Promise<EdgeModel> {
    if (this.models.has(model.id)) {
      throw new Error(`Model already registered: ${model.id}`);
    }

    this.models.set(model.id, model);
    this.emit('model:registered', model);
    return model;
  }

  /**
   * Optimize model for edge deployment
   */
  async optimizeModel(
    modelId: string,
    config: OptimizationConfig
  ): Promise<OptimizedModel> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    const startTime = Date.now();
    let optimizedSize = model.size;
    let optimizedLatency = model.latency;
    let optimizedAccuracy = model.accuracy;

    // Apply optimization techniques
    for (const technique of config.techniques) {
      switch (technique) {
        case 'quantization':
          if (config.quantization) {
            const reduction = this.applyQuantization(config.quantization.bits);
            optimizedSize *= reduction;
            optimizedLatency *= 0.7; // Quantization speeds up inference
            optimizedAccuracy *= 0.98; // Small accuracy loss
          }
          break;

        case 'pruning':
          if (config.pruning) {
            optimizedSize *= (1 - config.pruning.sparsity);
            optimizedLatency *= (1 - config.pruning.sparsity * 0.5);
            optimizedAccuracy *= (1 - config.pruning.sparsity * 0.1);
          }
          break;

        case 'distillation':
          if (config.distillation) {
            optimizedSize *= 0.5; // Student model is typically 50% smaller
            optimizedLatency *= 0.6;
            optimizedAccuracy *= 0.95; // Some accuracy loss from distillation
          }
          break;

        case 'compression':
          if (config.compression) {
            const compressionRatio = this.getCompressionRatio(config.compression.algorithm);
            optimizedSize *= compressionRatio;
            // Compression doesn't affect runtime latency (decompression is fast)
          }
          break;

        case 'partitioning':
          optimizedSize *= 0.7; // Model partitioning can reduce per-device size
          optimizedLatency *= 1.1; // Slight latency increase due to communication
          break;
      }
    }

    // Ensure minimum accuracy requirement
    if (config.minAccuracy && optimizedAccuracy < config.minAccuracy) {
      throw new Error(`Optimization would reduce accuracy below minimum: ${optimizedAccuracy} < ${config.minAccuracy}`);
    }

    const optimizedModel: EdgeModel = {
      ...model,
      id: `${model.id}_optimized`,
      version: `${model.version}-opt`,
      size: Math.round(optimizedSize),
      latency: Math.round(optimizedLatency),
      accuracy: optimizedAccuracy,
      optimizations: config.techniques,
      updatedAt: Date.now()
    };

    await this.registerModel(optimizedModel);

    const result: OptimizedModel = {
      originalModel: model,
      optimizedModel,
      optimization: {
        techniques: config.techniques,
        sizeReduction: ((model.size - optimizedSize) / model.size) * 100,
        speedup: model.latency / optimizedLatency,
        accuracyLoss: ((model.accuracy - optimizedAccuracy) / model.accuracy) * 100,
        timestamp: Date.now()
      }
    };

    this.emit('model:optimized', result);
    return result;
  }

  /**
   * Apply quantization reduction factor
   */
  private applyQuantization(bits: 8 | 16 | 32): number {
    switch (bits) {
      case 8: return 0.25; // 75% size reduction
      case 16: return 0.5; // 50% size reduction
      case 32: return 1.0; // No reduction (original)
      default: return 1.0;
    }
  }

  /**
   * Get compression ratio for algorithm
   */
  private getCompressionRatio(algorithm: string): number {
    switch (algorithm) {
      case 'gzip': return 0.3; // ~70% reduction
      case 'lz4': return 0.5; // ~50% reduction
      case 'zstd': return 0.25; // ~75% reduction
      default: return 1.0;
    }
  }

  /**
   * Deploy model to edge device
   */
  async deployModel(modelId: string, deviceId: string): Promise<ModelDeployment> {
    const model = this.models.get(modelId);
    const device = this.devices.get(deviceId);

    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }

    if (device.models.length >= this.config.maxModelsPerDevice) {
      throw new Error(`Device has reached maximum model limit: ${this.config.maxModelsPerDevice}`);
    }

    // Check if device has required capabilities
    if (model.requiredCapabilities.memory) {
      if (device.capabilities.memory.available < model.requiredCapabilities.memory.total!) {
        throw new Error(`Insufficient memory on device: ${device.capabilities.memory.available} < ${model.requiredCapabilities.memory.total}`);
      }
    }

    const deploymentKey = `${modelId}:${deviceId}`;
    const deployment: ModelDeployment = {
      modelId,
      deviceId,
      status: 'deploying',
      performance: {
        accuracy: model.accuracy,
        latency: model.latency,
        throughput: 0,
        resourceUsage: {
          cpu: 0,
          memory: 0
        }
      }
    };

    this.deployments.set(deploymentKey, deployment);
    device.models.push(modelId);

    // Simulate deployment delay
    setTimeout(() => {
      deployment.status = 'active';
      deployment.deployedAt = Date.now();
      this.emit('model:deployed', { modelId, deviceId, deployment });
    }, 1000);

    return deployment;
  }

  /**
   * Detect anomalies using configured method
   */
  async detectAnomalies(
    deviceId: string,
    data: Array<Record<string, number>>,
    config?: Partial<AnomalyDetectionConfig>
  ): Promise<DetectedAnomaly[]> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }

    const detectionConfig: AnomalyDetectionConfig = {
      method: config?.method || this.config.anomalyDetection.defaultMethod,
      threshold: config?.threshold || this.config.anomalyDetection.defaultThreshold,
      windowSize: config?.windowSize || 100,
      features: config?.features || Object.keys(data[0] || {}),
      updateInterval: config?.updateInterval || 60000,
      options: config?.options || {}
    };

    const anomalies: DetectedAnomaly[] = [];

    for (const sample of data) {
      const score = await this.calculateAnomalyScore(
        sample,
        detectionConfig.method,
        detectionConfig.options
      );

      if (score > detectionConfig.threshold) {
        const anomaly: DetectedAnomaly = {
          id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          deviceId,
          timestamp: Date.now(),
          method: detectionConfig.method,
          score,
          threshold: detectionConfig.threshold,
          features: sample,
          severity: this.calculateSeverity(score),
          description: `Anomaly detected using ${detectionConfig.method} (score: ${score.toFixed(3)})`
        };

        anomalies.push(anomaly);
        this.anomalies.set(anomaly.id, anomaly);
        this.emit('anomaly:detected', anomaly);

        // Check if this matches known threat patterns
        await this.matchThreatPatterns(anomaly);
      }
    }

    return anomalies;
  }

  /**
   * Calculate anomaly score based on method
   */
  private async calculateAnomalyScore(
    sample: Record<string, number>,
    method: AnomalyDetectionMethod,
    options: any
  ): Promise<number> {
    switch (method) {
      case 'statistical':
        return this.statisticalAnomalyScore(sample);

      case 'isolation_forest':
        return this.isolationForestScore(sample, options.contamination || 0.1);

      case 'autoencoder':
        return this.autoencoderScore(sample, options.layers || [64, 32, 64]);

      case 'one_class_svm':
        return this.oneClassSVMScore(sample, options.nu || 0.1);

      case 'local_outlier_factor':
        return this.localOutlierFactorScore(sample, options.neighbors || 20);

      default:
        return 0.5;
    }
  }

  /**
   * Statistical anomaly detection (Z-score based)
   */
  private statisticalAnomalyScore(sample: Record<string, number>): number {
    const values = Object.values(sample);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );

    const maxZScore = Math.max(...values.map(val => Math.abs((val - mean) / (std || 1))));
    return Math.min(maxZScore / 3, 1); // Normalize to 0-1
  }

  /**
   * Isolation Forest anomaly score
   */
  private isolationForestScore(sample: Record<string, number>, contamination: number): number {
    // Simplified isolation forest: random path length in feature space
    const values = Object.values(sample);
    const pathLength = values.reduce((sum, val) => {
      return sum + Math.log2(Math.abs(val) + 1);
    }, 0) / values.length;

    const normalizedScore = 1 - Math.exp(-pathLength / 10);
    return normalizedScore > (1 - contamination) ? normalizedScore : 0;
  }

  /**
   * Autoencoder reconstruction error score
   */
  private autoencoderScore(sample: Record<string, number>, layers: number[]): number {
    // Simplified autoencoder: reconstruction error based on dimensionality reduction
    const values = Object.values(sample);
    const reconstructionError = values.reduce((sum, val) => {
      const encoded = val / (layers[0] / 10); // Simulate encoding
      const decoded = encoded * (layers[0] / 10); // Simulate decoding
      return sum + Math.abs(val - decoded);
    }, 0) / values.length;

    return Math.min(reconstructionError / 10, 1);
  }

  /**
   * One-Class SVM anomaly score
   */
  private oneClassSVMScore(sample: Record<string, number>, nu: number): number {
    // Simplified SVM: distance from origin in normalized space
    const values = Object.values(sample);
    const distance = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val, 2), 0)
    ) / values.length;

    const normalizedDistance = distance / 100; // Normalize
    return normalizedDistance > nu ? normalizedDistance : 0;
  }

  /**
   * Local Outlier Factor score
   */
  private localOutlierFactorScore(sample: Record<string, number>, neighbors: number): number {
    // Simplified LOF: local density deviation
    const values = Object.values(sample);
    const localDensity = values.reduce((sum, val) => sum + Math.abs(val), 0) / values.length;
    const avgDensity = 50; // Assumed average density

    const lof = localDensity / (avgDensity || 1);
    return Math.min(Math.abs(lof - 1), 1);
  }

  /**
   * Calculate threat severity based on anomaly score
   */
  private calculateSeverity(score: number): ThreatSeverity {
    if (score >= 0.9) return 'critical';
    if (score >= 0.75) return 'high';
    if (score >= 0.6) return 'medium';
    if (score >= 0.4) return 'low';
    return 'info';
  }

  /**
   * Match anomaly against known threat patterns
   */
  private async matchThreatPatterns(anomaly: DetectedAnomaly): Promise<void> {
    for (const pattern of this.threatPatterns.values()) {
      let matches = true;

      for (const indicator of pattern.indicators) {
        const value = anomaly.features[indicator.feature];
        if (value === undefined) {
          matches = false;
          break;
        }

        switch (indicator.operator) {
          case 'gt':
            if (!(value > indicator.value)) matches = false;
            break;
          case 'lt':
            if (!(value < indicator.value)) matches = false;
            break;
          case 'eq':
            if (value !== indicator.value) matches = false;
            break;
          case 'ne':
            if (value === indicator.value) matches = false;
            break;
        }

        if (!matches) break;
      }

      if (matches) {
        pattern.occurrences++;
        pattern.lastSeen = Date.now();
        this.emit('threat:pattern:matched', { anomaly, pattern });

        // Update federated intelligence
        await this.updateFederatedIntel(pattern, anomaly.deviceId);
      }
    }
  }

  /**
   * Register a threat pattern
   */
  async registerThreatPattern(pattern: ThreatPattern): Promise<void> {
    this.threatPatterns.set(pattern.id, pattern);
    this.emit('threat:pattern:registered', pattern);
  }

  /**
   * Update federated threat intelligence
   */
  private async updateFederatedIntel(pattern: ThreatPattern, deviceId: string): Promise<void> {
    let intel = this.federatedIntel.get(pattern.id);

    if (!intel) {
      intel = {
        id: `intel_${pattern.id}`,
        pattern,
        sources: [],
        aggregatedConfidence: pattern.confidence,
        geographicSpread: {
          zones: [],
          deviceCount: 0
        },
        temporalAnalysis: {
          trend: 'stable',
          velocity: 0
        },
        recommendations: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      this.federatedIntel.set(pattern.id, intel);
    }

    // Add source
    intel.sources.push({
      deviceId,
      timestamp: Date.now(),
      confidence: pattern.confidence
    });

    // Update aggregated confidence (weighted average)
    intel.aggregatedConfidence =
      intel.sources.reduce((sum, s) => sum + s.confidence, 0) / intel.sources.length;

    // Update geographic spread
    const device = this.devices.get(deviceId);
    if (device?.location.zone && !intel.geographicSpread.zones.includes(device.location.zone)) {
      intel.geographicSpread.zones.push(device.location.zone);
    }
    intel.geographicSpread.deviceCount = new Set(intel.sources.map(s => s.deviceId)).size;

    // Update temporal analysis
    const recentSources = intel.sources.filter(s => Date.now() - s.timestamp < 3600000); // Last hour
    intel.temporalAnalysis.velocity = recentSources.length;
    intel.temporalAnalysis.trend = this.calculateTrend(intel.sources);

    // Generate recommendations
    intel.recommendations = this.generateRecommendations(intel);

    intel.updatedAt = Date.now();

    this.emit('federated:intel:updated', intel);
  }

  /**
   * Calculate trend from sources
   */
  private calculateTrend(sources: any[]): 'increasing' | 'decreasing' | 'stable' {
    if (sources.length < 10) return 'stable';

    const midpoint = Math.floor(sources.length / 2);
    const firstHalf = sources.slice(0, midpoint).length;
    const secondHalf = sources.slice(midpoint).length;

    const ratio = secondHalf / (firstHalf || 1);
    if (ratio > 1.2) return 'increasing';
    if (ratio < 0.8) return 'decreasing';
    return 'stable';
  }

  /**
   * Generate recommendations based on threat intelligence
   */
  private generateRecommendations(intel: FederatedThreatIntel): string[] {
    const recommendations: string[] = [];

    if (intel.aggregatedConfidence > 0.8) {
      recommendations.push('High confidence threat - immediate investigation recommended');
    }

    if (intel.geographicSpread.deviceCount > 5) {
      recommendations.push('Widespread threat detected - deploy countermeasures across all zones');
    }

    if (intel.temporalAnalysis.trend === 'increasing') {
      recommendations.push('Threat velocity increasing - escalate to SOC team');
    }

    if (intel.pattern.severity === 'critical') {
      recommendations.push('Critical severity - initiate incident response protocol');
    }

    return recommendations;
  }

  /**
   * Get metrics
   */
  getMetrics(): EdgeAIMetrics {
    const activeDevices = Array.from(this.devices.values()).filter(d => d.status === 'online').length;
    const activeDeployments = Array.from(this.deployments.values()).filter(d => d.status === 'active').length;

    const detectionsByType: Record<string, number> = {};
    const detectionsBySeverity: Record<ThreatSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };

    for (const anomaly of this.anomalies.values()) {
      detectionsByType[anomaly.method] = (detectionsByType[anomaly.method] || 0) + 1;
      detectionsBySeverity[anomaly.severity]++;
    }

    const deploymentArray = Array.from(this.deployments.values()).filter(d => d.status === 'active');
    const avgLatency = deploymentArray.reduce((sum, d) => sum + d.performance.latency, 0) / (deploymentArray.length || 1);
    const avgThroughput = deploymentArray.reduce((sum, d) => sum + d.performance.throughput, 0) / (deploymentArray.length || 1);
    const avgAccuracy = deploymentArray.reduce((sum, d) => sum + d.performance.accuracy, 0) / (deploymentArray.length || 1);

    return {
      totalDevices: this.devices.size,
      activeDevices,
      totalModels: this.models.size,
      activeDeployments,
      detections: {
        total: this.anomalies.size,
        byType: detectionsByType,
        bySeverity: detectionsBySeverity
      },
      performance: {
        averageLatency: avgLatency,
        averageThroughput: avgThroughput,
        averageAccuracy: avgAccuracy
      },
      network: {
        totalBandwidth: 0,
        bandwidthUsed: 0,
        averageLatency: 0
      },
      timestamp: Date.now()
    };
  }

  /**
   * Get configuration
   */
  getConfig(): EdgeAIConfig {
    return { ...this.config };
  }

  /**
   * Get all devices
   */
  getDevices(): EdgeDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get device by ID
   */
  getDevice(deviceId: string): EdgeDevice | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * Get all models
   */
  getModels(): EdgeModel[] {
    return Array.from(this.models.values());
  }

  /**
   * Get model by ID
   */
  getModel(modelId: string): EdgeModel | undefined {
    return this.models.get(modelId);
  }

  /**
   * Get all deployments
   */
  getDeployments(): ModelDeployment[] {
    return Array.from(this.deployments.values());
  }

  /**
   * Get anomalies
   */
  getAnomalies(filter?: { deviceId?: string; severity?: ThreatSeverity }): DetectedAnomaly[] {
    let anomalies = Array.from(this.anomalies.values());

    if (filter?.deviceId) {
      anomalies = anomalies.filter(a => a.deviceId === filter.deviceId);
    }

    if (filter?.severity) {
      anomalies = anomalies.filter(a => a.severity === filter.severity);
    }

    return anomalies;
  }

  /**
   * Get federated threat intelligence
   */
  getFederatedIntel(): FederatedThreatIntel[] {
    return Array.from(this.federatedIntel.values());
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Stop all heartbeat monitors
    for (const timer of this.heartbeatTimers.values()) {
      clearInterval(timer);
    }
    this.heartbeatTimers.clear();

    // Clear all data
    this.devices.clear();
    this.models.clear();
    this.deployments.clear();
    this.anomalies.clear();
    this.threatPatterns.clear();
    this.federatedIntel.clear();
    this.events = [];
  }
}
