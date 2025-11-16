/**
 * DefenseDNA - Genetic Algorithm-based Defense Evolution System (Refactored)
 *
 * Main orchestrator that coordinates genetic algorithms, fitness evaluation,
 * mutation strategies, and YARA rule generation
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import { performance } from 'perf_hooks';
import {
  DefenseDNAConfig,
  DefenseOrganism,
  ThreatProfile,
  EvolutionEnvironment,
  MutationStrategy,
  YARARule,
  EvolutionResult
} from './defense-dna-types';
import { GeneticAlgorithm } from './genetic-algorithm';
import { FitnessEvaluator } from './fitness-evaluator';
import { MutationEngine } from './mutation-engine';
import { YARAGenerator } from './yara-generator';

export class DefenseDNA extends EventEmitter {
  private readonly config: DefenseDNAConfig = {
    populationSize: 100,
    eliteRatio: 0.1,
    mutationRate: 0.05,
    crossoverRate: 0.8,
    maxGenerations: 1000,
    fitnessThreshold: 0.95,
    diversityThreshold: 0.3,
    stagnationLimit: 10,
    resourcePenalty: 0.1,
    adaptationWindow: 50,
    yaraComplexityLimit: 20,
  };

  private population: DefenseOrganism[] = [];
  private currentGeneration: number = 0;
  private evolutionEnvironment: EvolutionEnvironment;
  private mutationStrategies: MutationStrategy[] = [];
  private threatProfiles: Map<string, ThreatProfile> = new Map();
  private generatedRules: Map<string, YARARule> = new Map();
  private fitnessHistory: number[] = [];
  private isEvolving: boolean = false;

  // Component modules
  private geneticAlgorithm: GeneticAlgorithm;
  private fitnessEvaluator: FitnessEvaluator;
  private mutationEngine: MutationEngine;
  private yaraGenerator: YARAGenerator;

  constructor(private logger = console) {
    super();

    // Initialize evolution environment
    this.evolutionEnvironment = {
      threatLandscape: [],
      pressureIntensity: 0.7,
      resourceConstraints: {
        maxCpuUsage: 0.8,
        maxMemoryUsage: 0.7,
        maxResponseTime: 1000,
        maxFalsePositiveRate: 0.05
      },
      selectionPressure: 0.8,
      mutationRate: this.config.mutationRate
    };

    // Initialize mutation strategies
    this.mutationStrategies = [
      { type: 'POINT', probability: 0.6, impact: 'LOW' },
      { type: 'INSERTION', probability: 0.2, impact: 'MEDIUM' },
      { type: 'DELETION', probability: 0.2, impact: 'MEDIUM' },
      { type: 'INVERSION', probability: 0.1, impact: 'HIGH' },
      { type: 'CROSSOVER', probability: 0.05, impact: 'HIGH' }
    ];

    // Initialize components
    this.geneticAlgorithm = new GeneticAlgorithm(logger);
    this.fitnessEvaluator = new FitnessEvaluator(
      this.threatProfiles,
      this.evolutionEnvironment.resourceConstraints,
      logger
    );
    this.mutationEngine = new MutationEngine(logger);
    this.yaraGenerator = new YARAGenerator(this.config.yaraComplexityLimit, logger);

    this.setupEventHandlers();
  }

  /**
   * Initialize the DefenseDNA evolution system
   */
  public async initialize(): Promise<void> {
    try {
      this.logger.info('DefenseDNA: Initializing genetic defense evolution system');

      await this.createInitialPopulation();
      await this.loadThreatProfiles();

      this.emit('initialized');
      this.logger.info('DefenseDNA: Successfully initialized');
    } catch (error) {
      this.logger.error('DefenseDNA: Initialization failed', error);
      throw new Error(`DefenseDNA initialization failed: ${error}`);
    }
  }

  /**
   * Evolve defense population over multiple generations
   */
  public async evolveDefenses(
    generations: number = 50,
    targetFitness: number = 0.9
  ): Promise<EvolutionResult> {
    if (this.isEvolving) {
      throw new Error('Evolution already in progress');
    }

    this.isEvolving = true;
    const startTime = performance.now();

    try {
      this.logger.info(`DefenseDNA: Starting evolution for ${generations} generations`);

      let stagnationCounter = 0;
      let bestFitness = 0;
      const eliteOrganisms: DefenseOrganism[] = [];
      const newRules: YARARule[] = [];

      for (let gen = 0; gen < generations; gen++) {
        this.currentGeneration = gen;

        await this.evaluatePopulation();
        const stats = this.geneticAlgorithm.calculateGenerationStats(this.population);

        if (stats.bestFitness > bestFitness) {
          bestFitness = stats.bestFitness;
          stagnationCounter = 0;

          const elite = this.geneticAlgorithm.selectElite(this.population, this.config.eliteRatio);
          eliteOrganisms.push(...elite);

          const rules = await this.generateYARAFromElite(elite);
          newRules.push(...rules);
        } else {
          stagnationCounter++;
        }

        if (bestFitness >= targetFitness) {
          this.logger.info(`DefenseDNA: Target fitness ${targetFitness} reached at generation ${gen}`);
          break;
        }

        if (stagnationCounter >= this.config.stagnationLimit) {
          this.logger.info(`DefenseDNA: Evolution stagnated for ${this.config.stagnationLimit} generations`);
          await this.introduceDiversity();
          stagnationCounter = 0;
        }

        await this.evolveToNextGeneration();

        this.emit('generation_evolved', {
          generation: gen,
          bestFitness: stats.bestFitness,
          averageFitness: stats.averageFitness,
          diversity: stats.diversityIndex
        });

        if (gen % 10 === 0) {
          this.logger.info(`DefenseDNA: Generation ${gen}, Best fitness: ${stats.bestFitness.toFixed(3)}`);
        }
      }

      const finalStats = this.geneticAlgorithm.calculateGenerationStats(this.population);
      const executionTime = performance.now() - startTime;

      const result: EvolutionResult = {
        generation: this.currentGeneration,
        population: [...this.population],
        bestFitness: finalStats.bestFitness,
        averageFitness: finalStats.averageFitness,
        diversityIndex: finalStats.diversityIndex,
        convergenceRate: this.calculateConvergenceRate(),
        eliteOrganisms: this.geneticAlgorithm.getUniqueElite(eliteOrganisms),
        newRules: this.yaraGenerator.getUniqueRules(newRules)
      };

      this.logger.info(
        `DefenseDNA: Evolution completed in ${executionTime.toFixed(2)}ms. ` +
        `Best fitness: ${result.bestFitness.toFixed(3)}, Rules generated: ${result.newRules.length}`
      );

      return result;

    } catch (error) {
      this.logger.error('DefenseDNA: Evolution failed', error);
      throw error;
    } finally {
      this.isEvolving = false;
    }
  }

  /**
   * Test defense organism against threat samples (mutation testing)
   */
  public async performMutationTesting(
    organism: DefenseOrganism,
    threatSamples: string[],
    mutationCount: number = 100
  ): Promise<{
    robustnessScore: number;
    failureModes: string[];
    recommendedMutations: string[];
    testResults: any[];
  }> {
    try {
      this.logger.info(`DefenseDNA: Performing mutation testing on organism ${organism.id}`);

      const testResults: any[] = [];
      const failureModes: string[] = [];
      const recommendedMutations: string[] = [];
      let passedTests = 0;

      for (let i = 0; i < mutationCount; i++) {
        const mutatedOrganism = await this.mutationEngine.createMutatedOrganism(organism);
        const testResult = await this.fitnessEvaluator.testOrganismAgainstThreats(
          mutatedOrganism,
          threatSamples
        );

        testResults.push({
          mutationId: mutatedOrganism.id,
          mutations: mutatedOrganism.genes.flatMap(g => g.mutations),
          detectionRate: testResult.detectionRate,
          falsePositiveRate: testResult.falsePositiveRate,
          responseTime: testResult.responseTime,
          passed: testResult.detectionRate > 0.8 && testResult.falsePositiveRate < 0.1
        });

        if (testResult.detectionRate > organism.performance.detectionRate) {
          recommendedMutations.push(...mutatedOrganism.genes.flatMap(g => g.mutations));
        }

        if (testResult.detectionRate < 0.5) {
          failureModes.push(`Mutation ${i}: ${mutatedOrganism.genes.flatMap(g => g.mutations).join(', ')}`);
        } else {
          passedTests++;
        }
      }

      const robustnessScore = passedTests / mutationCount;

      this.emit('mutation_testing_complete', {
        organismId: organism.id,
        robustnessScore,
        testsRun: mutationCount,
        testsPassed: passedTests
      });

      return {
        robustnessScore,
        failureModes,
        recommendedMutations: [...new Set(recommendedMutations)],
        testResults
      };

    } catch (error) {
      this.logger.error('DefenseDNA: Mutation testing failed', error);
      throw error;
    }
  }

  /**
   * Generate YARA rule from defense organism
   */
  public async generateYARARule(organism: DefenseOrganism): Promise<YARARule> {
    const rule = await this.yaraGenerator.generateYARARule(organism);
    this.generatedRules.set(rule.name, rule);
    this.emit('yara_rule_generated', rule);
    return rule;
  }

  /**
   * Create initial population with diverse defense genes
   */
  private async createInitialPopulation(): Promise<void> {
    this.population = [];

    const baseGeneTemplates = [
      { type: 'SIGNATURE', patterns: ['4D5A', '5045', 'D0CF11E0'] },
      { type: 'BEHAVIOR', patterns: ['CreateProcess', 'WriteProcessMemory', 'VirtualAlloc'] },
      { type: 'NETWORK', patterns: ['HTTP/1.1', 'POST /', 'GET /'] },
      { type: 'HEURISTIC', patterns: ['entropy_high', 'packed_code', 'obfuscated'] }
    ];

    for (let i = 0; i < this.config.populationSize; i++) {
      const organism = await this.geneticAlgorithm.createRandomOrganism(baseGeneTemplates, 0);
      this.population.push(organism);
    }

    this.logger.info(`DefenseDNA: Created initial population of ${this.population.length} organisms`);
  }

  /**
   * Evaluate entire population fitness
   */
  private async evaluatePopulation(): Promise<void> {
    const evaluationPromises = this.population.map(organism =>
      this.fitnessEvaluator.evaluateOrganismFitness(organism)
    );

    await Promise.all(evaluationPromises);

    this.population.sort((a, b) => b.fitness - a.fitness);
    this.fitnessHistory.push(this.population[0].fitness);
  }

  /**
   * Evolve population to next generation
   */
  private async evolveToNextGeneration(): Promise<void> {
    const newPopulation: DefenseOrganism[] = [];

    const eliteCount = Math.floor(this.config.populationSize * this.config.eliteRatio);
    const elite = this.population.slice(0, eliteCount);
    newPopulation.push(...elite);

    while (newPopulation.length < this.config.populationSize) {
      const parent1 = this.geneticAlgorithm.selectParent(this.population);
      const parent2 = this.geneticAlgorithm.selectParent(this.population);

      let offspring: DefenseOrganism[];

      if (Math.random() < this.config.crossoverRate) {
        offspring = await this.geneticAlgorithm.crossover(parent1, parent2, this.currentGeneration);
      } else {
        offspring = [await this.mutationEngine.createMutatedOrganism(parent1)];
      }

      for (const child of offspring) {
        if (Math.random() < this.config.mutationRate) {
          await this.mutationEngine.mutateOrganism(child, this.mutationStrategies);
        }

        child.generation = this.currentGeneration + 1;
        child.lineage = [...parent1.lineage, parent1.id];
      }

      newPopulation.push(...offspring);
    }

    this.population = newPopulation.slice(0, this.config.populationSize);
  }

  /**
   * Generate YARA rules from elite organisms
   */
  private async generateYARAFromElite(elite: DefenseOrganism[]): Promise<YARARule[]> {
    const rules = [];
    for (const organism of elite.slice(0, 5)) {
      try {
        const rule = await this.generateYARARule(organism);
        rules.push(rule);
      } catch (error) {
        this.logger.warn(`Failed to generate YARA rule for organism ${organism.id}`);
      }
    }
    return rules;
  }

  /**
   * Introduce diversity to combat stagnation
   */
  private async introduceDiversity(): Promise<void> {
    const replaceCount = Math.floor(this.config.populationSize * 0.2);
    const geneTemplates = [
      { type: 'SIGNATURE', patterns: ['4D5A90', '504500', 'D0CF11'] },
      { type: 'BEHAVIOR', patterns: ['CreateRemoteThread', 'SetWindowsHookEx', 'LoadLibrary'] },
      { type: 'NETWORK', patterns: ['User-Agent:', 'Content-Type:', 'Authorization:'] },
      { type: 'HEURISTIC', patterns: ['compressed_data', 'encrypted_payload', 'suspicious_api'] }
    ];

    for (let i = 0; i < replaceCount; i++) {
      const newOrganism = await this.geneticAlgorithm.createRandomOrganism(geneTemplates, this.currentGeneration);
      this.population[this.population.length - 1 - i] = newOrganism;
    }

    this.logger.info(`DefenseDNA: Introduced ${replaceCount} new organisms for diversity`);
  }

  /**
   * Calculate convergence rate
   */
  private calculateConvergenceRate(): number {
    if (this.fitnessHistory.length < 10) return 0;

    const recent = this.fitnessHistory.slice(-10);
    const trend = recent.reduce((sum, fitness, index) =>
      sum + fitness * (index + 1), 0) / recent.length;

    return Math.min(trend, 1);
  }

  /**
   * Load threat profiles
   */
  private async loadThreatProfiles(): Promise<void> {
    const sampleProfiles: ThreatProfile[] = [
      {
        id: 'malware_pe',
        type: 'MALWARE',
        characteristics: ['pe_header', 'packed_code', 'suspicious_imports'],
        severity: 0.8,
        frequency: 0.3,
        samples: ['4D5A90', '504500', 'PE\0\0']
      },
      {
        id: 'network_intrusion',
        type: 'INTRUSION',
        characteristics: ['port_scan', 'brute_force', 'privilege_escalation'],
        severity: 0.7,
        frequency: 0.2,
        samples: ['admin:password', 'root:toor', '../../etc/passwd']
      }
    ];

    for (const profile of sampleProfiles) {
      this.threatProfiles.set(profile.id, profile);
    }
  }

  private setupEventHandlers(): void {
    this.on('error', (error) => {
      this.logger.error('DefenseDNA: Error event', error);
    });
  }

  // Public getters
  public getPopulationStats() {
    return {
      size: this.population.length,
      generation: this.currentGeneration,
      averageFitness: this.population.reduce((sum, org) => sum + org.fitness, 0) / this.population.length,
      bestFitness: Math.max(...this.population.map(org => org.fitness)),
      diversityIndex: this.geneticAlgorithm.calculateGenerationStats(this.population).diversityIndex,
      isEvolving: this.isEvolving
    };
  }

  public getGeneratedRules(): YARARule[] {
    return Array.from(this.generatedRules.values());
  }

  public getThreatProfiles(): ThreatProfile[] {
    return Array.from(this.threatProfiles.values());
  }

  public async shutdown(): Promise<void> {
    try {
      this.isEvolving = false;
      this.population.length = 0;
      this.threatProfiles.clear();
      this.generatedRules.clear();
      this.fitnessHistory.length = 0;

      this.emit('shutdown');
      this.logger.info('DefenseDNA: Successfully shut down');
    } catch (error) {
      this.logger.error('DefenseDNA: Shutdown failed', error);
      throw error;
    }
  }
}

export default DefenseDNA;
