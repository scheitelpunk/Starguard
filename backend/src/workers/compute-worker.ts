import { parentPort, workerData } from 'worker_threads';

/**
 * Compute Worker - Offload CPU-intensive tasks from main thread
 *
 * Supported operations:
 * - Shannon entropy calculation
 * - Genetic algorithm fitness evaluation
 * - Biometric pattern analysis
 * - Cryptographic operations
 * - Data transformation
 */

interface WorkerTask {
  id: string;
  type: 'shannon_entropy' | 'genetic_fitness' | 'biometric_analysis' | 'crypto' | 'transform';
  data: any;
}

interface WorkerResult {
  id: string;
  result: any;
  error?: string;
  duration: number;
}

/**
 * Calculate Shannon entropy
 */
function calculateShannonEntropy(data: string): number {
  if (data.length === 0) return 0;

  const frequencies = new Map<string, number>();

  // Count character frequencies
  for (const char of data) {
    frequencies.set(char, (frequencies.get(char) || 0) + 1);
  }

  // Calculate entropy
  let entropy = 0;
  const len = data.length;

  for (const count of frequencies.values()) {
    const probability = count / len;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}

/**
 * Evaluate genetic algorithm fitness
 */
function evaluateGeneticFitness(genome: any[], evaluator: string): number {
  // This would contain the actual fitness evaluation logic
  // For now, a simple example

  let fitness = 0;

  switch (evaluator) {
    case 'threat_detection':
      // Evaluate how well the genome detects threats
      fitness = genome.reduce((sum, gene) => sum + (gene.detectRate || 0), 0) / genome.length;
      break;

    case 'defense_efficiency':
      // Evaluate defense efficiency
      fitness = genome.reduce((sum, gene) => {
        const efficiency = (gene.successRate || 0) / Math.max(gene.resourceCost || 1, 1);
        return sum + efficiency;
      }, 0) / genome.length;
      break;

    case 'adaptation_speed':
      // Evaluate adaptation speed
      fitness = genome.reduce((sum, gene) => sum + (gene.mutationRate || 0) * (gene.adaptability || 0), 0);
      break;

    default:
      fitness = Math.random();
  }

  return Math.max(0, Math.min(1, fitness));
}

/**
 * Analyze biometric patterns
 */
function analyzeBiometricPatterns(data: {
  keystrokeTimings: number[];
  mouseVelocities: number[];
  pressurePatterns: number[];
}): {
  keystrokeScore: number;
  mouseScore: number;
  pressureScore: number;
  compositeScore: number;
} {
  // Calculate statistical measures for each biometric type

  const keystrokeScore = calculatePatternScore(data.keystrokeTimings);
  const mouseScore = calculatePatternScore(data.mouseVelocities);
  const pressureScore = calculatePatternScore(data.pressurePatterns);

  // Weighted composite score
  const compositeScore = (
    keystrokeScore * 0.4 +
    mouseScore * 0.35 +
    pressureScore * 0.25
  );

  return {
    keystrokeScore,
    mouseScore,
    pressureScore,
    compositeScore,
  };
}

/**
 * Calculate pattern score from timing array
 */
function calculatePatternScore(timings: number[]): number {
  if (timings.length === 0) return 0;

  const mean = timings.reduce((sum, t) => sum + t, 0) / timings.length;
  const variance = timings.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / timings.length;
  const stdDev = Math.sqrt(variance);

  // Lower variance = more consistent = higher score
  const consistencyScore = 1 / (1 + stdDev / mean);

  // Check for outliers
  const outliers = timings.filter(t => Math.abs(t - mean) > 2 * stdDev).length;
  const outlierPenalty = outliers / timings.length;

  return Math.max(0, consistencyScore - outlierPenalty);
}

/**
 * Perform cryptographic operations
 */
function performCryptoOperation(operation: string, data: any): any {
  const crypto = require('crypto');

  switch (operation) {
    case 'hash':
      return crypto.createHash(data.algorithm || 'sha256')
        .update(data.input)
        .digest('hex');

    case 'hmac':
      return crypto.createHmac(data.algorithm || 'sha256', data.key)
        .update(data.input)
        .digest('hex');

    case 'pbkdf2':
      return crypto.pbkdf2Sync(
        data.password,
        data.salt,
        data.iterations || 100000,
        data.keyLength || 64,
        data.digest || 'sha512'
      ).toString('hex');

    case 'random':
      return crypto.randomBytes(data.length || 32).toString('hex');

    default:
      throw new Error(`Unknown crypto operation: ${operation}`);
  }
}

/**
 * Perform data transformation
 */
function transformData(transformation: string, data: any): any {
  switch (transformation) {
    case 'normalize':
      // Normalize array to 0-1 range
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min;
      return data.map((v: number) => range > 0 ? (v - min) / range : 0);

    case 'standardize':
      // Standardize array (z-score)
      const mean = data.reduce((sum: number, v: number) => sum + v, 0) / data.length;
      const variance = data.reduce((sum: number, v: number) => sum + Math.pow(v - mean, 2), 0) / data.length;
      const stdDev = Math.sqrt(variance);
      return data.map((v: number) => stdDev > 0 ? (v - mean) / stdDev : 0);

    case 'filter_outliers':
      // Remove outliers using IQR method
      const sorted = [...data].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      const lower = q1 - 1.5 * iqr;
      const upper = q3 + 1.5 * iqr;
      return data.filter((v: number) => v >= lower && v <= upper);

    case 'smooth':
      // Moving average smoothing
      const windowSize = data.windowSize || 3;
      const result: number[] = [];
      for (let i = 0; i < data.values.length; i++) {
        const start = Math.max(0, i - Math.floor(windowSize / 2));
        const end = Math.min(data.values.length, i + Math.ceil(windowSize / 2));
        const window = data.values.slice(start, end);
        result.push(window.reduce((sum: number, v: number) => sum + v, 0) / window.length);
      }
      return result;

    default:
      throw new Error(`Unknown transformation: ${transformation}`);
  }
}

/**
 * Process worker task
 */
function processTask(task: WorkerTask): WorkerResult {
  const startTime = Date.now();

  try {
    let result: any;

    switch (task.type) {
      case 'shannon_entropy':
        result = calculateShannonEntropy(task.data.input);
        break;

      case 'genetic_fitness':
        result = evaluateGeneticFitness(task.data.genome, task.data.evaluator);
        break;

      case 'biometric_analysis':
        result = analyzeBiometricPatterns(task.data);
        break;

      case 'crypto':
        result = performCryptoOperation(task.data.operation, task.data.params);
        break;

      case 'transform':
        result = transformData(task.data.transformation, task.data.values);
        break;

      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }

    return {
      id: task.id,
      result,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      id: task.id,
      result: null,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

// Listen for messages from main thread
if (parentPort) {
  parentPort.on('message', (task: WorkerTask) => {
    const result = processTask(task);
    parentPort!.postMessage(result);
  });
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  if (parentPort) {
    parentPort.postMessage({
      id: 'error',
      result: null,
      error: error.message,
      duration: 0,
    });
  }
  process.exit(1);
});

export {};
