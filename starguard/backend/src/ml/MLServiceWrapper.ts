import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import { Logger } from 'winston';
import { ThreatAnalysis } from '@starguard/shared';

export interface MLPredictionRequest {
  threat_id: string;
  network_features: Record<string, number>;
  behavioral_features: Record<string, number>;
  temporal_features: Record<string, number>;
  consciousness_coherence: number;
  consciousness_entropy: number;
  field_disturbance: number;
  awareness_level: number;
  quantum_entanglement: number;
  quantum_coherence: number;
  graph_centrality: number;
  graph_clustering: number;
  graph_connectivity: number;
}

export interface MLPredictionResponse {
  threat_id: string;
  predicted_label: number;
  prediction_confidence: number;
  threat_type: string;
  severity: number;
  quantum_signature: string;
  consciousness_analysis: {
    coherence_impact: number;
    field_stability: number;
    awareness_recommendation: string;
  };
}

export class MLServiceWrapper extends EventEmitter {
  private pythonProcess: any;
  private logger: Logger;
  private isReady = false;
  private requestQueue: Map<string, (response: any) => void> = new Map();

  constructor(logger: Logger) {
    super();
    this.logger = logger;
  }

  async initialize(): Promise<void> {
    const pythonPath = process.env.PYTHON_PATH || 'python3';
    const mlModelPath = path.join(__dirname, '../../../ml-models/threat-prediction/model_service.py');

    this.pythonProcess = spawn(pythonPath, [mlModelPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.pythonProcess.stdout.on('data', (data: Buffer) => {
      const messages = data.toString().split('\n').filter(msg => msg.trim());
      
      for (const message of messages) {
        try {
          const response = JSON.parse(message);
          
          if (response.type === 'ready') {
            this.isReady = true;
            this.emit('ready');
            this.logger.info('🧠 ML Service initialized and ready');
          } else if (response.type === 'prediction' && response.request_id) {
            const callback = this.requestQueue.get(response.request_id);
            if (callback) {
              callback(response.data);
              this.requestQueue.delete(response.request_id);
            }
          } else if (response.type === 'error') {
            this.logger.error('ML Service error:', response.error);
          }
        } catch (error) {
          this.logger.error('Failed to parse ML service response:', error);
        }
      }
    });

    this.pythonProcess.stderr.on('data', (data: Buffer) => {
      this.logger.error('ML Service stderr:', data.toString());
    });

    this.pythonProcess.on('close', (code: number) => {
      this.logger.warn(`ML Service process exited with code ${code}`);
      this.isReady = false;
      this.emit('closed', code);
    });

    // Wait for ready signal
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('ML Service initialization timeout'));
      }, 30000);

      this.once('ready', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  async predict(request: MLPredictionRequest): Promise<MLPredictionResponse> {
    if (!this.isReady) {
      throw new Error('ML Service not ready');
    }

    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.requestQueue.delete(requestId);
        reject(new Error('ML prediction timeout'));
      }, 5000);

      this.requestQueue.set(requestId, (response) => {
        clearTimeout(timeout);
        resolve(response);
      });

      const message = JSON.stringify({
        type: 'predict',
        request_id: requestId,
        data: request
      });

      this.pythonProcess.stdin.write(message + '\n');
    });
  }

  async train(trainingData: any[]): Promise<void> {
    if (!this.isReady) {
      throw new Error('ML Service not ready');
    }

    const requestId = `train-${Date.now()}`;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.requestQueue.delete(requestId);
        reject(new Error('ML training timeout'));
      }, 300000); // 5 minutes for training

      this.requestQueue.set(requestId, (response) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error || 'Training failed'));
        }
      });

      const message = JSON.stringify({
        type: 'train',
        request_id: requestId,
        data: trainingData
      });

      this.pythonProcess.stdin.write(message + '\n');
    });
  }

  async getModelStats(): Promise<any> {
    if (!this.isReady) {
      throw new Error('ML Service not ready');
    }

    const requestId = `stats-${Date.now()}`;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.requestQueue.delete(requestId);
        reject(new Error('Stats request timeout'));
      }, 5000);

      this.requestQueue.set(requestId, (response) => {
        clearTimeout(timeout);
        resolve(response);
      });

      const message = JSON.stringify({
        type: 'stats',
        request_id: requestId
      });

      this.pythonProcess.stdin.write(message + '\n');
    });
  }

  shutdown(): void {
    if (this.pythonProcess) {
      this.pythonProcess.kill('SIGTERM');
      this.isReady = false;
    }
  }
}

// Enhanced ML integration for threat prediction
export class MLThreatPredictor {
  private mlService: MLServiceWrapper;
  private logger: Logger;
  private predictionCache: Map<string, MLPredictionResponse> = new Map();
  private cacheTimeout = 60000; // 1 minute

  constructor(mlService: MLServiceWrapper, logger: Logger) {
    this.mlService = mlService;
    this.logger = logger;
  }

  async analyzeThreat(threatData: any): Promise<ThreatAnalysis> {
    const cacheKey = this.generateCacheKey(threatData);
    const cached = this.predictionCache.get(cacheKey);
    
    if (cached && Date.now() - (cached as any).timestamp < this.cacheTimeout) {
      this.logger.debug('Using cached ML prediction');
      return this.convertToThreatAnalysis(cached);
    }

    const mlRequest: MLPredictionRequest = {
      threat_id: threatData.id || `threat-${Date.now()}`,
      network_features: threatData.network_features || {},
      behavioral_features: threatData.behavioral_features || {},
      temporal_features: threatData.temporal_features || {},
      consciousness_coherence: threatData.consciousness_coherence || 0.5,
      consciousness_entropy: threatData.consciousness_entropy || 0.3,
      field_disturbance: threatData.field_disturbance || 0.1,
      awareness_level: threatData.awareness_level || 0.7,
      quantum_entanglement: threatData.quantum_entanglement || 0.4,
      quantum_coherence: threatData.quantum_coherence || 0.6,
      graph_centrality: threatData.graph_centrality || 0.5,
      graph_clustering: threatData.graph_clustering || 0.3,
      graph_connectivity: threatData.graph_connectivity || 0.8
    };

    try {
      const prediction = await this.mlService.predict(mlRequest);
      
      // Cache the prediction
      this.predictionCache.set(cacheKey, {
        ...prediction,
        timestamp: Date.now()
      } as any);

      // Clean old cache entries
      this.cleanCache();

      return this.convertToThreatAnalysis(prediction);
    } catch (error) {
      this.logger.error('ML prediction failed:', error);
      // Fallback to rule-based analysis
      return this.fallbackAnalysis(threatData);
    }
  }

  private convertToThreatAnalysis(prediction: MLPredictionResponse): ThreatAnalysis {
    const threatLevels = ['low', 'medium', 'high', 'critical'];
    const threatLevel = threatLevels[Math.min(3, Math.floor(prediction.severity * 4))];

    return {
      id: prediction.threat_id,
      threat_level: threatLevel as any,
      threat_type: prediction.threat_type,
      confidence: prediction.prediction_confidence,
      consciousness_signature: prediction.quantum_signature,
      probability_wave_collapse: prediction.prediction_confidence * prediction.severity,
      quantum_analysis: {
        entanglement_level: prediction.consciousness_analysis.coherence_impact,
        coherence_factor: prediction.consciousness_analysis.field_stability,
        measurement_uncertainty: 1 - prediction.prediction_confidence
      },
      countermeasures_applied: this.generateCountermeasures(prediction),
      timeline: new Date().toISOString(),
      metadata: {
        ml_model_version: '3.0.0',
        consciousness_analysis: prediction.consciousness_analysis
      }
    };
  }

  private generateCountermeasures(prediction: MLPredictionResponse): string[] {
    const countermeasures: string[] = [];

    if (prediction.severity > 0.7) {
      countermeasures.push('quantum_shield_max', 'consciousness_elevation');
    }
    
    if (prediction.consciousness_analysis.field_stability < 0.5) {
      countermeasures.push('field_stabilization', 'reality_anchor');
    }

    if (prediction.threat_type.includes('quantum')) {
      countermeasures.push('quantum_entanglement_disruption');
    }

    if (prediction.consciousness_analysis.coherence_impact > 0.8) {
      countermeasures.push('coherence_dampening', 'awareness_modulation');
    }

    return countermeasures;
  }

  private fallbackAnalysis(threatData: any): ThreatAnalysis {
    // Simple rule-based fallback
    const severity = (threatData.consciousness_entropy || 0) * 0.5 + 
                    (threatData.field_disturbance || 0) * 0.5;
    
    const threatLevels = ['low', 'medium', 'high', 'critical'];
    const threatLevel = threatLevels[Math.min(3, Math.floor(severity * 4))];

    return {
      id: threatData.id || `threat-${Date.now()}`,
      threat_level: threatLevel as any,
      threat_type: 'unknown',
      confidence: 0.5,
      consciousness_signature: 'fallback-signature',
      probability_wave_collapse: severity,
      quantum_analysis: {
        entanglement_level: 0.5,
        coherence_factor: 0.5,
        measurement_uncertainty: 0.5
      },
      countermeasures_applied: ['basic_shield', 'monitoring'],
      timeline: new Date().toISOString(),
      metadata: {
        ml_model_version: 'fallback',
        fallback_reason: 'ML service unavailable'
      }
    };
  }

  private generateCacheKey(threatData: any): string {
    const relevantFields = [
      threatData.consciousness_coherence,
      threatData.consciousness_entropy,
      threatData.field_disturbance,
      threatData.quantum_entanglement
    ].join('-');
    
    return `threat-${relevantFields}`;
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of this.predictionCache.entries()) {
      if (now - (value as any).timestamp > this.cacheTimeout) {
        this.predictionCache.delete(key);
      }
    }
  }

  async getModelPerformance(): Promise<any> {
    try {
      return await this.mlService.getModelStats();
    } catch (error) {
      this.logger.error('Failed to get model stats:', error);
      return {
        status: 'unavailable',
        error: error.message
      };
    }
  }
}