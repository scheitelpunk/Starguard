import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { writeFileSync, readFileSync } from 'fs';
import path from 'path';
import { Logger } from '../utils/logger.js';

interface AnomalyResult {
  isAnomaly: boolean;
  score: number;
  confidence: number;
  features: number[];
  timestamp: Date;
  explanation?: string;
}

interface TrainingData {
  features: number[][];
  labels?: number[];
  timestamp: Date;
}

interface MLModelConfig {
  modelType: 'isolation_forest' | 'one_class_svm' | 'local_outlier_factor';
  contamination: number;
  nEstimators?: number;
  maxFeatures?: number;
}

export class AnomalyDetection extends EventEmitter {
  private pythonProcess: ChildProcess | null = null;
  private modelPath: string;
  private isModelTrained: boolean = false;
  private requestQueue: Array<{
    data: any;
    resolve: (result: AnomalyResult) => void;
    reject: (error: Error) => void;
  }> = [];
  private config: MLModelConfig;
  private logger: Logger;

  constructor(modelPath: string = './ml/anomaly_model.pkl') {
    super();
    this.logger = new Logger('ml-anomaly-detection');
    this.modelPath = modelPath;
    this.config = {
      modelType: 'isolation_forest',
      contamination: 0.1,
      nEstimators: 100,
      maxFeatures: 1.0
    };
  }

  public async initialize(): Promise<void> {
    this.logger.info('Initializing ML Anomaly Detection');

    try {
      // Start Python ML process
      await this.startPythonProcess();

      // Train initial model with synthetic data
      await this.trainInitialModel();

      this.logger.info('ML Anomaly Detection initialized successfully');
      this.emit('initialized');
    } catch (error) {
      this.logger.error('Failed to initialize ML', error);
      throw error;
    }
  }

  private async startPythonProcess(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.info('Starting Python ML process');

      const pythonScript = path.join(process.cwd(), '../ml/detector.py');
      this.pythonProcess = spawn('python', [pythonScript], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let outputBuffer = '';
      let errorBuffer = '';

      this.pythonProcess.stdout?.on('data', (data) => {
        outputBuffer += data.toString();
        this.processOutputBuffer(outputBuffer);
      });

      this.pythonProcess.stderr?.on('data', (data) => {
        errorBuffer += data.toString();
        this.logger.debug('Python stderr output', { data: data.toString() });
      });

      this.pythonProcess.on('error', (error) => {
        this.logger.error('Python process error', error);
        reject(error);
      });

      this.pythonProcess.on('exit', (code) => {
        if (code !== 0) {
          this.logger.error('Python process exited with error', { code, stderr: errorBuffer });
        }
        this.pythonProcess = null;
      });

      // Wait for Python process to be ready
      setTimeout(() => {
        if (this.pythonProcess && !this.pythonProcess.killed) {
          resolve();
        } else {
          reject(new Error('Python process failed to start'));
        }
      }, 2000);
    });
  }

  private processOutputBuffer(buffer: string): void {
    const lines = buffer.split('\n');
    
    for (const line of lines) {
      if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
        try {
          const result = JSON.parse(line.trim());
          this.handlePythonResponse(result);
        } catch (error) {
          this.logger.warn('Failed to parse Python response', { line, error });
        }
      }
    }
  }

  private handlePythonResponse(response: any): void {
    if (response.type === 'prediction') {
      // Handle anomaly prediction response
      const request = this.requestQueue.shift();
      if (request) {
        const anomalyResult: AnomalyResult = {
          isAnomaly: response.anomaly,
          score: response.score,
          confidence: response.confidence,
          features: response.features,
          timestamp: new Date(),
          explanation: response.explanation
        };
        
        request.resolve(anomalyResult);
        this.emit('anomalyDetected', anomalyResult);
      }
    } else if (response.type === 'training_complete') {
      this.isModelTrained = true;
      this.emit('modelTrained', response);
      this.logger.info('ML model trained successfully', { samples: response.samples, accuracy: response.accuracy });
    } else if (response.type === 'error') {
      const request = this.requestQueue.shift();
      if (request) {
        request.reject(new Error(response.message));
      }
      this.logger.error('Python ML error', { message: response.message });
    }
  }

  private async trainInitialModel(): Promise<void> {
    this.logger.info('Training initial anomaly detection model');

    // Generate synthetic normal traffic patterns for training
    const normalTrafficData = this.generateNormalTrafficData(1000);
    const anomalousTrafficData = this.generateAnomalousTrafficData(100);
    
    const trainingData: TrainingData = {
      features: [...normalTrafficData.features, ...anomalousTrafficData.features],
      labels: [
        ...Array(normalTrafficData.features.length).fill(1), // Normal = 1
        ...Array(anomalousTrafficData.features.length).fill(-1) // Anomaly = -1
      ],
      timestamp: new Date()
    };
    
    await this.sendTrainingData(trainingData);
  }

  private generateNormalTrafficData(count: number): TrainingData {
    const features: number[][] = [];
    
    for (let i = 0; i < count; i++) {
      // Feature vector: [packet_size, connection_duration, packets_per_second, bytes_per_second, port_entropy]
      const feature = [
        Math.random() * 1500 + 64, // Normal packet size (64-1564)
        Math.random() * 300 + 1, // Normal connection duration (1-301 seconds)
        Math.random() * 100 + 1, // Normal packets per second (1-101)
        Math.random() * 1000000 + 1000, // Normal bytes per second (1K-1M)
        Math.random() * 2 + 1 // Normal port entropy (1-3)
      ];
      
      // Add some noise for realism
      for (let j = 0; j < feature.length; j++) {
        feature[j] *= (0.9 + Math.random() * 0.2); // ±10% variation
      }
      
      features.push(feature);
    }
    
    return { features, timestamp: new Date() };
  }

  private generateAnomalousTrafficData(count: number): TrainingData {
    const features: number[][] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate anomalous patterns
      const anomalyType = Math.floor(Math.random() * 4);
      let feature: number[];
      
      switch (anomalyType) {
        case 0: // Large packets (potential data exfiltration)
          feature = [
            Math.random() * 8000 + 2000, // Large packets
            Math.random() * 600 + 300, // Long duration
            Math.random() * 50 + 1,
            Math.random() * 5000000 + 1000000, // High bandwidth
            Math.random() * 2 + 1
          ];
          break;
        
        case 1: // High frequency (potential DoS)
          feature = [
            Math.random() * 100 + 32, // Small packets
            Math.random() * 5 + 1, // Short duration
            Math.random() * 1000 + 500, // Very high frequency
            Math.random() * 10000000 + 5000000, // Very high bandwidth
            Math.random() * 2 + 1
          ];
          break;
        
        case 2: // Port scanning pattern
          feature = [
            Math.random() * 200 + 32, // Small packets
            Math.random() * 10 + 1, // Short duration
            Math.random() * 200 + 100, // High frequency
            Math.random() * 100000 + 10000, // Moderate bandwidth
            Math.random() * 10 + 5 // High port entropy
          ];
          break;
        
        default: // Unusual protocol behavior
          feature = [
            Math.random() * 50 + 10, // Very small packets
            Math.random() * 1800 + 600, // Very long duration
            Math.random() * 5 + 1, // Very low frequency
            Math.random() * 1000 + 100, // Low bandwidth
            Math.random() * 15 + 8 // Very high port entropy
          ];
      }
      
      features.push(feature);
    }
    
    return { features, timestamp: new Date() };
  }

  private async sendTrainingData(data: TrainingData): Promise<void> {
    if (!this.pythonProcess) {
      throw new Error('Python process not initialized');
    }
    
    const command = {
      action: 'train',
      config: this.config,
      data: {
        features: data.features,
        labels: data.labels
      }
    };
    
    this.pythonProcess.stdin?.write(JSON.stringify(command) + '\n');
  }

  public async detectAnomaly(data: {
    packetSize: number;
    connectionDuration: number;
    packetsPerSecond: number;
    bytesPerSecond: number;
    portEntropy: number;
    metadata?: any;
  }): Promise<AnomalyResult> {
    if (!this.isModelTrained) {
      throw new Error('Model not trained yet');
    }
    
    if (!this.pythonProcess) {
      throw new Error('Python process not available');
    }
    
    return new Promise((resolve, reject) => {
      // Add request to queue
      this.requestQueue.push({ data, resolve, reject });
      
      // Prepare feature vector
      const features = [
        data.packetSize,
        data.connectionDuration,
        data.packetsPerSecond,
        data.bytesPerSecond,
        data.portEntropy
      ];
      
      const command = {
        action: 'predict',
        features: features,
        metadata: data.metadata || {}
      };
      
      try {
        this.pythonProcess.stdin?.write(JSON.stringify(command) + '\n');
      } catch (error) {
        // Remove from queue and reject
        const requestIndex = this.requestQueue.findIndex(r => r.data === data);
        if (requestIndex >= 0) {
          this.requestQueue.splice(requestIndex, 1);
        }
        reject(error);
      }
      
      // Set timeout for response
      setTimeout(() => {
        const requestIndex = this.requestQueue.findIndex(r => r.data === data);
        if (requestIndex >= 0) {
          this.requestQueue.splice(requestIndex, 1);
          reject(new Error('ML prediction timeout'));
        }
      }, 10000); // 10 second timeout
    });
  }

  public async analyzeThreatPattern(threatData: {
    sourceIp: string;
    destIp: string;
    port: number;
    protocol: string;
    payload?: string;
  }): Promise<AnomalyResult> {
    // Extract features from threat data
    const features = {
      packetSize: threatData.payload ? threatData.payload.length : 0,
      connectionDuration: 1, // Unknown, use default
      packetsPerSecond: 1, // Single packet analysis
      bytesPerSecond: threatData.payload ? threatData.payload.length : 0,
      portEntropy: this.calculatePortEntropy([threatData.port]),
      metadata: {
        sourceIp: threatData.sourceIp,
        destIp: threatData.destIp,
        protocol: threatData.protocol
      }
    };
    
    return this.detectAnomaly(features);
  }

  private calculatePortEntropy(ports: number[]): number {
    if (ports.length === 0) return 0;
    
    const portCounts = new Map<number, number>();
    for (const port of ports) {
      portCounts.set(port, (portCounts.get(port) || 0) + 1);
    }
    
    let entropy = 0;
    const total = ports.length;
    
    for (const count of portCounts.values()) {
      const probability = count / total;
      entropy -= probability * Math.log2(probability);
    }
    
    return entropy;
  }

  public async retrainModel(newData: TrainingData): Promise<void> {
    this.logger.info('Retraining anomaly detection model');

    if (!this.pythonProcess) {
      throw new Error('Python process not available');
    }
    
    await this.sendTrainingData(newData);
  }

  public getModelInfo(): any {
    return {
      isModelTrained: this.isModelTrained,
      modelPath: this.modelPath,
      config: this.config,
      queueLength: this.requestQueue.length,
      pythonProcessActive: this.pythonProcess !== null && !this.pythonProcess.killed
    };
  }

  public updateConfig(newConfig: Partial<MLModelConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('ML configuration updated', { config: this.config });
  }

  public async exportModel(exportPath: string): Promise<void> {
    if (!this.pythonProcess) {
      throw new Error('Python process not available');
    }
    
    const command = {
      action: 'export',
      path: exportPath
    };
    
    this.pythonProcess.stdin?.write(JSON.stringify(command) + '\n');
  }

  public async loadModel(modelPath: string): Promise<void> {
    if (!this.pythonProcess) {
      throw new Error('Python process not available');
    }
    
    const command = {
      action: 'load',
      path: modelPath
    };
    
    this.pythonProcess.stdin?.write(JSON.stringify(command) + '\n');
    this.isModelTrained = true;
  }

  public getStatistics(): any {
    return {
      modelTrained: this.isModelTrained,
      queueLength: this.requestQueue.length,
      config: this.config,
      processActive: this.pythonProcess !== null,
      modelPath: this.modelPath
    };
  }

  public stop(): void {
    this.logger.info('Stopping ML anomaly detection');

    if (this.pythonProcess && !this.pythonProcess.killed) {
      this.pythonProcess.kill();
    }
    
    // Reject all pending requests
    for (const request of this.requestQueue) {
      request.reject(new Error('ML service stopped'));
    }
    this.requestQueue.length = 0;
    
    this.emit('stopped');
  }
}