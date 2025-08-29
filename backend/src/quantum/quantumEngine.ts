import { createHash, randomBytes } from 'crypto';
import { EventEmitter } from 'events';

interface QuantumState {
  amplitude: number;
  phase: number;
  entanglement: number;
}

interface QuantumField {
  width: number;
  height: number;
  states: QuantumState[][];
  coherenceLevel: number;
  entropy: number;
  lastUpdate: Date;
}

interface QuantumParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  energy: number;
  spin: number;
  color: string;
  threatened: boolean;
}

export class QuantumEngine extends EventEmitter {
  private field: QuantumField;
  private particles: QuantumParticle[] = [];
  private fieldUpdateInterval: NodeJS.Timeout | null = null;
  private readonly FIELD_SIZE = 64; // Optimized for laptop performance
  private readonly MAX_PARTICLES = 100;
  private readonly QUANTUM_CONSTANT = 0.0000001; // Scaled for visualization

  constructor() {
    super();
    this.field = this.initializeQuantumField();
    this.startQuantumEvolution();
  }

  private initializeQuantumField(): QuantumField {
    const states: QuantumState[][] = [];
    
    for (let x = 0; x < this.FIELD_SIZE; x++) {
      states[x] = [];
      for (let y = 0; y < this.FIELD_SIZE; y++) {
        // Initialize quantum states with proper normalization
        const amplitude = Math.random() * 0.1 + 0.05;
        const phase = Math.random() * 2 * Math.PI;
        const entanglement = Math.random() * 0.2;
        
        states[x][y] = {
          amplitude,
          phase,
          entanglement
        };
      }
    }
    
    return {
      width: this.FIELD_SIZE,
      height: this.FIELD_SIZE,
      states,
      coherenceLevel: 0.5,
      entropy: this.calculateFieldEntropy(states),
      lastUpdate: new Date()
    };
  }

  private calculateFieldEntropy(states: QuantumState[][]): number {
    let totalEntropy = 0;
    let count = 0;
    
    for (let x = 0; x < states.length; x++) {
      for (let y = 0; y < states[x].length; y++) {
        const state = states[x][y];
        // Shannon entropy approximation for quantum states
        const probability = state.amplitude * state.amplitude;
        if (probability > 0) {
          totalEntropy += -probability * Math.log2(probability);
        }
        count++;
      }
    }
    
    return totalEntropy / count;
  }

  public generateQuantumEntropy(): Buffer {
    // Multiple entropy sources for true randomness
    const sources = [
      randomBytes(32),
      Buffer.from(Date.now().toString()),
      Buffer.from(process.hrtime.bigint().toString()),
      Buffer.from(Math.random().toString()),
      Buffer.from(this.field.entropy.toString()),
      Buffer.from(this.particles.length.toString())
    ];
    
    const combined = Buffer.concat(sources);
    const hash1 = createHash('sha256').update(combined).digest();
    const hash2 = createHash('sha512').update(hash1).digest();
    
    return hash2;
  }

  private startQuantumEvolution(): void {
    this.fieldUpdateInterval = setInterval(() => {
      this.evolveQuantumField();
      this.updateParticles();
    }, 50); // 20 FPS for smooth visualization
  }

  private evolveQuantumField(): void {
    const newStates: QuantumState[][] = [];
    
    for (let x = 0; x < this.FIELD_SIZE; x++) {
      newStates[x] = [];
      for (let y = 0; y < this.FIELD_SIZE; y++) {
        const currentState = this.field.states[x][y];
        
        // Quantum evolution using Schrödinger-like equation approximation
        const neighbors = this.getNeighborStates(x, y);
        const avgAmplitude = neighbors.reduce((sum, s) => sum + s.amplitude, 0) / neighbors.length;
        const avgPhase = neighbors.reduce((sum, s) => sum + s.phase, 0) / neighbors.length;
        
        // Time evolution
        const timeStep = 0.1;
        const newPhase = (currentState.phase + timeStep) % (2 * Math.PI);
        
        // Wave function evolution with damping for stability
        const dampingFactor = 0.999;
        const diffusionRate = 0.05;
        
        const newAmplitude = (currentState.amplitude * dampingFactor) + 
                           (avgAmplitude - currentState.amplitude) * diffusionRate;
        
        // Entanglement evolution
        const entanglementDecay = 0.98;
        const newEntanglement = currentState.entanglement * entanglementDecay + 
                               Math.random() * 0.001;
        
        newStates[x][y] = {
          amplitude: Math.max(0, Math.min(1, newAmplitude)),
          phase: newPhase,
          entanglement: Math.max(0, Math.min(1, newEntanglement))
        };
      }
    }
    
    this.field.states = newStates;
    this.field.entropy = this.calculateFieldEntropy(newStates);
    this.field.coherenceLevel = this.calculateCoherence();
    this.field.lastUpdate = new Date();
    
    // Emit quantum field update for visualization
    this.emit('fieldUpdate', {
      coherence: this.field.coherenceLevel,
      entropy: this.field.entropy,
      particleCount: this.particles.length
    });
  }

  private getNeighborStates(x: number, y: number): QuantumState[] {
    const neighbors: QuantumState[] = [];
    
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        
        const nx = (x + dx + this.FIELD_SIZE) % this.FIELD_SIZE;
        const ny = (y + dy + this.FIELD_SIZE) % this.FIELD_SIZE;
        
        neighbors.push(this.field.states[nx][ny]);
      }
    }
    
    return neighbors;
  }

  private calculateCoherence(): number {
    let totalCoherence = 0;
    let count = 0;
    
    // Calculate quantum coherence as correlation between adjacent states
    for (let x = 0; x < this.FIELD_SIZE - 1; x++) {
      for (let y = 0; y < this.FIELD_SIZE - 1; y++) {
        const state1 = this.field.states[x][y];
        const state2 = this.field.states[x + 1][y];
        const state3 = this.field.states[x][y + 1];
        
        // Coherence measure based on phase correlation
        const phaseDiff1 = Math.abs(state1.phase - state2.phase);
        const phaseDiff2 = Math.abs(state1.phase - state3.phase);
        
        const coherence = Math.cos(phaseDiff1) * Math.cos(phaseDiff2);
        totalCoherence += coherence;
        count++;
      }
    }
    
    return totalCoherence / count;
  }

  public createQuantumParticle(x: number, y: number, energy: number = 1, threatened: boolean = false): QuantumParticle {
    const entropy = this.generateQuantumEntropy();
    const id = createHash('md5').update(entropy).digest('hex').substring(0, 8);
    
    const particle: QuantumParticle = {
      id,
      x: x || Math.random() * this.FIELD_SIZE,
      y: y || Math.random() * this.FIELD_SIZE,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      energy,
      spin: Math.random() * 2 * Math.PI,
      color: threatened ? '#ff4444' : this.getEnergyColor(energy),
      threatened
    };
    
    if (this.particles.length < this.MAX_PARTICLES) {
      this.particles.push(particle);
    } else {
      // Replace oldest particle
      this.particles.shift();
      this.particles.push(particle);
    }
    
    this.emit('particleCreated', particle);
    return particle;
  }

  private getEnergyColor(energy: number): string {
    // Energy-based color mapping (quantum rainbow)
    const hue = (energy * 360) % 360;
    const saturation = 70 + (energy * 30) % 30;
    const lightness = 50 + (energy * 20) % 30;
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  private updateParticles(): void {
    for (const particle of this.particles) {
      // Quantum walk behavior influenced by field
      const fieldX = Math.floor(particle.x) % this.FIELD_SIZE;
      const fieldY = Math.floor(particle.y) % this.FIELD_SIZE;
      const localState = this.field.states[fieldX][fieldY];
      
      // Particle velocity influenced by quantum field
      const fieldInfluence = localState.amplitude * Math.cos(localState.phase);
      particle.vx += fieldInfluence * 0.1 * (Math.random() - 0.5);
      particle.vy += fieldInfluence * 0.1 * (Math.random() - 0.5);
      
      // Apply velocity damping
      particle.vx *= 0.95;
      particle.vy *= 0.95;
      
      // Update position with boundary conditions
      particle.x = (particle.x + particle.vx + this.FIELD_SIZE) % this.FIELD_SIZE;
      particle.y = (particle.y + particle.vy + this.FIELD_SIZE) % this.FIELD_SIZE;
      
      // Update spin
      particle.spin += 0.1;
      
      // Energy decay for non-threatened particles
      if (!particle.threatened) {
        particle.energy *= 0.999;
        if (particle.energy < 0.1) {
          particle.color = this.getEnergyColor(particle.energy);
        }
      }
    }
    
    // Remove very low energy particles
    this.particles = this.particles.filter(p => p.energy > 0.05);
  }

  public simulateQuantumSuperposition(count: number = 5): QuantumParticle[] {
    const superpositionParticles: QuantumParticle[] = [];
    
    for (let i = 0; i < count; i++) {
      // Create entangled particle pairs
      const x1 = Math.random() * this.FIELD_SIZE;
      const y1 = Math.random() * this.FIELD_SIZE;
      const x2 = (x1 + this.FIELD_SIZE / 2) % this.FIELD_SIZE;
      const y2 = (y1 + this.FIELD_SIZE / 2) % this.FIELD_SIZE;
      
      const energy = 0.5 + Math.random() * 0.5;
      
      const particle1 = this.createQuantumParticle(x1, y1, energy);
      const particle2 = this.createQuantumParticle(x2, y2, energy);
      
      // Mark as entangled
      particle1.id = `entangled-${i}-a`;
      particle2.id = `entangled-${i}-b`;
      
      superpositionParticles.push(particle1, particle2);
    }
    
    return superpositionParticles;
  }

  public injectThreatEnergy(x: number, y: number, severity: number): void {
    // Create threat-influenced quantum disturbance
    const disturbanceRadius = 5;
    
    for (let dx = -disturbanceRadius; dx <= disturbanceRadius; dx++) {
      for (let dy = -disturbanceRadius; dy <= disturbanceRadius; dy++) {
        const targetX = (Math.floor(x) + dx + this.FIELD_SIZE) % this.FIELD_SIZE;
        const targetY = (Math.floor(y) + dy + this.FIELD_SIZE) % this.FIELD_SIZE;
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= disturbanceRadius) {
          const intensity = severity * (1 - distance / disturbanceRadius);
          
          // Disturb quantum field
          this.field.states[targetX][targetY].amplitude += intensity * 0.2;
          this.field.states[targetX][targetY].phase += intensity * 0.5;
          this.field.states[targetX][targetY].entanglement += intensity * 0.1;
          
          // Normalize to prevent overflow
          const state = this.field.states[targetX][targetY];
          state.amplitude = Math.min(1, state.amplitude);
          state.entanglement = Math.min(1, state.entanglement);
        }
      }
    }
    
    // Create threat particles
    const threatParticles = Math.ceil(severity * 3);
    for (let i = 0; i < threatParticles; i++) {
      const px = x + (Math.random() - 0.5) * 10;
      const py = y + (Math.random() - 0.5) * 10;
      this.createQuantumParticle(px, py, severity, true);
    }
    
    this.emit('threatDisturbance', {
      x, y, severity,
      particlesCreated: threatParticles,
      fieldDisturbance: disturbanceRadius
    });
  }

  public getFieldState(): QuantumField {
    return { ...this.field };
  }

  public getParticles(): QuantumParticle[] {
    return [...this.particles];
  }

  public getQuantumStatistics(): any {
    return {
      fieldSize: this.FIELD_SIZE,
      particleCount: this.particles.length,
      coherenceLevel: this.field.coherenceLevel,
      entropy: this.field.entropy,
      averageEnergy: this.particles.reduce((sum, p) => sum + p.energy, 0) / this.particles.length,
      threatenedParticles: this.particles.filter(p => p.threatened).length,
      lastUpdate: this.field.lastUpdate
    };
  }

  public stop(): void {
    if (this.fieldUpdateInterval) {
      clearInterval(this.fieldUpdateInterval);
      this.fieldUpdateInterval = null;
    }
  }
}