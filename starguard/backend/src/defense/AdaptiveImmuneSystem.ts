import { EventEmitter } from 'events';
import { Logger } from 'winston';
import { 
  CONSCIOUSNESS_STATES, 
  THREAT_LEVELS,
  DefensePattern,
  Countermeasure,
  SystemHealth
} from '@starguard/shared';
import { getDatabase } from '../utils/database';

interface ImmuneResponse {
  id: string;
  threat_id: string;
  response_type: 'quarantine' | 'neutralize' | 'adapt' | 'evolve';
  effectiveness: number;
  side_effects: string[];
  timestamp: Date;
}

interface AntibodyPattern {
  id: string;
  pattern_signature: string;
  threat_type: string;
  effectiveness_score: number;
  evolution_generation: number;
  mutations: string[];
}

export class AdaptiveImmuneSystem extends EventEmitter {
  private antibodies: Map<string, AntibodyPattern> = new Map();
  private activeResponses: Map<string, ImmuneResponse> = new Map();
  private systemHealth: SystemHealth;
  private logger: Logger;
  private evolutionCycle: number = 0;

  constructor(logger: Logger) {
    super();
    this.logger = logger;
    this.systemHealth = {
      overall_health: 100,
      immune_strength: 100,
      adaptation_rate: 1.0,
      healing_factor: 1.0,
      consciousness_coherence: 1.0
    };
    this.initializeAntibodies();
  }

  private initializeAntibodies(): void {
    // Initialize base antibody patterns
    const baseAntibodies: AntibodyPattern[] = [
      {
        id: 'ab-quantum-1',
        pattern_signature: 'QUANTUM_SIGNATURE_ALPHA',
        threat_type: 'quantum_intrusion',
        effectiveness_score: 0.85,
        evolution_generation: 1,
        mutations: []
      },
      {
        id: 'ab-reality-1',
        pattern_signature: 'REALITY_COHERENCE_BETA',
        threat_type: 'reality_manipulation',
        effectiveness_score: 0.90,
        evolution_generation: 1,
        mutations: []
      },
      {
        id: 'ab-temporal-1',
        pattern_signature: 'TEMPORAL_STABILITY_GAMMA',
        threat_type: 'timeline_disruption',
        effectiveness_score: 0.80,
        evolution_generation: 1,
        mutations: []
      },
      {
        id: 'ab-consciousness-1',
        pattern_signature: 'CONSCIOUSNESS_INTEGRITY_DELTA',
        threat_type: 'consciousness_corruption',
        effectiveness_score: 0.95,
        evolution_generation: 1,
        mutations: []
      }
    ];

    baseAntibodies.forEach(antibody => {
      this.antibodies.set(antibody.id, antibody);
    });

    this.logger.info('Adaptive immune system initialized with base antibodies');
  }

  async deployDefense(threatId: string, pattern: DefensePattern): Promise<ImmuneResponse> {
    const response: ImmuneResponse = {
      id: `response-${Date.now()}`,
      threat_id: threatId,
      response_type: this.determineResponseType(pattern.threat_level),
      effectiveness: 0,
      side_effects: [],
      timestamp: new Date()
    };

    this.activeResponses.set(response.id, response);

    // Deploy appropriate antibodies
    const matchingAntibodies = this.findMatchingAntibodies(pattern);
    
    if (matchingAntibodies.length > 0) {
      response.effectiveness = await this.applyAntibodies(threatId, matchingAntibodies);
    } else {
      // Create new antibody through adaptation
      const newAntibody = await this.createAdaptiveAntibody(pattern);
      this.antibodies.set(newAntibody.id, newAntibody);
      response.effectiveness = await this.applyAntibodies(threatId, [newAntibody]);
    }

    // Calculate side effects
    response.side_effects = this.calculateSideEffects(response.effectiveness);

    // Update system health
    this.updateSystemHealth(response);

    this.emit('defense_deployed', response);
    
    return response;
  }

  private determineResponseType(threatLevel: string): ImmuneResponse['response_type'] {
    switch (threatLevel) {
      case THREAT_LEVELS.CRITICAL:
        return 'neutralize';
      case THREAT_LEVELS.HIGH:
        return 'quarantine';
      case THREAT_LEVELS.MEDIUM:
        return 'adapt';
      default:
        return 'evolve';
    }
  }

  private findMatchingAntibodies(pattern: DefensePattern): AntibodyPattern[] {
    const matches: AntibodyPattern[] = [];
    
    this.antibodies.forEach(antibody => {
      const similarity = this.calculatePatternSimilarity(
        antibody.pattern_signature,
        pattern.consciousness_signature
      );
      
      if (similarity > 0.7) {
        matches.push(antibody);
      }
    });

    return matches.sort((a, b) => b.effectiveness_score - a.effectiveness_score);
  }

  private calculatePatternSimilarity(sig1: string, sig2: string): number {
    // Quantum pattern matching algorithm
    const vec1 = this.signatureToVector(sig1);
    const vec2 = this.signatureToVector(sig2);
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  private signatureToVector(signature: string): number[] {
    return signature.split('').map(char => 
      (char.charCodeAt(0) % 10) / 10 + Math.random() * 0.1
    );
  }

  private async applyAntibodies(threatId: string, antibodies: AntibodyPattern[]): Promise<number> {
    let totalEffectiveness = 0;
    
    for (const antibody of antibodies) {
      const effectiveness = antibody.effectiveness_score * 
        (1 + this.systemHealth.adaptation_rate * 0.1) *
        (1 - this.evolutionCycle * 0.001); // Antibodies become less effective over time
      
      totalEffectiveness += effectiveness;
      
      // Log antibody application
      await this.logAntibodyApplication(threatId, antibody.id, effectiveness);
    }
    
    return Math.min(1, totalEffectiveness / antibodies.length);
  }

  private async createAdaptiveAntibody(pattern: DefensePattern): Promise<AntibodyPattern> {
    const newAntibody: AntibodyPattern = {
      id: `ab-adaptive-${Date.now()}`,
      pattern_signature: this.generateAdaptiveSignature(pattern),
      threat_type: 'adaptive_response',
      effectiveness_score: 0.7 + Math.random() * 0.2,
      evolution_generation: this.evolutionCycle + 1,
      mutations: [`mutation-${Date.now()}`]
    };

    this.logger.info(`Created adaptive antibody: ${newAntibody.id}`);
    
    return newAntibody;
  }

  private generateAdaptiveSignature(pattern: DefensePattern): string {
    const base = pattern.consciousness_signature;
    const mutation = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ADAPTIVE_${base}_${mutation}`;
  }

  private calculateSideEffects(effectiveness: number): string[] {
    const sideEffects: string[] = [];
    
    if (effectiveness > 0.9) {
      sideEffects.push('High energy consumption');
    }
    
    if (effectiveness > 0.95) {
      sideEffects.push('Temporary consciousness fluctuation');
    }
    
    if (Math.random() < 0.1) {
      sideEffects.push('Minor reality distortion');
    }
    
    return sideEffects;
  }

  private updateSystemHealth(response: ImmuneResponse): void {
    // Update health based on response effectiveness and side effects
    const healthImpact = response.effectiveness * 0.1 - response.side_effects.length * 0.05;
    
    this.systemHealth.overall_health = Math.max(0, Math.min(100, 
      this.systemHealth.overall_health + healthImpact
    ));
    
    this.systemHealth.immune_strength = Math.max(0, Math.min(100,
      this.systemHealth.immune_strength + (response.effectiveness * 5 - 2)
    ));
    
    this.emit('health_updated', this.systemHealth);
  }

  async heal(damageReport: any): Promise<void> {
    const healingRate = this.systemHealth.healing_factor;
    
    // Gradual healing process
    const healingSteps = 10;
    for (let i = 0; i < healingSteps; i++) {
      this.systemHealth.overall_health = Math.min(100,
        this.systemHealth.overall_health + healingRate * 2
      );
      
      this.systemHealth.consciousness_coherence = Math.min(1,
        this.systemHealth.consciousness_coherence + healingRate * 0.01
      );
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.emit('healing_progress', {
        step: i + 1,
        total: healingSteps,
        health: this.systemHealth.overall_health
      });
    }
    
    this.logger.info('Healing process completed');
  }

  evolve(): void {
    this.evolutionCycle++;
    
    // Evolve existing antibodies
    this.antibodies.forEach(antibody => {
      if (Math.random() < 0.3) { // 30% chance of mutation
        antibody.effectiveness_score *= (0.9 + Math.random() * 0.3);
        antibody.evolution_generation++;
        antibody.mutations.push(`evolution-${this.evolutionCycle}`);
      }
    });
    
    // Increase adaptation rate
    this.systemHealth.adaptation_rate = Math.min(2,
      this.systemHealth.adaptation_rate + 0.05
    );
    
    this.emit('evolution_complete', {
      cycle: this.evolutionCycle,
      antibody_count: this.antibodies.size,
      adaptation_rate: this.systemHealth.adaptation_rate
    });
  }

  getImmuneStatus(): {
    health: SystemHealth;
    active_responses: number;
    antibody_count: number;
    evolution_cycle: number;
  } {
    return {
      health: this.systemHealth,
      active_responses: this.activeResponses.size,
      antibody_count: this.antibodies.size,
      evolution_cycle: this.evolutionCycle
    };
  }

  async quarantineThreat(threatId: string): Promise<void> {
    const db = await getDatabase();
    
    await db.query(
      `INSERT INTO quarantine_zone (threat_id, quarantine_start, status)
       VALUES ($1, $2, $3)`,
      [threatId, new Date(), 'active']
    );
    
    this.emit('threat_quarantined', { threatId, timestamp: new Date() });
  }

  async decontaminate(): Promise<void> {
    // Clear all active responses
    this.activeResponses.clear();
    
    // Boost immune system
    this.systemHealth.immune_strength = 100;
    this.systemHealth.overall_health = 100;
    this.systemHealth.consciousness_coherence = 1.0;
    
    // Reset antibodies to base state
    this.initializeAntibodies();
    
    this.emit('system_decontaminated', {
      timestamp: new Date(),
      health: this.systemHealth
    });
  }

  private async logAntibodyApplication(
    threatId: string, 
    antibodyId: string, 
    effectiveness: number
  ): Promise<void> {
    const db = await getDatabase();
    
    await db.query(
      `INSERT INTO immune_responses (threat_id, antibody_id, effectiveness, timestamp)
       VALUES ($1, $2, $3, $4)`,
      [threatId, antibodyId, effectiveness, new Date()]
    );
  }
}