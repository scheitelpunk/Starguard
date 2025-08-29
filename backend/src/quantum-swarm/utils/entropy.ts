import { createHash } from 'crypto';

/**
 * Shannon Entropy Calculator for Network Traffic Analysis
 * Calculates information entropy to detect anomalous patterns
 */
export class EntropyCalculator {
  /**
   * Calculate Shannon entropy of a data buffer
   * @param data - Input data buffer
   * @returns Entropy value between 0 and 8 (for byte-level entropy)
   */
  static calculateShannonEntropy(data: Buffer): number {
    if (data.length === 0) return 0;

    // Count frequency of each byte value (0-255)
    const frequencies = new Array(256).fill(0);
    for (let i = 0; i < data.length; i++) {
      frequencies[data[i]]++;
    }

    // Calculate entropy
    let entropy = 0;
    const dataLength = data.length;

    for (let i = 0; i < 256; i++) {
      if (frequencies[i] > 0) {
        const probability = frequencies[i] / dataLength;
        entropy -= probability * Math.log2(probability);
      }
    }

    return entropy;
  }

  /**
   * Calculate entropy for string data
   * @param text - Input string
   * @returns Normalized entropy value (0-1)
   */
  static calculateTextEntropy(text: string): number {
    if (!text.length) return 0;

    const frequencies = new Map<string, number>();
    
    // Count character frequencies
    for (const char of text) {
      frequencies.set(char, (frequencies.get(char) || 0) + 1);
    }

    // Calculate Shannon entropy
    let entropy = 0;
    const textLength = text.length;

    for (const count of frequencies.values()) {
      const probability = count / textLength;
      entropy -= probability * Math.log2(probability);
    }

    // Normalize by maximum possible entropy for this alphabet size
    const maxEntropy = Math.log2(frequencies.size);
    return maxEntropy > 0 ? entropy / maxEntropy : 0;
  }

  /**
   * Calculate rolling entropy over a time window
   * @param dataPoints - Array of data samples
   * @param windowSize - Size of rolling window
   * @returns Array of entropy values
   */
  static calculateRollingEntropy(dataPoints: Buffer[], windowSize: number): number[] {
    if (dataPoints.length < windowSize) return [];

    const entropies: number[] = [];
    
    for (let i = 0; i <= dataPoints.length - windowSize; i++) {
      const window = dataPoints.slice(i, i + windowSize);
      const combinedData = Buffer.concat(window);
      const entropy = this.calculateShannonEntropy(combinedData);
      entropies.push(entropy);
    }

    return entropies;
  }

  /**
   * Detect entropy anomalies using statistical thresholds
   * @param entropies - Array of entropy values
   * @param threshold - Standard deviations from mean to consider anomalous
   * @returns Array of anomaly indicators
   */
  static detectEntropyAnomalies(entropies: number[], threshold: number = 2.0): boolean[] {
    if (entropies.length === 0) return [];

    // Calculate statistical metrics
    const mean = entropies.reduce((sum, val) => sum + val, 0) / entropies.length;
    const variance = entropies.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / entropies.length;
    const stdDev = Math.sqrt(variance);

    // Determine anomalies
    return entropies.map(entropy => 
      Math.abs(entropy - mean) > threshold * stdDev
    );
  }

  /**
   * Calculate cross-entropy between two probability distributions
   * @param p - First distribution (frequencies)
   * @param q - Second distribution (frequencies)
   * @returns Cross-entropy value
   */
  static calculateCrossEntropy(p: number[], q: number[]): number {
    if (p.length !== q.length) {
      throw new Error('Distributions must have the same length');
    }

    // Normalize to probabilities
    const sumP = p.reduce((sum, val) => sum + val, 0);
    const sumQ = q.reduce((sum, val) => sum + val, 0);
    
    if (sumP === 0 || sumQ === 0) return Infinity;

    let crossEntropy = 0;
    for (let i = 0; i < p.length; i++) {
      const probP = p[i] / sumP;
      const probQ = q[i] / sumQ;
      
      if (probP > 0 && probQ > 0) {
        crossEntropy -= probP * Math.log2(probQ);
      } else if (probP > 0 && probQ === 0) {
        return Infinity; // Infinite cross-entropy
      }
    }

    return crossEntropy;
  }

  /**
   * Calculate Kullback-Leibler divergence
   * @param p - Reference distribution
   * @param q - Compared distribution
   * @returns KL divergence value
   */
  static calculateKLDivergence(p: number[], q: number[]): number {
    const crossEntropy = this.calculateCrossEntropy(p, q);
    const entropy = this.calculateDistributionEntropy(p);
    return crossEntropy - entropy;
  }

  /**
   * Calculate entropy of a probability distribution
   * @param distribution - Frequency distribution
   * @returns Entropy value
   */
  private static calculateDistributionEntropy(distribution: number[]): number {
    const sum = distribution.reduce((sum, val) => sum + val, 0);
    if (sum === 0) return 0;

    let entropy = 0;
    for (const count of distribution) {
      if (count > 0) {
        const probability = count / sum;
        entropy -= probability * Math.log2(probability);
      }
    }

    return entropy;
  }

  /**
   * Generate entropy-based fingerprint for data
   * @param data - Input data
   * @param blockSize - Size of blocks for segmented entropy calculation
   * @returns Fingerprint hash
   */
  static generateEntropyFingerprint(data: Buffer, blockSize: number = 64): string {
    const blocks: number[] = [];
    
    for (let i = 0; i < data.length; i += blockSize) {
      const block = data.slice(i, i + blockSize);
      const entropy = this.calculateShannonEntropy(block);
      blocks.push(Math.floor(entropy * 1000)); // Scale for integer representation
    }

    // Create hash of entropy sequence
    const fingerprint = blocks.join(',');
    return createHash('sha256').update(fingerprint).digest('hex').substring(0, 16);
  }
}