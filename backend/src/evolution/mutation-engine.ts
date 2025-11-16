/**
 * Mutation Engine for defense evolution
 * Handles all mutation operations on defense organisms
 */

import * as crypto from 'crypto';
import { DefenseOrganism, DefenseGene, MutationStrategy } from '../ml-security/adaptive-policies-types';

export class MutationEngine {
  constructor(private logger = console) {}

  /**
   * Create mutated version of organism
   */
  public async createMutatedOrganism(organism: DefenseOrganism): Promise<DefenseOrganism> {
    const mutated: DefenseOrganism = {
      id: crypto.randomUUID(),
      genes: organism.genes.map(gene => this.cloneGene(gene)),
      fitness: 0,
      performance: { ...organism.performance },
      generation: organism.generation,
      lineage: [...organism.lineage],
      created: Date.now(),
      lastEvaluation: 0
    };

    await this.mutateOrganism(mutated, []);
    return mutated;
  }

  /**
   * Apply mutations to organism
   */
  public async mutateOrganism(
    organism: DefenseOrganism,
    mutationStrategies: MutationStrategy[]
  ): Promise<void> {
    for (const strategy of mutationStrategies) {
      if (Math.random() < strategy.probability) {
        await this.applyMutationStrategy(organism, strategy);
      }
    }
  }

  /**
   * Apply specific mutation strategy
   */
  public async applyMutationStrategy(
    organism: DefenseOrganism,
    strategy: MutationStrategy
  ): Promise<void> {
    const targetGenes = strategy.targetGeneType
      ? organism.genes.filter(g => g.type === strategy.targetGeneType)
      : organism.genes;

    if (targetGenes.length === 0) return;

    const targetGene = targetGenes[Math.floor(Math.random() * targetGenes.length)];
    const mutationId = `${strategy.type}_${Date.now()}`;

    switch (strategy.type) {
      case 'POINT':
        this.applyPointMutation(targetGene, mutationId);
        break;

      case 'INSERTION':
        this.applyInsertionMutation(targetGene, mutationId);
        break;

      case 'DELETION':
        this.applyDeletionMutation(targetGene, mutationId);
        break;

      case 'INVERSION':
        this.applyInversionMutation(targetGene, mutationId);
        break;

      case 'CROSSOVER':
        await this.applyGeneCrossover(organism, targetGene, mutationId);
        break;
    }

    targetGene.mutations.push(mutationId);
    targetGene.generation++;
  }

  /**
   * Apply point mutation (single character change)
   */
  public applyPointMutation(gene: DefenseGene, mutationId: string): void {
    if (gene.sequence.length === 0) return;

    const position = Math.floor(Math.random() * gene.sequence.length);
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const newChar = characters[Math.floor(Math.random() * characters.length)];

    gene.sequence = gene.sequence.substring(0, position) + newChar +
                   gene.sequence.substring(position + 1);
  }

  /**
   * Apply insertion mutation
   */
  public applyInsertionMutation(gene: DefenseGene, mutationId: string): void {
    const position = Math.floor(Math.random() * (gene.sequence.length + 1));
    const insertChars = 'ABCDEF0123456789';
    const insertLength = 1 + Math.floor(Math.random() * 3);

    let insertion = '';
    for (let i = 0; i < insertLength; i++) {
      insertion += insertChars[Math.floor(Math.random() * insertChars.length)];
    }

    gene.sequence = gene.sequence.substring(0, position) + insertion +
                   gene.sequence.substring(position);
  }

  /**
   * Apply deletion mutation
   */
  public applyDeletionMutation(gene: DefenseGene, mutationId: string): void {
    if (gene.sequence.length <= 2) return;

    const deleteLength = 1 + Math.floor(Math.random() * 2);
    const position = Math.floor(Math.random() * (gene.sequence.length - deleteLength + 1));

    gene.sequence = gene.sequence.substring(0, position) +
                   gene.sequence.substring(position + deleteLength);
  }

  /**
   * Apply inversion mutation
   */
  public applyInversionMutation(gene: DefenseGene, mutationId: string): void {
    if (gene.sequence.length < 4) return;

    const start = Math.floor(Math.random() * (gene.sequence.length - 2));
    const end = start + 2 + Math.floor(Math.random() * Math.min(4, gene.sequence.length - start - 2));

    const substring = gene.sequence.substring(start, end);
    const inverted = substring.split('').reverse().join('');

    gene.sequence = gene.sequence.substring(0, start) + inverted +
                   gene.sequence.substring(end);
  }

  /**
   * Apply gene crossover within organism
   */
  private async applyGeneCrossover(
    organism: DefenseOrganism,
    targetGene: DefenseGene,
    mutationId: string
  ): Promise<void> {
    if (organism.genes.length < 2) return;

    const compatibleGenes = organism.genes.filter(g =>
      g.type === targetGene.type && g.id !== targetGene.id
    );

    if (compatibleGenes.length === 0) return;

    const partnerGene = compatibleGenes[Math.floor(Math.random() * compatibleGenes.length)];
    const crossoverPoint = Math.floor(Math.random() *
      Math.min(targetGene.sequence.length, partnerGene.sequence.length));

    const newSequence = targetGene.sequence.substring(0, crossoverPoint) +
                       partnerGene.sequence.substring(crossoverPoint);

    targetGene.sequence = newSequence;
  }

  /**
   * Clone a gene with new ID
   */
  private cloneGene(gene: DefenseGene): DefenseGene {
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
}
