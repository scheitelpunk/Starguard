/**
 * Genetic Algorithm operations for defense evolution
 * Handles selection, crossover, and population management
 */

import * as crypto from 'crypto';
import { DefenseOrganism, DefenseGene, PerformanceMetrics } from './defense-dna-types';

export class GeneticAlgorithm {
  constructor(private logger = console) {}

  /**
   * Select parent organism using tournament selection
   */
  public selectParent(population: DefenseOrganism[], tournamentSize: number = 5): DefenseOrganism {
    const tournament: DefenseOrganism[] = [];

    // Select random organisms for tournament
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      tournament.push(population[randomIndex]);
    }

    // Return best organism from tournament
    tournament.sort((a, b) => b.fitness - a.fitness);
    return tournament[0];
  }

  /**
   * Perform crossover between two parent organisms
   */
  public async crossover(
    parent1: DefenseOrganism,
    parent2: DefenseOrganism,
    currentGeneration: number
  ): Promise<DefenseOrganism[]> {
    const child1Genes: DefenseGene[] = [];
    const child2Genes: DefenseGene[] = [];

    // Single-point crossover
    const crossoverPoint = Math.floor(Math.random() *
      Math.min(parent1.genes.length, parent2.genes.length));

    // Mix genes from both parents
    for (let i = 0; i < Math.max(parent1.genes.length, parent2.genes.length); i++) {
      if (i < crossoverPoint) {
        if (i < parent1.genes.length) {
          child1Genes.push(this.cloneGene(parent1.genes[i]));
        }
        if (i < parent2.genes.length) {
          child2Genes.push(this.cloneGene(parent2.genes[i]));
        }
      } else {
        if (i < parent2.genes.length) {
          child1Genes.push(this.cloneGene(parent2.genes[i]));
        }
        if (i < parent1.genes.length) {
          child2Genes.push(this.cloneGene(parent1.genes[i]));
        }
      }
    }

    const child1: DefenseOrganism = {
      id: crypto.randomUUID(),
      genes: child1Genes,
      fitness: 0,
      performance: this.createEmptyPerformanceMetrics(),
      generation: currentGeneration + 1,
      lineage: [parent1.id, parent2.id],
      created: Date.now(),
      lastEvaluation: 0
    };

    const child2: DefenseOrganism = {
      id: crypto.randomUUID(),
      genes: child2Genes,
      fitness: 0,
      performance: this.createEmptyPerformanceMetrics(),
      generation: currentGeneration + 1,
      lineage: [parent2.id, parent1.id],
      created: Date.now(),
      lastEvaluation: 0
    };

    return [child1, child2];
  }

  /**
   * Select elite organisms (top performers)
   */
  public selectElite(population: DefenseOrganism[], eliteRatio: number): DefenseOrganism[] {
    const eliteCount = Math.floor(population.length * eliteRatio);
    return population.slice(0, eliteCount);
  }

  /**
   * Clone a gene with new ID
   */
  public cloneGene(gene: DefenseGene): DefenseGene {
    return {
      id: crypto.randomUUID(),
      type: gene.type,
      sequence: gene.sequence,
      strength: gene.strength,
      accuracy: gene.accuracy,
      falsePositiveRate: gene.falsePositiveRate,
      generation: gene.generation,
      parentIds: [gene.id],
      mutations: [...gene.mutations],
      created: Date.now()
    };
  }

  /**
   * Create random organism with specified gene templates
   */
  public async createRandomOrganism(
    geneTemplates: any[],
    generation: number
  ): Promise<DefenseOrganism> {
    const organismId = crypto.randomUUID();
    const genes: DefenseGene[] = [];

    // Generate 3-7 genes per organism
    const geneCount = 3 + Math.floor(Math.random() * 5);

    for (let i = 0; i < geneCount; i++) {
      const template = geneTemplates[Math.floor(Math.random() * geneTemplates.length)];
      const pattern = template.patterns[Math.floor(Math.random() * template.patterns.length)];

      const gene: DefenseGene = {
        id: crypto.randomUUID(),
        type: template.type,
        sequence: this.mutatePattern(pattern),
        strength: Math.random(),
        accuracy: 0.5 + Math.random() * 0.5,
        falsePositiveRate: Math.random() * 0.1,
        generation,
        parentIds: [],
        mutations: [],
        created: Date.now()
      };

      genes.push(gene);
    }

    const organism: DefenseOrganism = {
      id: organismId,
      genes,
      fitness: 0,
      performance: this.createEmptyPerformanceMetrics(),
      generation,
      lineage: [],
      created: Date.now(),
      lastEvaluation: 0
    };

    return organism;
  }

  /**
   * Calculate generation statistics
   */
  public calculateGenerationStats(population: DefenseOrganism[]): {
    bestFitness: number;
    averageFitness: number;
    diversityIndex: number;
  } {
    if (population.length === 0) {
      return { bestFitness: 0, averageFitness: 0, diversityIndex: 0 };
    }

    const fitnesses = population.map(org => org.fitness);
    const bestFitness = Math.max(...fitnesses);
    const averageFitness = fitnesses.reduce((sum, f) => sum + f, 0) / fitnesses.length;

    // Calculate diversity index (genetic diversity)
    const geneTypes = new Set<string>();
    for (const organism of population) {
      for (const gene of organism.genes) {
        geneTypes.add(`${gene.type}_${gene.sequence}`);
      }
    }

    const diversityIndex = geneTypes.size / (population.length * 5); // Normalize

    return { bestFitness, averageFitness, diversityIndex };
  }

  /**
   * Get unique elite organisms
   */
  public getUniqueElite(eliteOrganisms: DefenseOrganism[]): DefenseOrganism[] {
    const unique = new Map<string, DefenseOrganism>();
    for (const organism of eliteOrganisms) {
      const key = organism.genes.map(g => g.sequence).join('|');
      if (!unique.has(key) || unique.get(key)!.fitness < organism.fitness) {
        unique.set(key, organism);
      }
    }
    return Array.from(unique.values());
  }

  /**
   * Add random variation to pattern
   */
  private mutatePattern(pattern: string): string {
    const variations = ['', '?', '*', 'X', '0'];
    const variation = variations[Math.floor(Math.random() * variations.length)];
    return pattern + variation;
  }

  /**
   * Create empty performance metrics
   */
  private createEmptyPerformanceMetrics(): PerformanceMetrics {
    return {
      detectionRate: 0,
      falsePositiveRate: 0,
      responseTime: 0,
      resourceUsage: 0,
      adaptabilityScore: 0,
      survivabilityScore: 0
    };
  }
}
