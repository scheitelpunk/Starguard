/**
 * Keystroke Dynamics Analyzer
 * Analyzes typing patterns including dwell times, flight times, and digraphs
 */

import {
  KeystrokeEvent,
  KeystrokeDynamicsProfile,
  StatisticalMeasures,
  AnalysisScore,
  BiometricProfile
} from './biometric-types';

export class KeystrokeAnalyzer {
  constructor(private minSampleSize: number = 50) {}

  /**
   * Build keystroke dynamics profile from events
   */
  public async buildKeystrokeDynamicsProfile(
    events: KeystrokeEvent[]
  ): Promise<KeystrokeDynamicsProfile> {
    const dwellTimes = new Map<string, number[]>();
    const flightTimes: number[] = [];
    const pressurePatterns = new Map<string, number[]>();
    const typingRhythm: number[] = [];
    const digraphTimes = new Map<string, number[]>();

    // Process events to extract timing patterns
    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      // Collect dwell times
      if (event.dwellTime) {
        if (!dwellTimes.has(event.key)) {
          dwellTimes.set(event.key, []);
        }
        dwellTimes.get(event.key)!.push(event.dwellTime);
      }

      // Collect flight times
      if (event.flightTime) {
        flightTimes.push(event.flightTime);
      }

      // Collect pressure patterns
      if (event.pressure) {
        if (!pressurePatterns.has(event.key)) {
          pressurePatterns.set(event.key, []);
        }
        pressurePatterns.get(event.key)!.push(event.pressure);
      }

      // Build digraph timing (two-character combinations)
      if (i > 0 && event.eventType === 'keydown') {
        const prevEvent = events[i - 1];
        if (prevEvent.eventType === 'keydown') {
          const digraph = prevEvent.key + event.key;
          const digraphTime = event.timestamp - prevEvent.timestamp;

          if (!digraphTimes.has(digraph)) {
            digraphTimes.set(digraph, []);
          }
          digraphTimes.get(digraph)!.push(digraphTime);
        }
      }
    }

    // Convert to statistical measures
    return {
      dwellTimes: this.convertToStatisticalMeasures(dwellTimes),
      flightTimes: this.calculateStatisticalMeasures(flightTimes),
      pressurePatterns: this.convertToStatisticalMeasures(pressurePatterns),
      typingRhythm: this.calculateStatisticalMeasures(flightTimes),
      commonDigraphs: this.convertToStatisticalMeasures(digraphTimes)
    };
  }

  /**
   * Analyze keystroke dynamics against profile
   */
  public async analyzeKeystrokeDynamics(
    sessionEvents: KeystrokeEvent[],
    profile: BiometricProfile
  ): Promise<AnalysisScore> {
    const anomalies: string[] = [];
    let totalScore = 0;
    let scoreCount = 0;

    // Analyze recent keystroke events
    const recentEvents = sessionEvents.slice(-50);

    // Build temporary profile from recent events
    const tempProfile = await this.buildKeystrokeDynamicsProfile(recentEvents);

    // Compare dwell times
    for (const [key, measures] of tempProfile.dwellTimes) {
      const profileMeasures = profile.keystrokeDynamics.dwellTimes.get(key);
      if (profileMeasures) {
        const deviation = Math.abs(measures.mean - profileMeasures.mean) / profileMeasures.stdDev;

        if (deviation > 2) {
          anomalies.push(`DWELL_TIME_ANOMALY_${key}`);
        }

        totalScore += Math.max(0, 1 - (deviation / 3));
        scoreCount++;
      }
    }

    // Compare typing rhythm
    const rhythmDeviation = Math.abs(
      tempProfile.typingRhythm.mean - profile.keystrokeDynamics.typingRhythm.mean
    ) / profile.keystrokeDynamics.typingRhythm.stdDev;

    if (rhythmDeviation > 2) {
      anomalies.push('TYPING_RHYTHM_ANOMALY');
    }

    totalScore += Math.max(0, 1 - (rhythmDeviation / 3));
    scoreCount++;

    // Compare common digraphs
    for (const [digraph, measures] of tempProfile.commonDigraphs) {
      const profileMeasures = profile.keystrokeDynamics.commonDigraphs.get(digraph);
      if (profileMeasures) {
        const deviation = Math.abs(measures.mean - profileMeasures.mean) / profileMeasures.stdDev;

        if (deviation > 2.5) {
          anomalies.push(`DIGRAPH_TIMING_ANOMALY_${digraph}`);
        }

        totalScore += Math.max(0, 1 - (deviation / 3));
        scoreCount++;
      }
    }

    const confidence = scoreCount > 0 ? totalScore / scoreCount : 0;

    return { confidence, anomalies };
  }

  /**
   * Enrich keystroke event with timing and pattern analysis
   */
  public enrichKeystrokeEvent(
    event: KeystrokeEvent,
    sessionEvents: KeystrokeEvent[]
  ): KeystrokeEvent {
    // Calculate dwell time (if this is a keyup event)
    if (event.eventType === 'keyup') {
      const correspondingKeydown = sessionEvents
        .slice()
        .reverse()
        .find(e => e.key === event.key && e.eventType === 'keydown');

      if (correspondingKeydown) {
        event.dwellTime = event.timestamp - correspondingKeydown.timestamp;
      }
    }

    // Calculate flight time (time between key release and next key press)
    if (event.eventType === 'keydown' && sessionEvents.length > 0) {
      const lastKeyup = sessionEvents
        .slice()
        .reverse()
        .find(e => e.eventType === 'keyup');

      if (lastKeyup) {
        event.flightTime = event.timestamp - lastKeyup.timestamp;
      }
    }

    return event;
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

  /**
   * Convert maps to statistical measures
   */
  private convertToStatisticalMeasures(
    dataMap: Map<string, number[]>
  ): Map<string, StatisticalMeasures> {
    const result = new Map<string, StatisticalMeasures>();

    for (const [key, values] of dataMap) {
      result.set(key, this.calculateStatisticalMeasures(values));
    }

    return result;
  }
}
