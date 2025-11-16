/**
 * Mouse Movement Analyzer
 * Analyzes mouse patterns including velocity, acceleration, and trajectories
 */

import {
  MouseEvent,
  MouseMovementProfile,
  StatisticalMeasures,
  AnalysisScore,
  BiometricProfile
} from './biometric-types';

export class MouseAnalyzer {
  constructor(private minSampleSize: number = 50) {}

  /**
   * Build mouse movement profile from events
   */
  public async buildMouseMovementProfile(events: MouseEvent[]): Promise<MouseMovementProfile> {
    const velocities: number[] = [];
    const accelerations: number[] = [];
    const trajectoryAngles: number[] = [];
    const clickIntervals: number[] = [];
    const scrollPatterns: number[] = [];
    const pauseDurations: number[] = [];

    let lastClickTime = 0;
    let lastMoveTime = 0;
    let movementSmoothing = 0;
    let smoothMovements = 0;
    let jitterMovements = 0;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      // Collect velocities and accelerations
      if (event.velocity !== undefined) {
        velocities.push(event.velocity);

        // Analyze movement smoothing (jitter detection)
        if (event.velocity > 0.1) {
          if (event.acceleration !== undefined && Math.abs(event.acceleration) < 0.001) {
            smoothMovements++;
          } else {
            jitterMovements++;
          }
        }
      }

      if (event.acceleration !== undefined) {
        accelerations.push(event.acceleration);
      }

      // Calculate trajectory angles
      if (i > 1 && event.eventType === 'move') {
        const prev1 = events[i - 1];
        const prev2 = events[i - 2];

        if (prev1.eventType === 'move' && prev2.eventType === 'move') {
          const angle1 = Math.atan2(prev1.y - prev2.y, prev1.x - prev2.x);
          const angle2 = Math.atan2(event.y - prev1.y, event.x - prev1.x);
          const angleDiff = Math.abs(angle2 - angle1);
          trajectoryAngles.push(angleDiff);
        }
      }

      // Collect click patterns
      if (event.eventType === 'click') {
        if (lastClickTime > 0) {
          clickIntervals.push(event.timestamp - lastClickTime);
        }
        lastClickTime = event.timestamp;
      }

      // Collect scroll patterns
      if (event.eventType === 'scroll') {
        if (scrollPatterns.length > 0) {
          const lastScroll = events.slice(0, i).reverse().find(e => e.eventType === 'scroll');
          if (lastScroll) {
            scrollPatterns.push(event.timestamp - lastScroll.timestamp);
          }
        }
      }

      // Calculate pause durations
      if (event.eventType === 'move') {
        if (lastMoveTime > 0) {
          const interval = event.timestamp - lastMoveTime;
          if (interval > 100) {
            pauseDurations.push(interval);
          }
        }
        lastMoveTime = event.timestamp;
      }
    }

    // Calculate movement smoothing ratio
    movementSmoothing = smoothMovements / Math.max(smoothMovements + jitterMovements, 1);

    return {
      velocity: this.calculateStatisticalMeasures(velocities),
      acceleration: this.calculateStatisticalMeasures(accelerations),
      trajectoryAngles: this.calculateStatisticalMeasures(trajectoryAngles),
      clickPatterns: this.calculateStatisticalMeasures(clickIntervals),
      scrollingBehavior: this.calculateStatisticalMeasures(scrollPatterns),
      pauseDuration: this.calculateStatisticalMeasures(pauseDurations),
      movementSmoothing
    };
  }

  /**
   * Analyze mouse movement against profile
   */
  public async analyzeMouseMovement(
    sessionEvents: MouseEvent[],
    profile: BiometricProfile
  ): Promise<AnalysisScore> {
    const anomalies: string[] = [];
    let totalScore = 0;
    let scoreCount = 0;

    // Analyze recent mouse events
    const recentEvents = sessionEvents.slice(-100);

    if (recentEvents.length === 0) {
      return { confidence: 0.5, anomalies: ['NO_MOUSE_DATA'] };
    }

    // Build temporary profile from recent events
    const tempProfile = await this.buildMouseMovementProfile(recentEvents);

    // Compare velocity patterns
    const velocityDeviation = Math.abs(
      tempProfile.velocity.mean - profile.mouseMovement.velocity.mean
    ) / profile.mouseMovement.velocity.stdDev;

    if (velocityDeviation > 2) {
      anomalies.push('MOUSE_VELOCITY_ANOMALY');
    }

    totalScore += Math.max(0, 1 - (velocityDeviation / 3));
    scoreCount++;

    // Compare acceleration patterns
    const accelerationDeviation = Math.abs(
      tempProfile.acceleration.mean - profile.mouseMovement.acceleration.mean
    ) / profile.mouseMovement.acceleration.stdDev;

    if (accelerationDeviation > 2) {
      anomalies.push('MOUSE_ACCELERATION_ANOMALY');
    }

    totalScore += Math.max(0, 1 - (accelerationDeviation / 3));
    scoreCount++;

    // Compare movement smoothing
    const smoothingDiff = Math.abs(
      tempProfile.movementSmoothing - profile.mouseMovement.movementSmoothing
    );

    if (smoothingDiff > 0.3) {
      anomalies.push('MOUSE_SMOOTHING_ANOMALY');
    }

    totalScore += Math.max(0, 1 - (smoothingDiff / 0.5));
    scoreCount++;

    const confidence = scoreCount > 0 ? totalScore / scoreCount : 0;

    return { confidence, anomalies };
  }

  /**
   * Enrich mouse event with velocity and acceleration data
   */
  public enrichMouseEvent(
    event: MouseEvent,
    sessionEvents: MouseEvent[]
  ): MouseEvent {
    if (event.eventType === 'move' && sessionEvents.length > 0) {
      const lastEvent = sessionEvents[sessionEvents.length - 1];

      if (lastEvent.eventType === 'move') {
        const deltaTime = event.timestamp - lastEvent.timestamp;
        const deltaX = event.x - lastEvent.x;
        const deltaY = event.y - lastEvent.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Calculate velocity (pixels per millisecond)
        event.velocity = deltaTime > 0 ? distance / deltaTime : 0;

        // Calculate acceleration
        if (lastEvent.velocity !== undefined) {
          event.acceleration = (event.velocity - lastEvent.velocity) / deltaTime;
        }
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
}
