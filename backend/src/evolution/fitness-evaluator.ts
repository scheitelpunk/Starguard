/**
 * Fitness Evaluation for defense organisms
 * Handles testing, scoring, and performance metrics
 */

import { performance } from 'perf_hooks';
import { DefenseOrganism, DefenseGene, PerformanceMetrics, ThreatProfile, ResourceConstraints } from '../ml-security/adaptive-policies-types';

export class FitnessEvaluator {
  constructor(
    private threatProfiles: Map<string, ThreatProfile>,
    private resourceConstraints: ResourceConstraints,
    private logger = console
  ) {}

  /**
   * Evaluate organism fitness based on performance against threat landscape
   */
  public async evaluateOrganismFitness(organism: DefenseOrganism): Promise<number> {
    try {
      // Get threat samples for testing
      const threatSamples = Array.from(this.threatProfiles.values())
        .flatMap(profile => profile.samples.slice(0, 5));

      if (threatSamples.length === 0) {
        return 0.5; // Neutral fitness if no threats to test against
      }

      // Test organism against threats
      const testResult = await this.testOrganismAgainstThreats(organism, threatSamples);

      // Update organism performance
      organism.performance = testResult;
      organism.lastEvaluation = Date.now();

      // Calculate multi-objective fitness
      const detectionWeight = 0.4;
      const falsePositiveWeight = 0.25;
      const responseTimeWeight = 0.15;
      const resourceWeight = 0.1;
      const adaptabilityWeight = 0.1;

      // Normalize and weight fitness components
      const detectionScore = testResult.detectionRate;
      const falsePositiveScore = 1 - testResult.falsePositiveRate;
      const responseTimeScore = Math.max(0, 1 - (testResult.responseTime / 1000));
      const resourceScore = 1 - Math.min(1, testResult.resourceUsage);
      const adaptabilityScore = testResult.adaptabilityScore;

      const fitness = (
        detectionScore * detectionWeight +
        falsePositiveScore * falsePositiveWeight +
        responseTimeScore * responseTimeWeight +
        resourceScore * resourceWeight +
        adaptabilityScore * adaptabilityWeight
      );

      // Apply resource penalty if constraints exceeded
      const resourcePenalty = this.calculateResourcePenalty(testResult);

      organism.fitness = Math.max(0, Math.min(1, fitness - resourcePenalty));

      return organism.fitness;

    } catch (error) {
      this.logger.error('FitnessEvaluator: Fitness evaluation failed', error);
      return 0;
    }
  }

  /**
   * Test organism against threat samples
   */
  public async testOrganismAgainstThreats(
    organism: DefenseOrganism,
    threatSamples: string[]
  ): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    let detections = 0;
    let falsePositives = 0;
    let totalTests = threatSamples.length;

    // Simulate testing against threat samples
    for (const sample of threatSamples) {
      const detection = await this.simulateDetection(organism, sample);
      if (detection.detected) {
        if (detection.isThreat) {
          detections++;
        } else {
          falsePositives++;
        }
      }
    }

    // Add benign samples for false positive testing
    const benignSamples = await this.generateBenignSamples(threatSamples.length);
    totalTests += benignSamples.length;

    for (const sample of benignSamples) {
      const detection = await this.simulateDetection(organism, sample);
      if (detection.detected) {
        falsePositives++;
      }
    }

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    return {
      detectionRate: detections / threatSamples.length,
      falsePositiveRate: falsePositives / totalTests,
      responseTime: responseTime,
      resourceUsage: this.calculateResourceUsage(organism),
      adaptabilityScore: this.calculateAdaptabilityScore(organism),
      survivabilityScore: this.calculateSurvivabilityScore(organism)
    };
  }

  /**
   * Simulate detection of sample by organism
   */
  private async simulateDetection(
    organism: DefenseOrganism,
    sample: string
  ): Promise<{ detected: boolean; isThreat: boolean; confidence: number }> {
    let matchScore = 0;
    let totalWeight = 0;

    // Test each gene against the sample
    for (const gene of organism.genes) {
      const geneMatch = this.testGeneAgainstSample(gene, sample);
      matchScore += geneMatch * gene.strength;
      totalWeight += gene.strength;
    }

    const normalizedScore = totalWeight > 0 ? matchScore / totalWeight : 0;
    const detected = normalizedScore > 0.5;
    const isThreat = this.isSampleThreat(sample);

    return {
      detected,
      isThreat,
      confidence: normalizedScore
    };
  }

  /**
   * Test individual gene against sample
   */
  private testGeneAgainstSample(gene: DefenseGene, sample: string): number {
    const sampleUpper = sample.toUpperCase();
    const sequenceUpper = gene.sequence.toUpperCase();

    if (sampleUpper.includes(sequenceUpper)) {
      return gene.accuracy;
    }

    // Check for partial matches based on gene type
    switch (gene.type) {
      case 'SIGNATURE':
        return this.calculateSignatureMatch(gene, sample);
      case 'BEHAVIOR':
        return this.calculateBehaviorMatch(gene, sample);
      case 'NETWORK':
        return this.calculateNetworkMatch(gene, sample);
      case 'HEURISTIC':
        return this.calculateHeuristicMatch(gene, sample);
      default:
        return 0;
    }
  }

  private calculateSignatureMatch(gene: DefenseGene, sample: string): number {
    const similarities = [];
    for (let i = 0; i <= sample.length - gene.sequence.length; i++) {
      const substring = sample.substring(i, i + gene.sequence.length);
      const similarity = this.calculateStringSimilarity(gene.sequence, substring);
      similarities.push(similarity);
    }
    return Math.max(...similarities, 0) * gene.accuracy;
  }

  private calculateBehaviorMatch(gene: DefenseGene, sample: string): number {
    const behaviorKeywords = gene.sequence.toLowerCase().split('_');
    let matches = 0;
    for (const keyword of behaviorKeywords) {
      if (sample.toLowerCase().includes(keyword)) {
        matches++;
      }
    }
    return (matches / behaviorKeywords.length) * gene.accuracy;
  }

  private calculateNetworkMatch(gene: DefenseGene, sample: string): number {
    const networkPatterns = gene.sequence.split('|');
    for (const pattern of networkPatterns) {
      if (sample.includes(pattern)) {
        return gene.accuracy;
      }
    }
    return 0;
  }

  private calculateHeuristicMatch(gene: DefenseGene, sample: string): number {
    const heuristicScore = this.calculateSampleEntropy(sample) *
                          (gene.sequence.includes('entropy') ? 1 : 0) +
                          (sample.length / 1000) *
                          (gene.sequence.includes('size') ? 1 : 0);
    return Math.min(heuristicScore, 1) * gene.accuracy;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    if (str1.length === 0 || str2.length === 0) return 0;

    const matrix = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }

    const maxLength = Math.max(str1.length, str2.length);
    return 1 - (matrix[str2.length][str1.length] / maxLength);
  }

  private calculateSampleEntropy(sample: string): number {
    const frequency: Map<string, number> = new Map();

    for (const char of sample) {
      frequency.set(char, (frequency.get(char) || 0) + 1);
    }

    let entropy = 0;
    for (const count of frequency.values()) {
      const probability = count / sample.length;
      entropy -= probability * Math.log2(probability);
    }

    return entropy / 8;
  }

  private calculateResourceUsage(organism: DefenseOrganism): number {
    const geneComplexity = organism.genes.reduce((sum, gene) =>
      sum + gene.sequence.length * 0.1, 0
    );
    return Math.min(geneComplexity / 100, 1);
  }

  private calculateAdaptabilityScore(organism: DefenseOrganism): number {
    const uniqueMutations = new Set(organism.genes.flatMap(g => g.mutations)).size;
    const diversityScore = organism.genes.length > 0 ?
      new Set(organism.genes.map(g => g.type)).size / organism.genes.length : 0;

    return Math.min((uniqueMutations * 0.1 + diversityScore) / 2, 1);
  }

  private calculateSurvivabilityScore(organism: DefenseOrganism): number {
    const lineageScore = Math.min(organism.lineage.length / 10, 1);
    const fitnessStability = organism.fitness > 0.5 ? 1 : organism.fitness * 2;

    return (lineageScore + fitnessStability) / 2;
  }

  private calculateResourcePenalty(performance: PerformanceMetrics): number {
    let penalty = 0;
    const resourcePenaltyFactor = 0.1;

    if (performance.responseTime > this.resourceConstraints.maxResponseTime) {
      penalty += resourcePenaltyFactor;
    }

    if (performance.resourceUsage > this.resourceConstraints.maxCpuUsage) {
      penalty += resourcePenaltyFactor;
    }

    if (performance.falsePositiveRate > this.resourceConstraints.maxFalsePositiveRate) {
      penalty += resourcePenaltyFactor * 2;
    }

    return penalty;
  }

  private isSampleThreat(sample: string): boolean {
    const threatIndicators = ['malware', 'virus', 'trojan', 'exploit', 'attack'];
    return threatIndicators.some(indicator =>
      sample.toLowerCase().includes(indicator)
    );
  }

  private async generateBenignSamples(count: number): Promise<string[]> {
    const samples = [];
    const benignPatterns = [
      'normal_application_data',
      'legitimate_network_traffic',
      'system_configuration_file',
      'user_document_content'
    ];

    for (let i = 0; i < count; i++) {
      const pattern = benignPatterns[Math.floor(Math.random() * benignPatterns.length)];
      samples.push(`${pattern}_${i}_${Date.now()}`);
    }

    return samples;
  }
}
