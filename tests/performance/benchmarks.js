/**
 * Performance Benchmark Suite for Starguard
 *
 * Benchmarks individual components and operations
 * Run with: node tests/performance/benchmarks.js
 */

const Benchmark = require('benchmark');
const crypto = require('crypto');

// Benchmark configuration
const suite = new Benchmark.Suite();

console.log('Starting Starguard Performance Benchmarks...\n');

/**
 * Shannon Entropy Calculation Benchmark
 */
function calculateShannonEntropy(data) {
  if (data.length === 0) return 0;

  const frequencies = new Map();
  for (const char of data) {
    frequencies.set(char, (frequencies.get(char) || 0) + 1);
  }

  let entropy = 0;
  const len = data.length;

  for (const count of frequencies.values()) {
    const probability = count / len;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}

/**
 * Biometric Pattern Analysis Benchmark
 */
function analyzeBiometricPattern(timings) {
  if (timings.length === 0) return 0;

  const mean = timings.reduce((sum, t) => sum + t, 0) / timings.length;
  const variance = timings.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / timings.length;
  const stdDev = Math.sqrt(variance);

  const consistencyScore = 1 / (1 + stdDev / mean);
  const outliers = timings.filter(t => Math.abs(t - mean) > 2 * stdDev).length;
  const outlierPenalty = outliers / timings.length;

  return Math.max(0, consistencyScore - outlierPenalty);
}

/**
 * Genetic Algorithm Fitness Benchmark
 */
function evaluateGeneticFitness(genome) {
  return genome.reduce((sum, gene) => {
    const efficiency = (gene.successRate || 0) / Math.max(gene.resourceCost || 1, 1);
    return sum + efficiency;
  }, 0) / genome.length;
}

/**
 * Object Pool Benchmark
 */
class SimpleObjectPool {
  constructor(factory, size = 100) {
    this.factory = factory;
    this.available = [];
    this.inUse = new Set();

    for (let i = 0; i < size; i++) {
      this.available.push(factory());
    }
  }

  acquire() {
    let obj = this.available.pop();
    if (!obj) {
      obj = this.factory();
    }
    this.inUse.add(obj);
    return obj;
  }

  release(obj) {
    this.inUse.delete(obj);
    this.available.push(obj);
  }
}

// Test data
const testData = {
  shortString: 'test-data',
  longString: 'a'.repeat(10000),
  randomString: crypto.randomBytes(1000).toString('hex'),
  biometricTimings: Array.from({ length: 100 }, () => Math.random() * 200 + 50),
  genome: Array.from({ length: 50 }, () => ({
    successRate: Math.random(),
    resourceCost: Math.random() * 10,
  })),
};

// Buffer pool for benchmark
const bufferPool = new SimpleObjectPool(() => Buffer.allocUnsafe(1024), 50);

/**
 * Add benchmarks to suite
 */

// Shannon Entropy Benchmarks
suite.add('Shannon Entropy - Short String', () => {
  calculateShannonEntropy(testData.shortString);
});

suite.add('Shannon Entropy - Long String', () => {
  calculateShannonEntropy(testData.longString);
});

suite.add('Shannon Entropy - Random Data', () => {
  calculateShannonEntropy(testData.randomString);
});

// Biometric Analysis Benchmarks
suite.add('Biometric Pattern Analysis - 100 samples', () => {
  analyzeBiometricPattern(testData.biometricTimings);
});

suite.add('Biometric Pattern Analysis - 1000 samples', () => {
  const largeSample = Array.from({ length: 1000 }, () => Math.random() * 200 + 50);
  analyzeBiometricPattern(largeSample);
});

// Genetic Algorithm Benchmarks
suite.add('Genetic Fitness Evaluation - 50 genes', () => {
  evaluateGeneticFitness(testData.genome);
});

suite.add('Genetic Fitness Evaluation - 500 genes', () => {
  const largeGenome = Array.from({ length: 500 }, () => ({
    successRate: Math.random(),
    resourceCost: Math.random() * 10,
  }));
  evaluateGeneticFitness(largeGenome);
});

// Cryptographic Benchmarks
suite.add('SHA-256 Hash - 1KB', () => {
  crypto.createHash('sha256').update(testData.randomString).digest('hex');
});

suite.add('SHA-512 Hash - 1KB', () => {
  crypto.createHash('sha512').update(testData.randomString).digest('hex');
});

suite.add('HMAC-SHA256 - 1KB', () => {
  crypto.createHmac('sha256', 'secret-key').update(testData.randomString).digest('hex');
});

// Object Pool Benchmarks
suite.add('Buffer Pool - Acquire/Release', () => {
  const buffer = bufferPool.acquire();
  bufferPool.release(buffer);
});

suite.add('Buffer Creation - Without Pool', () => {
  const buffer = Buffer.allocUnsafe(1024);
});

// JSON Serialization Benchmarks
const complexObject = {
  threats: Array.from({ length: 100 }, (_, i) => ({
    id: `threat-${i}`,
    type: 'anomaly',
    severity: 'high',
    timestamp: Date.now(),
    data: { foo: 'bar', baz: Math.random() },
  })),
};

suite.add('JSON Stringify - Complex Object', () => {
  JSON.stringify(complexObject);
});

suite.add('JSON Parse - Complex Object', () => {
  const str = JSON.stringify(complexObject);
  JSON.parse(str);
});

// Array Operations Benchmarks
const largeArray = Array.from({ length: 10000 }, (_, i) => i);

suite.add('Array Filter - 10k elements', () => {
  largeArray.filter(n => n % 2 === 0);
});

suite.add('Array Map - 10k elements', () => {
  largeArray.map(n => n * 2);
});

suite.add('Array Reduce - 10k elements', () => {
  largeArray.reduce((sum, n) => sum + n, 0);
});

// Map vs Object Benchmarks
const testMap = new Map();
const testObj = {};

for (let i = 0; i < 1000; i++) {
  testMap.set(`key-${i}`, i);
  testObj[`key-${i}`] = i;
}

suite.add('Map - Get 1000 keys', () => {
  for (let i = 0; i < 1000; i++) {
    testMap.get(`key-${i}`);
  }
});

suite.add('Object - Get 1000 keys', () => {
  for (let i = 0; i < 1000; i++) {
    testObj[`key-${i}`];
  }
});

suite.add('Map - Set 1000 keys', () => {
  const map = new Map();
  for (let i = 0; i < 1000; i++) {
    map.set(`key-${i}`, i);
  }
});

suite.add('Object - Set 1000 keys', () => {
  const obj = {};
  for (let i = 0; i < 1000; i++) {
    obj[`key-${i}`] = i;
  }
});

/**
 * Configure benchmark events
 */

suite.on('cycle', (event) => {
  const benchmark = event.target;
  const hz = benchmark.hz.toLocaleString('en-US', { maximumFractionDigits: 0 });
  const rme = benchmark.stats.rme.toFixed(2);
  const samples = benchmark.stats.sample.length;

  console.log(`  ${benchmark.name}`);
  console.log(`    ${hz} ops/sec ±${rme}% (${samples} runs)`);
  console.log('');
});

suite.on('complete', function () {
  console.log('\n========== Benchmark Summary ==========\n');

  const fastest = this.filter('fastest');
  const slowest = this.filter('slowest');

  console.log(`Fastest: ${fastest.map('name')}`);
  console.log(`Slowest: ${slowest.map('name')}`);

  console.log('\n========== Performance Insights ==========\n');

  // Calculate category averages
  const categories = {
    'Shannon Entropy': [],
    'Biometric Analysis': [],
    'Genetic Fitness': [],
    'Cryptographic': [],
    'Object Pool': [],
    'JSON': [],
    'Array Operations': [],
    'Data Structures': [],
  };

  this.forEach((benchmark) => {
    const name = benchmark.name;
    if (name.includes('Shannon')) categories['Shannon Entropy'].push(benchmark.hz);
    if (name.includes('Biometric')) categories['Biometric Analysis'].push(benchmark.hz);
    if (name.includes('Genetic')) categories['Genetic Fitness'].push(benchmark.hz);
    if (name.includes('Hash') || name.includes('HMAC')) categories['Cryptographic'].push(benchmark.hz);
    if (name.includes('Pool')) categories['Object Pool'].push(benchmark.hz);
    if (name.includes('JSON')) categories['JSON'].push(benchmark.hz);
    if (name.includes('Array')) categories['Array Operations'].push(benchmark.hz);
    if (name.includes('Map') || name.includes('Object')) categories['Data Structures'].push(benchmark.hz);
  });

  Object.entries(categories).forEach(([category, ops]) => {
    if (ops.length > 0) {
      const avg = ops.reduce((a, b) => a + b, 0) / ops.length;
      console.log(`${category}: ${avg.toLocaleString('en-US', { maximumFractionDigits: 0 })} avg ops/sec`);
    }
  });

  console.log('\n========================================\n');
});

/**
 * Run benchmarks
 */
suite.run({ async: true });
