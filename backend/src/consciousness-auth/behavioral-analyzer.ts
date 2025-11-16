/**
 * Behavioral Pattern Analyzer
 * Analyzes user behavior patterns including session duration and activity patterns
 */

import {
  AuthenticationSession,
  BehavioralPatternProfile,
  StatisticalMeasures,
  AnalysisScore,
  BiometricProfile
} from './biometric-types';

export class BehavioralAnalyzer {
  constructor(private minSampleSize: number = 50) {}

  /**
   * Build behavioral pattern profile from session data
   */
  public async buildBehavioralPatternProfile(
    session: AuthenticationSession
  ): Promise<BehavioralPatternProfile> {
    const sessionDuration = Date.now() - session.startTime;
    const activityPattern = new Map<number, number>();

    // Calculate activity by hour
    const startHour = new Date(session.startTime).getHours();
    activityPattern.set(startHour, (activityPattern.get(startHour) || 0) + 1);

    // Calculate error patterns (backspace usage)
    const errorEvents = session.keystrokeEvents.filter(e =>
      e.key === 'Backspace' || e.key === 'Delete'
    );
    const errorRate = errorEvents.length / Math.max(session.keystrokeEvents.length, 1);

    // Calculate interaction frequency
    const totalEvents = session.keystrokeEvents.length + session.mouseEvents.length;
    const interactionFrequency = totalEvents / Math.max(sessionDuration / 1000, 1);

    return {
      sessionDuration: this.calculateStatisticalMeasures([sessionDuration]),
      activityPattern,
      errorRate: this.calculateStatisticalMeasures([errorRate]),
      interactionFrequency: this.calculateStatisticalMeasures([interactionFrequency]),
      multitaskingPattern: this.calculateStatisticalMeasures([0]),
      focusMetrics: this.calculateStatisticalMeasures([0])
    };
  }

  /**
   * Analyze behavioral patterns against profile
   */
  public async analyzeBehavioralPattern(
    session: AuthenticationSession,
    profile: BiometricProfile
  ): Promise<AnalysisScore> {
    const anomalies: string[] = [];
    let totalScore = 0;
    let scoreCount = 0;

    // Build current session behavioral profile
    const tempProfile = await this.buildBehavioralPatternProfile(session);

    // Compare session duration patterns
    const currentDuration = Date.now() - session.startTime;
    const durationDeviation = Math.abs(
      currentDuration - profile.behavioralPattern.sessionDuration.mean
    ) / profile.behavioralPattern.sessionDuration.stdDev;

    if (durationDeviation > 2) {
      anomalies.push('SESSION_DURATION_ANOMALY');
    }

    totalScore += Math.max(0, 1 - (durationDeviation / 3));
    scoreCount++;

    // Compare activity patterns (time of day)
    const currentHour = new Date().getHours();
    const expectedActivity = profile.behavioralPattern.activityPattern.get(currentHour) || 0;

    if (expectedActivity === 0) {
      anomalies.push('UNUSUAL_ACTIVITY_TIME');
      totalScore += 0.3;
    } else {
      totalScore += 0.8;
    }
    scoreCount++;

    // Compare error rates
    const errorDeviation = Math.abs(
      tempProfile.errorRate.mean - profile.behavioralPattern.errorRate.mean
    ) / Math.max(profile.behavioralPattern.errorRate.stdDev, 0.01);

    if (errorDeviation > 2) {
      anomalies.push('ERROR_RATE_ANOMALY');
    }

    totalScore += Math.max(0, 1 - (errorDeviation / 3));
    scoreCount++;

    const confidence = scoreCount > 0 ? totalScore / scoreCount : 0;

    return { confidence, anomalies };
  }

  /**
   * Update statistical measures with exponential moving average
   */
  public updateStatisticalMeasures(
    existing: StatisticalMeasures,
    newData: StatisticalMeasures,
    alpha: number
  ): void {
    if (newData.samples === 0) return;

    existing.mean = existing.mean * (1 - alpha) + newData.mean * alpha;
    existing.stdDev = existing.stdDev * (1 - alpha) + newData.stdDev * alpha;
    existing.samples += newData.samples;
    existing.confidence = Math.min(existing.samples / this.minSampleSize, 1.0);
  }

  /**
   * Calculate statistical measures
   */
  private calculateStatisticalMeasures(values: number[]): StatisticalMeasures {
    if (values.length === 0) {
      return { mean: 0, stdDev: 0, min: 0, max: 0, samples: 0, confidence: 0 };
    }

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const confidence = Math.min(values.length / this.minSampleSize, 1.0);

    return { mean, stdDev, min, max, samples: values.length, confidence };
  }
}
