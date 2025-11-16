/**
 * Federated Learning Engine
 * Privacy-preserving distributed machine learning for collaborative threat intelligence
 */

import { EventEmitter } from 'events';
import { Logger } from '../utils/logger.js';
import type {
  FederatedNode,
  ModelUpdate,
  Tensor,
  FederatedTrainingRound,
  GlobalModel,
  FederatedConfig,
  DifferentialPrivacyConfig,
  ByzantineDetectionResult,
  ThreatPattern
} from './types.js';

export class FederatedLearningEngine extends EventEmitter {
  private logger: Logger;
  private nodes: Map<string, FederatedNode>;
  private globalModel: GlobalModel | null;
  private currentRound: FederatedTrainingRound | null;
  private roundHistory: FederatedTrainingRound[];
  private config: FederatedConfig;

  constructor(config?: Partial<FederatedConfig>) {
    super();
    this.logger = new Logger('federated-learning');
    this.nodes = new Map();
    this.globalModel = null;
    this.currentRound = null;
    this.roundHistory = [];

    // Default configuration
    this.config = {
      minNodesPerRound: 3,
      maxNodesPerRound: 100,
      roundTimeout: 300000, // 5 minutes
      convergenceThreshold: 0.001,
      maxRounds: 100,
      aggregationStrategy: 'federated_averaging',
      differentialPrivacy: {
        enabled: true,
        epsilon: 1.0, // Privacy budget
        delta: 1e-5,
        clipNorm: 1.0,
        noiseMultiplier: 1.1
      },
      byzantineDefense: true,
      ...config
    };

    this.initializeGlobalModel();
  }

  /**
   * Initialize the global model with random weights
   */
  private initializeGlobalModel(): void {
    const modelShape = [128, 64, 32, 2]; // Example: 4-layer network
    const totalWeights = modelShape.reduce((a, b, i) =>
      i < modelShape.length - 1 ? a + modelShape[i] * modelShape[i + 1] : a, 0
    );

    const weights: Tensor = {
      shape: modelShape,
      data: new Float32Array(totalWeights).map(() => (Math.random() - 0.5) * 0.1),
      dtype: 'float32'
    };

    this.globalModel = {
      version: 1,
      weights,
      metadata: {
        trainedOn: 0,
        createdAt: Date.now(),
        contributors: []
      },
      checksum: this.calculateChecksum(weights)
    };

    this.logger.info('Global model initialized', {
      version: this.globalModel.version,
      totalWeights
    });
  }

  /**
   * Register a new federated node
   */
  registerNode(node: Omit<FederatedNode, 'status' | 'lastSeen' | 'modelVersion' | 'reputation'>): void {
    const federatedNode: FederatedNode = {
      ...node,
      status: 'active',
      lastSeen: Date.now(),
      modelVersion: this.globalModel?.version || 0,
      reputation: 1.0 // Start with full reputation
    };

    this.nodes.set(node.id, federatedNode);
    this.emit('node:registered', federatedNode);

    this.logger.info('Node registered', {
      nodeId: node.id,
      name: node.name,
      totalNodes: this.nodes.size
    });
  }

  /**
   * Start a new training round
   */
  async startTrainingRound(): Promise<FederatedTrainingRound> {
    if (this.currentRound && this.currentRound.status === 'training') {
      throw new Error('Training round already in progress');
    }

    // Select participating nodes
    const activeNodes = Array.from(this.nodes.values())
      .filter(n => n.status === 'active' && n.reputation > 0.5)
      .sort((a, b) => b.reputation - a.reputation);

    if (activeNodes.length < this.config.minNodesPerRound) {
      throw new Error(`Insufficient nodes. Need ${this.config.minNodesPerRound}, have ${activeNodes.length}`);
    }

    const selectedNodes = activeNodes.slice(0, this.config.maxNodesPerRound);

    this.currentRound = {
      id: `round-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      roundNumber: this.roundHistory.length + 1,
      startTime: Date.now(),
      status: 'training',
      participatingNodes: selectedNodes.map(n => n.id),
      receivedUpdates: []
    };

    this.roundHistory.push(this.currentRound);
    this.emit('round:started', this.currentRound);

    this.logger.info('Training round started', {
      roundId: this.currentRound.id,
      roundNumber: this.currentRound.roundNumber,
      participants: selectedNodes.length
    });

    // Distribute current global model to participants
    await this.distributeGlobalModel(selectedNodes);

    // Set timeout for round
    setTimeout(() => {
      if (this.currentRound && this.currentRound.status === 'training') {
        this.logger.warn('Training round timed out', { roundId: this.currentRound.id });
        this.finalizeRound();
      }
    }, this.config.roundTimeout);

    return this.currentRound;
  }

  /**
   * Distribute global model to participating nodes
   */
  private async distributeGlobalModel(nodes: FederatedNode[]): Promise<void> {
    if (!this.globalModel) {
      throw new Error('No global model available');
    }

    for (const node of nodes) {
      try {
        // In production, this would make HTTP request to node endpoint
        // For now, we simulate distribution
        this.logger.debug('Distributing model to node', {
          nodeId: node.id,
          modelVersion: this.globalModel.version
        });

        node.status = 'training';
        node.modelVersion = this.globalModel.version;
        this.nodes.set(node.id, node);

      } catch (error) {
        this.logger.error('Failed to distribute model to node', {
          nodeId: node.id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  /**
   * Receive model update from a node
   */
  async receiveModelUpdate(update: ModelUpdate): Promise<void> {
    if (!this.currentRound || this.currentRound.status !== 'training') {
      throw new Error('No active training round');
    }

    if (!this.currentRound.participatingNodes.includes(update.nodeId)) {
      throw new Error('Node not participating in this round');
    }

    // Verify signature (in production, use actual crypto)
    if (!this.verifyUpdateSignature(update)) {
      throw new Error('Invalid update signature');
    }

    // Byzantine detection
    if (this.config.byzantineDefense) {
      const byzantineResult = this.detectByzantine(update);
      if (byzantineResult.isMalicious) {
        this.logger.warn('Byzantine update detected', {
          nodeId: update.nodeId,
          reason: byzantineResult.reason,
          confidence: byzantineResult.confidence
        });

        // Penalize malicious node
        const node = this.nodes.get(update.nodeId);
        if (node) {
          node.reputation = Math.max(0, node.reputation - 0.2);
          this.nodes.set(update.nodeId, node);
        }

        return; // Reject update
      }
    }

    // Add differential privacy noise if enabled
    if (this.config.differentialPrivacy.enabled) {
      update = this.addDifferentialPrivacy(update);
    }

    // Store update
    this.currentRound.receivedUpdates.push(update);
    this.emit('update:received', update);

    this.logger.info('Model update received', {
      roundId: this.currentRound.id,
      nodeId: update.nodeId,
      sampleCount: update.sampleCount,
      trainingLoss: update.trainingLoss,
      totalUpdates: this.currentRound.receivedUpdates.length
    });

    // Update node status
    const node = this.nodes.get(update.nodeId);
    if (node) {
      node.status = 'updating';
      node.lastSeen = Date.now();
      node.totalSamples += update.sampleCount;
      this.nodes.set(update.nodeId, node);
    }

    // Check if we can finalize the round
    if (this.currentRound.receivedUpdates.length >= this.config.minNodesPerRound) {
      await this.finalizeRound();
    }
  }

  /**
   * Finalize training round and aggregate updates
   */
  private async finalizeRound(): Promise<void> {
    if (!this.currentRound) {
      return;
    }

    this.currentRound.status = 'aggregating';
    this.logger.info('Finalizing training round', {
      roundId: this.currentRound.id,
      updates: this.currentRound.receivedUpdates.length
    });

    try {
      // Aggregate model updates
      const aggregatedModel = await this.aggregateModelUpdates(this.currentRound.receivedUpdates);

      this.currentRound.aggregatedModel = aggregatedModel;
      this.currentRound.endTime = Date.now();
      this.currentRound.status = 'completed';

      // Update global model
      this.globalModel = aggregatedModel;

      // Calculate convergence metric
      const convergence = this.calculateConvergence(this.currentRound.receivedUpdates);
      this.currentRound.convergenceMetric = convergence;

      this.emit('round:completed', this.currentRound);

      this.logger.info('Training round completed', {
        roundId: this.currentRound.id,
        modelVersion: aggregatedModel.version,
        convergence,
        duration: this.currentRound.endTime - this.currentRound.startTime
      });

      // Reset participating nodes status
      for (const nodeId of this.currentRound.participatingNodes) {
        const node = this.nodes.get(nodeId);
        if (node) {
          node.status = 'active';
          // Reward participating nodes
          node.reputation = Math.min(1.0, node.reputation + 0.01);
          this.nodes.set(nodeId, node);
        }
      }

      this.currentRound = null;

    } catch (error) {
      this.currentRound.status = 'failed';
      this.currentRound.endTime = Date.now();

      this.logger.error('Training round failed', {
        roundId: this.currentRound.id,
        error: error instanceof Error ? error.message : String(error)
      });

      this.emit('round:failed', this.currentRound);
      this.currentRound = null;
    }
  }

  /**
   * Aggregate model updates using configured strategy
   */
  private async aggregateModelUpdates(updates: ModelUpdate[]): Promise<GlobalModel> {
    if (updates.length === 0) {
      throw new Error('No updates to aggregate');
    }

    this.logger.info('Aggregating model updates', {
      strategy: this.config.aggregationStrategy,
      updates: updates.length
    });

    let aggregatedWeights: Tensor;

    switch (this.config.aggregationStrategy) {
      case 'federated_averaging':
        aggregatedWeights = this.federatedAveraging(updates);
        break;
      case 'weighted_average':
        aggregatedWeights = this.weightedAverage(updates);
        break;
      case 'median':
        aggregatedWeights = this.medianAggregation(updates);
        break;
      case 'trimmed_mean':
        aggregatedWeights = this.trimmedMean(updates);
        break;
      default:
        aggregatedWeights = this.federatedAveraging(updates);
    }

    const totalSamples = updates.reduce((sum, u) => sum + u.sampleCount, 0);
    const contributors = updates.map(u => u.nodeId);

    const newModel: GlobalModel = {
      version: (this.globalModel?.version || 0) + 1,
      weights: aggregatedWeights,
      metadata: {
        trainedOn: (this.globalModel?.metadata.trainedOn || 0) + totalSamples,
        createdAt: Date.now(),
        contributors
      },
      checksum: this.calculateChecksum(aggregatedWeights)
    };

    return newModel;
  }

  /**
   * Federated Averaging (FedAvg) - Standard FL aggregation
   */
  private federatedAveraging(updates: ModelUpdate[]): Tensor {
    const totalSamples = updates.reduce((sum, u) => sum + u.sampleCount, 0);

    // Weighted average based on number of samples
    const firstUpdate = updates[0];
    const aggregated = new Float32Array(firstUpdate.weights.data.length);

    for (const update of updates) {
      const weight = update.sampleCount / totalSamples;
      for (let i = 0; i < aggregated.length; i++) {
        aggregated[i] += update.weights.data[i] * weight;
      }
    }

    return {
      shape: firstUpdate.weights.shape,
      data: aggregated,
      dtype: 'float32'
    };
  }

  /**
   * Weighted average based on node reputation
   */
  private weightedAverage(updates: ModelUpdate[]): Tensor {
    const weights = updates.map(u => {
      const node = this.nodes.get(u.nodeId);
      return node?.reputation || 0.5;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);

    const firstUpdate = updates[0];
    const aggregated = new Float32Array(firstUpdate.weights.data.length);

    for (let i = 0; i < updates.length; i++) {
      const weight = weights[i] / totalWeight;
      for (let j = 0; j < aggregated.length; j++) {
        aggregated[j] += updates[i].weights.data[j] * weight;
      }
    }

    return {
      shape: firstUpdate.weights.shape,
      data: aggregated,
      dtype: 'float32'
    };
  }

  /**
   * Median aggregation - robust to outliers
   */
  private medianAggregation(updates: ModelUpdate[]): Tensor {
    const firstUpdate = updates[0];
    const aggregated = new Float32Array(firstUpdate.weights.data.length);

    for (let i = 0; i < aggregated.length; i++) {
      const values = updates.map(u => u.weights.data[i]).sort((a, b) => a - b);
      aggregated[i] = values[Math.floor(values.length / 2)];
    }

    return {
      shape: firstUpdate.weights.shape,
      data: aggregated,
      dtype: 'float32'
    };
  }

  /**
   * Trimmed mean - remove outliers then average
   */
  private trimmedMean(updates: ModelUpdate[], trimPercent: number = 0.1): Tensor {
    const firstUpdate = updates[0];
    const aggregated = new Float32Array(firstUpdate.weights.data.length);
    const trimCount = Math.floor(updates.length * trimPercent);

    for (let i = 0; i < aggregated.length; i++) {
      const values = updates.map(u => u.weights.data[i]).sort((a, b) => a - b);
      const trimmed = values.slice(trimCount, values.length - trimCount);
      aggregated[i] = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
    }

    return {
      shape: firstUpdate.weights.shape,
      data: aggregated,
      dtype: 'float32'
    };
  }

  /**
   * Add differential privacy noise to model update
   */
  private addDifferentialPrivacy(update: ModelUpdate): ModelUpdate {
    const dp = this.config.differentialPrivacy;

    // Clip gradients to bound sensitivity
    const clipped = this.clipGradients(update.weights, dp.clipNorm);

    // Add Gaussian noise
    const noised = this.addGaussianNoise(clipped, dp.epsilon, dp.delta, dp.noiseMultiplier);

    return {
      ...update,
      weights: noised,
      epsilon: dp.epsilon
    };
  }

  /**
   * Clip gradients for differential privacy
   */
  private clipGradients(tensor: Tensor, clipNorm: number): Tensor {
    const norm = this.calculateNorm(tensor);

    if (norm <= clipNorm) {
      return tensor;
    }

    const scale = clipNorm / norm;
    const clipped = new Float32Array(tensor.data.length);

    for (let i = 0; i < tensor.data.length; i++) {
      clipped[i] = tensor.data[i] * scale;
    }

    return {
      ...tensor,
      data: clipped
    };
  }

  /**
   * Add Gaussian noise for differential privacy
   */
  private addGaussianNoise(
    tensor: Tensor,
    epsilon: number,
    delta: number,
    multiplier: number
  ): Tensor {
    const noised = new Float32Array(tensor.data.length);
    const stddev = multiplier / epsilon;

    for (let i = 0; i < tensor.data.length; i++) {
      const noise = this.gaussianRandom() * stddev;
      noised[i] = tensor.data[i] + noise;
    }

    return {
      ...tensor,
      data: noised
    };
  }

  /**
   * Gaussian random number generator (Box-Muller transform)
   */
  private gaussianRandom(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  /**
   * Detect Byzantine (malicious) model updates
   */
  private detectByzantine(update: ModelUpdate): ByzantineDetectionResult {
    const anomalyScores: number[] = [];

    // 1. Check training loss outlier
    const avgLoss = this.currentRound!.receivedUpdates.reduce((sum, u) => sum + u.trainingLoss, 0) /
      Math.max(1, this.currentRound!.receivedUpdates.length);

    if (update.trainingLoss > avgLoss * 3 || update.trainingLoss < avgLoss * 0.3) {
      anomalyScores.push(0.5);
    }

    // 2. Check weight magnitude
    const norm = this.calculateNorm(update.weights);
    const avgNorm = this.globalModel ? this.calculateNorm(this.globalModel.weights) : norm;

    if (norm > avgNorm * 10 || norm < avgNorm * 0.1) {
      anomalyScores.push(0.7);
    }

    // 3. Check cosine similarity with global model
    if (this.globalModel) {
      const similarity = this.cosineSimilarity(update.weights, this.globalModel.weights);
      if (similarity < -0.5) {
        anomalyScores.push(0.8);
      }
    }

    const anomalyScore = anomalyScores.reduce((a, b) => a + b, 0) / Math.max(1, anomalyScores.length);
    const isMalicious = anomalyScore > 0.6;

    return {
      isMalicious,
      confidence: anomalyScore,
      reason: isMalicious ? 'Anomalous model update detected' : 'Update appears legitimate',
      anomalyScore
    };
  }

  /**
   * Calculate tensor norm (L2)
   */
  private calculateNorm(tensor: Tensor): number {
    let sum = 0;
    for (let i = 0; i < tensor.data.length; i++) {
      sum += tensor.data[i] * tensor.data[i];
    }
    return Math.sqrt(sum);
  }

  /**
   * Calculate cosine similarity between two tensors
   */
  private cosineSimilarity(t1: Tensor, t2: Tensor): number {
    if (t1.data.length !== t2.data.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < t1.data.length; i++) {
      dotProduct += t1.data[i] * t2.data[i];
      norm1 += t1.data[i] * t1.data[i];
      norm2 += t2.data[i] * t2.data[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Calculate convergence metric
   */
  private calculateConvergence(updates: ModelUpdate[]): number {
    if (updates.length === 0) {
      return 1.0;
    }

    // Average change in loss
    const avgLoss = updates.reduce((sum, u) => sum + u.trainingLoss, 0) / updates.length;

    // Variance in updates
    const variance = updates.reduce((sum, u) => {
      const diff = u.trainingLoss - avgLoss;
      return sum + diff * diff;
    }, 0) / updates.length;

    return Math.sqrt(variance) / avgLoss;
  }

  /**
   * Verify update signature (simplified - in production use actual crypto)
   */
  private verifyUpdateSignature(update: ModelUpdate): boolean {
    // In production, verify cryptographic signature
    // For now, just check if signature exists
    return update.signature.length > 0;
  }

  /**
   * Calculate checksum for model weights
   */
  private calculateChecksum(weights: Tensor): string {
    // Simple checksum (in production use crypto hash)
    let sum = 0;
    for (let i = 0; i < weights.data.length; i++) {
      sum += weights.data[i];
    }
    return sum.toString(36);
  }

  /**
   * Get global model
   */
  getGlobalModel(): GlobalModel | null {
    return this.globalModel;
  }

  /**
   * Get registered nodes
   */
  getNodes(): FederatedNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get training history
   */
  getTrainingHistory(): FederatedTrainingRound[] {
    return this.roundHistory;
  }

  /**
   * Get current round status
   */
  getCurrentRound(): FederatedTrainingRound | null {
    return this.currentRound;
  }
}
