import { EventEmitter } from 'events';
import { Logger } from 'winston';
import { getRedisClient } from '../utils/redis';

interface BehaviorProfile {
  entityId: string;
  normalPatterns: {
    loginTimes: number[];
    accessLocations: string[];
    resourceUsage: number[];
    interactionFrequency: Map<string, number>;
  };
  anomalyScore: number;
  lastUpdated: Date;
}

interface AnomalyDetection {
  type: string;
  severity: number;
  confidence: number;
  description: string;
  quantumDeviation: number;
}

export class BehavioralAnomalyEngine extends EventEmitter {
  private profiles: Map<string, BehaviorProfile> = new Map();
  private logger: Logger;
  private quantumBaseline: number[] = [];

  constructor(logger: Logger) {
    super();
    this.logger = logger;
    this.initializeQuantumBaseline();
  }

  private initializeQuantumBaseline(): void {
    // Initialize quantum behavioral baseline
    this.quantumBaseline = Array(24).fill(0).map((_, hour) => {
      // Normal activity pattern with quantum fluctuations
      const baseActivity = Math.sin((hour / 24) * Math.PI * 2 + Math.PI / 2) * 0.5 + 0.5;
      const quantumNoise = (Math.random() - 0.5) * 0.1;
      return Math.max(0, Math.min(1, baseActivity + quantumNoise));
    });
  }

  async analyzeBehavior(entityId: string, activity: any): Promise<AnomalyDetection[]> {
    const anomalies: AnomalyDetection[] = [];
    
    // Get or create behavior profile
    let profile = this.profiles.get(entityId);
    if (!profile) {
      profile = await this.loadOrCreateProfile(entityId);
    }

    // Analyze login time anomalies
    const loginAnomaly = this.analyzeLoginTimeAnomaly(activity.loginTime, profile);
    if (loginAnomaly) anomalies.push(loginAnomaly);

    // Analyze location anomalies
    const locationAnomaly = this.analyzeLocationAnomaly(activity.location, profile);
    if (locationAnomaly) anomalies.push(locationAnomaly);

    // Analyze resource usage anomalies
    const usageAnomaly = this.analyzeResourceUsageAnomaly(activity.resourceUsage, profile);
    if (usageAnomaly) anomalies.push(usageAnomaly);

    // Analyze interaction pattern anomalies
    const interactionAnomaly = this.analyzeInteractionAnomaly(activity.interactions, profile);
    if (interactionAnomaly) anomalies.push(interactionAnomaly);

    // Quantum consciousness analysis
    const quantumAnomaly = this.analyzeQuantumConsciousness(activity, profile);
    if (quantumAnomaly) anomalies.push(quantumAnomaly);

    // Update profile with new data
    this.updateProfile(profile, activity);
    
    // Calculate overall anomaly score
    const overallScore = this.calculateOverallAnomalyScore(anomalies);
    profile.anomalyScore = overallScore;

    // Emit high-severity anomalies
    if (overallScore > 0.7) {
      this.emit('high_severity_anomaly', {
        entityId,
        anomalies,
        score: overallScore,
        timestamp: new Date()
      });
    }

    return anomalies;
  }

  private async loadOrCreateProfile(entityId: string): Promise<BehaviorProfile> {
    const redis = getRedisClient();
    const cached = await redis.get(`behavior:profile:${entityId}`);
    
    if (cached) {
      const profile = JSON.parse(cached);
      profile.interactionFrequency = new Map(profile.interactionFrequency);
      this.profiles.set(entityId, profile);
      return profile;
    }

    const newProfile: BehaviorProfile = {
      entityId,
      normalPatterns: {
        loginTimes: [],
        accessLocations: [],
        resourceUsage: [],
        interactionFrequency: new Map()
      },
      anomalyScore: 0,
      lastUpdated: new Date()
    };

    this.profiles.set(entityId, newProfile);
    return newProfile;
  }

  private analyzeLoginTimeAnomaly(loginTime: Date, profile: BehaviorProfile): AnomalyDetection | null {
    const hour = loginTime.getHours();
    const expectedActivity = this.quantumBaseline[hour];
    
    // Check if login time is unusual
    const loginHours = profile.normalPatterns.loginTimes;
    const isUnusualTime = loginHours.length > 10 && 
                         !loginHours.some(h => Math.abs(h - hour) <= 2);

    if (isUnusualTime) {
      const deviation = 1 - expectedActivity;
      return {
        type: 'unusual_login_time',
        severity: deviation > 0.7 ? 0.8 : 0.5,
        confidence: Math.min(0.9, loginHours.length / 50),
        description: `Login at unusual hour: ${hour}:00`,
        quantumDeviation: deviation
      };
    }

    return null;
  }

  private analyzeLocationAnomaly(location: string, profile: BehaviorProfile): AnomalyDetection | null {
    const knownLocations = profile.normalPatterns.accessLocations;
    
    if (knownLocations.length > 5 && !knownLocations.includes(location)) {
      // Check for impossible travel
      const lastLocation = knownLocations[knownLocations.length - 1];
      const travelTime = this.estimateTravelTime(lastLocation, location);
      
      if (travelTime === Infinity) {
        return {
          type: 'impossible_travel',
          severity: 0.9,
          confidence: 0.95,
          description: `Impossible travel: ${lastLocation} to ${location}`,
          quantumDeviation: 1.0
        };
      } else if (!knownLocations.includes(location)) {
        return {
          type: 'new_location',
          severity: 0.4,
          confidence: 0.7,
          description: `Access from new location: ${location}`,
          quantumDeviation: 0.5
        };
      }
    }

    return null;
  }

  private analyzeResourceUsageAnomaly(usage: number, profile: BehaviorProfile): AnomalyDetection | null {
    const historicalUsage = profile.normalPatterns.resourceUsage;
    
    if (historicalUsage.length > 20) {
      const avg = historicalUsage.reduce((a, b) => a + b, 0) / historicalUsage.length;
      const stdDev = Math.sqrt(
        historicalUsage.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / historicalUsage.length
      );
      
      const zScore = Math.abs((usage - avg) / stdDev);
      
      if (zScore > 3) {
        return {
          type: 'abnormal_resource_usage',
          severity: Math.min(0.9, zScore / 5),
          confidence: Math.min(0.9, historicalUsage.length / 100),
          description: `Abnormal resource usage: ${usage} (Z-score: ${zScore.toFixed(2)})`,
          quantumDeviation: zScore / 5
        };
      }
    }

    return null;
  }

  private analyzeInteractionAnomaly(interactions: string[], profile: BehaviorProfile): AnomalyDetection | null {
    const frequency = profile.normalPatterns.interactionFrequency;
    let anomalyCount = 0;
    
    for (const target of interactions) {
      if (!frequency.has(target) && frequency.size > 20) {
        anomalyCount++;
      }
    }

    if (anomalyCount > interactions.length * 0.5) {
      return {
        type: 'unusual_interaction_pattern',
        severity: 0.6,
        confidence: 0.8,
        description: `Unusual interactions with ${anomalyCount} new targets`,
        quantumDeviation: anomalyCount / interactions.length
      };
    }

    return null;
  }

  private analyzeQuantumConsciousness(activity: any, profile: BehaviorProfile): AnomalyDetection | null {
    // Simulate quantum consciousness analysis
    const activityVector = [
      activity.loginTime?.getHours() / 24 || 0,
      activity.resourceUsage / 100 || 0,
      activity.interactions?.length / 10 || 0,
      Math.random() // Quantum uncertainty
    ];

    const consciousness = activityVector.reduce((a, b) => a + b, 0) / activityVector.length;
    const expectedConsciousness = 0.5 + (Math.random() - 0.5) * 0.2;
    const deviation = Math.abs(consciousness - expectedConsciousness);

    if (deviation > 0.3) {
      return {
        type: 'consciousness_anomaly',
        severity: deviation,
        confidence: 0.7,
        description: 'Quantum consciousness pattern deviation detected',
        quantumDeviation: deviation
      };
    }

    return null;
  }

  private updateProfile(profile: BehaviorProfile, activity: any): void {
    // Update login times
    if (activity.loginTime) {
      profile.normalPatterns.loginTimes.push(activity.loginTime.getHours());
      // Keep last 100 entries
      if (profile.normalPatterns.loginTimes.length > 100) {
        profile.normalPatterns.loginTimes.shift();
      }
    }

    // Update locations
    if (activity.location && !profile.normalPatterns.accessLocations.includes(activity.location)) {
      profile.normalPatterns.accessLocations.push(activity.location);
      // Keep last 50 locations
      if (profile.normalPatterns.accessLocations.length > 50) {
        profile.normalPatterns.accessLocations.shift();
      }
    }

    // Update resource usage
    if (activity.resourceUsage !== undefined) {
      profile.normalPatterns.resourceUsage.push(activity.resourceUsage);
      // Keep last 200 entries
      if (profile.normalPatterns.resourceUsage.length > 200) {
        profile.normalPatterns.resourceUsage.shift();
      }
    }

    // Update interaction frequency
    if (activity.interactions) {
      for (const target of activity.interactions) {
        const count = profile.normalPatterns.interactionFrequency.get(target) || 0;
        profile.normalPatterns.interactionFrequency.set(target, count + 1);
      }
    }

    profile.lastUpdated = new Date();
    
    // Save to cache
    this.saveProfile(profile);
  }

  private async saveProfile(profile: BehaviorProfile): Promise<void> {
    const redis = getRedisClient();
    const serialized = {
      ...profile,
      normalPatterns: {
        ...profile.normalPatterns,
        interactionFrequency: Array.from(profile.normalPatterns.interactionFrequency)
      }
    };
    
    await redis.set(
      `behavior:profile:${profile.entityId}`,
      JSON.stringify(serialized),
      { EX: 86400 * 7 } // 7 days TTL
    );
  }

  private calculateOverallAnomalyScore(anomalies: AnomalyDetection[]): number {
    if (anomalies.length === 0) return 0;

    const weightedScore = anomalies.reduce((total, anomaly) => {
      return total + (anomaly.severity * anomaly.confidence);
    }, 0);

    return Math.min(1, weightedScore / anomalies.length);
  }

  private estimateTravelTime(from: string, to: string): number {
    // Simplified travel time estimation
    const locations: Record<string, { lat: number; lon: number }> = {
      'US-East': { lat: 40.7128, lon: -74.0060 },
      'US-West': { lat: 37.7749, lon: -122.4194 },
      'EU-Central': { lat: 52.5200, lon: 13.4050 },
      'Asia-Pacific': { lat: 35.6762, lon: 139.6503 }
    };

    const loc1 = locations[from];
    const loc2 = locations[to];

    if (!loc1 || !loc2) return 0;

    // Haversine distance
    const R = 6371; // Earth radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lon - loc1.lon) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    // Assume 900 km/h flight speed
    const flightTime = distance / 900;

    // Check if travel is impossible in given time
    if (flightTime < 0.1) { // Less than 6 minutes
      return Infinity;
    }

    return flightTime;
  }
}