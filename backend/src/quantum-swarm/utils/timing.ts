/**
 * High-precision timing utilities for temporal analysis
 */
export class TimingAnalyzer {
  private static readonly NANOSECOND = 1000000;
  
  /**
   * Get high-resolution timestamp in nanoseconds
   * @returns Timestamp in nanoseconds
   */
  static getHighResTimestamp(): bigint {
    return process.hrtime.bigint();
  }

  /**
   * Calculate timing variance for a series of timestamps
   * @param timestamps - Array of timestamps
   * @returns Variance statistics
   */
  static calculateTimingVariance(timestamps: number[]): {
    mean: number;
    variance: number;
    standardDeviation: number;
    coefficientOfVariation: number;
  } {
    if (timestamps.length < 2) {
      return { mean: 0, variance: 0, standardDeviation: 0, coefficientOfVariation: 0 };
    }

    // Calculate intervals between timestamps
    const intervals = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }

    const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = mean !== 0 ? standardDeviation / mean : 0;

    return { mean, variance, standardDeviation, coefficientOfVariation };
  }

  /**
   * Detect timing anomalies using statistical analysis
   * @param intervals - Array of time intervals
   * @param threshold - Threshold multiplier for anomaly detection
   * @returns Array of anomaly indicators
   */
  static detectTimingAnomalies(intervals: number[], threshold: number = 2.5): boolean[] {
    if (intervals.length === 0) return [];

    const stats = this.calculateTimingVariance(intervals.map((_, i, arr) => 
      i === 0 ? 0 : intervals[i]
    ));

    return intervals.map(interval => 
      Math.abs(interval - stats.mean) > threshold * stats.standardDeviation
    );
  }

  /**
   * Analyze periodic patterns in timing data
   * @param timestamps - Array of timestamps
   * @returns Detected periods and their strengths
   */
  static analyzePeriodicPatterns(timestamps: number[]): {
    period: number;
    strength: number;
    confidence: number;
  }[] {
    if (timestamps.length < 10) return [];

    const intervals = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }

    // Simple autocorrelation-based period detection
    const patterns: { period: number; strength: number; confidence: number }[] = [];
    const maxLag = Math.min(intervals.length / 4, 100);

    for (let lag = 1; lag <= maxLag; lag++) {
      const correlation = this.calculateAutocorrelation(intervals, lag);
      if (correlation > 0.5) {
        patterns.push({
          period: lag,
          strength: correlation,
          confidence: Math.min(correlation * (intervals.length / (lag * 4)), 1.0)
        });
      }
    }

    return patterns.sort((a, b) => b.strength - a.strength).slice(0, 5);
  }

  /**
   * Calculate autocorrelation for a given lag
   * @param data - Time series data
   * @param lag - Lag value
   * @returns Correlation coefficient
   */
  private static calculateAutocorrelation(data: number[], lag: number): number {
    if (lag >= data.length) return 0;

    const n = data.length - lag;
    const mean1 = data.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const mean2 = data.slice(lag, lag + n).reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;

    for (let i = 0; i < n; i++) {
      const x1 = data[i] - mean1;
      const x2 = data[i + lag] - mean2;
      numerator += x1 * x2;
      denominator1 += x1 * x1;
      denominator2 += x2 * x2;
    }

    const denominator = Math.sqrt(denominator1 * denominator2);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Detect potential timing attacks
   * @param requestTimings - Array of request timing data
   * @param responseTimings - Array of response timing data
   * @returns Timing attack indicators
   */
  static detectTimingAttacks(
    requestTimings: number[],
    responseTimings: number[]
  ): {
    suspicious: boolean;
    correlationStrength: number;
    anomalyCount: number;
    riskScore: number;
  } {
    if (requestTimings.length !== responseTimings.length || requestTimings.length < 10) {
      return { suspicious: false, correlationStrength: 0, anomalyCount: 0, riskScore: 0 };
    }

    // Calculate correlation between request and response timings
    const correlation = this.calculateCorrelation(requestTimings, responseTimings);
    
    // Detect anomalies in response times
    const responseAnomalies = this.detectTimingAnomalies(responseTimings);
    const anomalyCount = responseAnomalies.filter(a => a).length;
    
    // Calculate risk score
    const anomalyRate = anomalyCount / responseTimings.length;
    const correlationFactor = Math.abs(correlation);
    const riskScore = (anomalyRate * 0.6) + (correlationFactor * 0.4);
    
    const suspicious = riskScore > 0.3 && anomalyCount > responseTimings.length * 0.1;

    return {
      suspicious,
      correlationStrength: correlation,
      anomalyCount,
      riskScore
    };
  }

  /**
   * Calculate Pearson correlation coefficient
   * @param x - First dataset
   * @param y - Second dataset
   * @returns Correlation coefficient
   */
  private static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;

    for (let i = 0; i < n; i++) {
      const deltaX = x[i] - meanX;
      const deltaY = y[i] - meanY;
      
      numerator += deltaX * deltaY;
      denominatorX += deltaX * deltaX;
      denominatorY += deltaY * deltaY;
    }

    const denominator = Math.sqrt(denominatorX * denominatorY);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Calculate jitter (timing variation) statistics
   * @param timestamps - Array of timestamps
   * @returns Jitter analysis results
   */
  static calculateJitter(timestamps: number[]): {
    maxJitter: number;
    avgJitter: number;
    jitterVariance: number;
    jitterDistribution: number[];
  } {
    if (timestamps.length < 3) {
      return { maxJitter: 0, avgJitter: 0, jitterVariance: 0, jitterDistribution: [] };
    }

    // Calculate second-order differences (jitter)
    const jitters = [];
    for (let i = 2; i < timestamps.length; i++) {
      const interval1 = timestamps[i - 1] - timestamps[i - 2];
      const interval2 = timestamps[i] - timestamps[i - 1];
      const jitter = Math.abs(interval2 - interval1);
      jitters.push(jitter);
    }

    const maxJitter = Math.max(...jitters);
    const avgJitter = jitters.reduce((sum, val) => sum + val, 0) / jitters.length;
    const jitterVariance = jitters.reduce((sum, val) => sum + Math.pow(val - avgJitter, 2), 0) / jitters.length;

    return {
      maxJitter,
      avgJitter,
      jitterVariance,
      jitterDistribution: jitters
    };
  }
}