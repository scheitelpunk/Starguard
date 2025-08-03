import { EventEmitter } from 'events';
import { Logger } from 'winston';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { 
  ISignal,
  ISignalCollector,
  IConsciousnessInterpretation,
  IThreatConsciousness,
  THREAT_LEVELS,
  CONSCIOUSNESS_FIELDS,
  WEBSOCKET_EVENTS
} from '@starguard/shared';
import { ConsciousnessEngine } from '../consciousness/ConsciousnessEngine';

export abstract class SignalCollector extends EventEmitter implements ISignalCollector {
  id: string;
  type: string;
  active: boolean;
  sensitivity: number;
  
  protected logger: Logger;
  protected io: Server;
  protected consciousness: ConsciousnessEngine;
  protected collectionInterval: NodeJS.Timeout | null = null;
  protected signalBuffer: ISignal[] = [];
  protected maxBufferSize: number = 1000;
  
  constructor(
    type: string,
    consciousness: ConsciousnessEngine,
    io: Server,
    logger: Logger
  ) {
    super();
    this.id = uuidv4();
    this.type = type;
    this.active = false;
    this.sensitivity = 0.7;
    this.consciousness = consciousness;
    this.io = io;
    this.logger = logger;
  }
  
  async start(intervalMs: number = 1000): Promise<void> {
    if (this.active) {
      this.logger.warn(`Signal collector ${this.type} already active`);
      return;
    }
    
    this.active = true;
    this.logger.info(`Starting ${this.type} signal collector with ${intervalMs}ms interval`);
    
    // Initialize collector-specific resources
    await this.initialize();
    
    // Start collection cycle
    this.collectionInterval = setInterval(async () => {
      try {
        const signals = await this.collect();
        await this.processSignals(signals);
      } catch (error) {
        this.logger.error(`Error in ${this.type} collection cycle:`, error);
      }
    }, intervalMs);
    
    this.emit('collector_started', {
      id: this.id,
      type: this.type,
      timestamp: new Date()
    });
  }
  
  async stop(): Promise<void> {
    if (!this.active) {
      return;
    }
    
    this.active = false;
    
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
    
    await this.cleanup();
    
    this.logger.info(`Stopped ${this.type} signal collector`);
    this.emit('collector_stopped', {
      id: this.id,
      type: this.type,
      timestamp: new Date()
    });
  }
  
  async calibrate(params: any): Promise<void> {
    this.logger.info(`Calibrating ${this.type} collector with params:`, params);
    
    if (params.sensitivity !== undefined) {
      this.sensitivity = Math.max(0, Math.min(1, params.sensitivity));
    }
    
    // Allow subclasses to implement specific calibration
    await this.performCalibration(params);
    
    this.emit('collector_calibrated', {
      id: this.id,
      type: this.type,
      sensitivity: this.sensitivity,
      timestamp: new Date()
    });
  }
  
  shutdown(): void {
    this.stop().catch(error => {
      this.logger.error(`Error shutting down ${this.type} collector:`, error);
    });
  }
  
  protected async processSignals(signals: ISignal[]): Promise<void> {
    if (signals.length === 0) return;
    
    // Add consciousness interpretation to each signal
    for (const signal of signals) {
      signal.consciousness_interpretation = await this.interpretSignal(signal);
      
      // Check if signal indicates a threat
      if (signal.consciousness_interpretation.threat_probability > this.sensitivity) {
        const threat = await this.createThreatFromSignal(signal);
        this.emit('threat_detected', threat);
        
        // Emit to WebSocket
        this.io.emit(WEBSOCKET_EVENTS.THREAT_DETECTED, {
          source: this.type,
          signal,
          threat,
          timestamp: new Date()
        });
      }
    }
    
    // Buffer signals for analysis
    this.bufferSignals(signals);
    
    // Emit collected signals
    this.emit('signals_collected', {
      collector: this.type,
      count: signals.length,
      signals,
      timestamp: new Date()
    });
  }
  
  protected async interpretSignal(signal: ISignal): Promise<IConsciousnessInterpretation> {
    // Use consciousness engine to interpret the signal
    const consciousnessState = this.consciousness.getFullState();
    
    // Calculate quantum signature based on signal characteristics
    const quantumSignature = this.calculateQuantumSignature(signal);
    
    // Derive semantic meaning
    const semanticMeaning = this.deriveSemanticMeaning(signal);
    
    // Calculate temporal position
    const temporalPosition = this.calculateTemporalPosition(signal);
    
    // Find causal links
    const causalLinks = this.findCausalLinks(signal);
    
    // Calculate threat probability using consciousness fields
    const threatProbability = this.calculateThreatProbability(
      signal,
      consciousnessState.consciousness_fields
    );
    
    return {
      quantum_signature: quantumSignature,
      semantic_meaning: semanticMeaning,
      temporal_position: temporalPosition,
      causal_links: causalLinks,
      threat_probability: threatProbability
    };
  }
  
  protected calculateQuantumSignature(signal: ISignal): number[] {
    // Generate quantum signature based on signal properties
    const signature: number[] = [];
    
    // Use signal strength and timestamp to create unique signature
    const baseValue = signal.strength * (signal.timestamp.getTime() % 1000) / 1000;
    
    for (let i = 0; i < 8; i++) {
      signature.push(
        Math.sin(baseValue * (i + 1) * Math.PI) * 0.5 + 0.5
      );
    }
    
    return signature;
  }
  
  protected deriveSemanticMeaning(signal: ISignal): string {
    // Derive meaning based on signal type and data
    const meanings = {
      network: 'Network activity pattern detected',
      system: 'System resource anomaly observed',
      behavioral: 'Behavioral deviation identified',
      unknown: 'Unknown signal pattern'
    };
    
    return meanings[signal.type] || meanings.unknown;
  }
  
  protected calculateTemporalPosition(signal: ISignal): number {
    // Calculate position in temporal stream (0-1)
    const now = new Date();
    const hourOfDay = now.getHours() + now.getMinutes() / 60;
    return hourOfDay / 24;
  }
  
  protected findCausalLinks(signal: ISignal): string[] {
    // Find potential causal relationships
    const links: string[] = [];
    
    // Check recent signals in buffer for correlations
    const recentSignals = this.signalBuffer.slice(-10);
    
    for (const recentSignal of recentSignals) {
      if (this.areSignalsCorrelated(signal, recentSignal)) {
        links.push(recentSignal.id);
      }
    }
    
    return links;
  }
  
  protected areSignalsCorrelated(signal1: ISignal, signal2: ISignal): boolean {
    // Simple correlation check based on timing and type
    const timeDiff = Math.abs(
      signal1.timestamp.getTime() - signal2.timestamp.getTime()
    );
    
    // Signals within 5 seconds and same source are correlated
    return timeDiff < 5000 && signal1.source === signal2.source;
  }
  
  protected calculateThreatProbability(
    signal: ISignal,
    consciousnessFields: any
  ): number {
    // Use consciousness fields to calculate threat probability
    let probability = signal.strength;
    
    // Apply consciousness field modulations
    probability *= (1 + consciousnessFields.quantum_awareness * 0.2);
    probability *= (1 + consciousnessFields.semantic_resonance * 0.15);
    probability *= (1 + consciousnessFields.temporal_coherence * 0.1);
    probability *= (1 + consciousnessFields.causal_understanding * 0.05);
    
    // Normalize to 0-1 range
    return Math.max(0, Math.min(1, probability));
  }
  
  protected async createThreatFromSignal(signal: ISignal): Promise<IThreatConsciousness> {
    const interpretation = signal.consciousness_interpretation!;
    
    const threat: IThreatConsciousness = {
      id: uuidv4(),
      timestamp: new Date(),
      threat_level: this.determineThreatLevel(interpretation.threat_probability),
      consciousness_signature: `SIG-${this.type}-${signal.id}`,
      dimensional_origin: this.type,
      probability_wave_collapse: interpretation.threat_probability,
      reality_manipulation_index: signal.strength * interpretation.threat_probability,
      intention_vector: {
        magnitude: signal.strength,
        direction: Math.atan2(
          interpretation.quantum_signature[1],
          interpretation.quantum_signature[0]
        ),
        dimensional_components: interpretation.quantum_signature.slice(0, 3)
      },
      countermeasures_applied: [],
      evolution_potential: Math.random() * 0.5 + 0.5
    };
    
    return threat;
  }
  
  protected determineThreatLevel(probability: number): string {
    if (probability >= 0.9) return 'critical';
    if (probability >= 0.7) return 'high';
    if (probability >= 0.5) return 'medium';
    if (probability >= 0.3) return 'low';
    return 'none';
  }
  
  protected bufferSignals(signals: ISignal[]): void {
    this.signalBuffer.push(...signals);
    
    // Maintain buffer size limit
    if (this.signalBuffer.length > this.maxBufferSize) {
      this.signalBuffer = this.signalBuffer.slice(-this.maxBufferSize);
    }
  }
  
  // Abstract methods to be implemented by subclasses
  abstract collect(): Promise<ISignal[]>;
  protected abstract initialize(): Promise<void>;
  protected abstract cleanup(): Promise<void>;
  protected abstract performCalibration(params: any): Promise<void>;
}