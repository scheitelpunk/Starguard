import { EventEmitter } from 'events';
import { Logger } from 'winston';
import { BehavioralAnomalyEngine } from '../cybercrime/BehavioralAnomalyEngine';

interface FraudPattern {
  id: string;
  type: 'card_fraud' | 'identity_theft' | 'account_takeover' | 'synthetic_identity';
  indicators: string[];
  risk_weight: number;
}

interface FraudAnalysis {
  id: string;
  fraud_type: string;
  confidence: number;
  risk_score: number;
  indicators_matched: string[];
  recommendation: 'approve' | 'review' | 'decline';
  timestamp: Date;
}

export class FraudDetector extends EventEmitter {
  private logger: Logger;
  private behaviorEngine: BehavioralAnomalyEngine;
  private patterns: Map<string, FraudPattern> = new Map();

  constructor(logger: Logger, behaviorEngine: BehavioralAnomalyEngine) {
    super();
    this.logger = logger;
    this.behaviorEngine = behaviorEngine;
    this.initializeFraudPatterns();
  }

  private initializeFraudPatterns(): void {
    const patterns: FraudPattern[] = [
      {
        id: 'card-fraud-1',
        type: 'card_fraud',
        indicators: ['unusual_location', 'high_amount', 'merchant_mismatch'],
        risk_weight: 0.8
      },
      {
        id: 'identity-theft-1',
        type: 'identity_theft',
        indicators: ['personal_info_change', 'password_reset', 'new_device'],
        risk_weight: 0.9
      },
      {
        id: 'account-takeover-1',
        type: 'account_takeover',
        indicators: ['multiple_login_attempts', 'ip_change', 'behavior_change'],
        risk_weight: 0.85
      }
    ];

    patterns.forEach(p => this.patterns.set(p.id, p));
  }

  async analyzeTransaction(data: any): Promise<FraudAnalysis> {
    const indicators = await this.extractIndicators(data);
    const matchedPatterns = this.matchPatterns(indicators);
    
    // Get behavioral analysis
    const behaviorAnomalies = await this.behaviorEngine.analyzeBehavior(
      data.account_id,
      data
    );
    
    const riskScore = this.calculateFraudRisk(matchedPatterns, behaviorAnomalies);
    const confidence = this.calculateConfidence(matchedPatterns, indicators.length);
    
    const analysis: FraudAnalysis = {
      id: `fraud-${Date.now()}`,
      fraud_type: matchedPatterns[0]?.type || 'unknown',
      confidence,
      risk_score: riskScore,
      indicators_matched: indicators,
      recommendation: this.getRecommendation(riskScore),
      timestamp: new Date()
    };
    
    if (riskScore > 0.7) {
      this.emit('fraud_detected', analysis);
    }
    
    return analysis;
  }

  private async extractIndicators(data: any): Promise<string[]> {
    const indicators: string[] = [];
    
    // Location-based indicators
    if (data.location && data.previous_location) {
      const distance = this.calculateDistance(data.location, data.previous_location);
      if (distance > 1000) indicators.push('unusual_location');
    }
    
    // Amount-based indicators
    if (data.amount > data.average_amount * 3) {
      indicators.push('high_amount');
    }
    
    // Device indicators
    if (data.device_id !== data.known_device_id) {
      indicators.push('new_device');
    }
    
    // Behavioral indicators
    if (data.typing_speed_deviation > 50) {
      indicators.push('behavior_change');
    }
    
    return indicators;
  }

  private matchPatterns(indicators: string[]): FraudPattern[] {
    const matched: FraudPattern[] = [];
    
    this.patterns.forEach(pattern => {
      const matchCount = pattern.indicators.filter(
        ind => indicators.includes(ind)
      ).length;
      
      if (matchCount >= 2) {
        matched.push(pattern);
      }
    });
    
    return matched.sort((a, b) => b.risk_weight - a.risk_weight);
  }

  private calculateFraudRisk(patterns: FraudPattern[], anomalies: any[]): number {
    let risk = 0;
    
    // Pattern-based risk
    if (patterns.length > 0) {
      risk += patterns[0].risk_weight * 0.6;
    }
    
    // Anomaly-based risk
    const anomalyScore = anomalies.reduce((sum, a) => sum + a.severity, 0) / 
                        Math.max(1, anomalies.length);
    risk += anomalyScore * 0.4;
    
    return Math.min(1, risk);
  }

  private calculateConfidence(patterns: FraudPattern[], indicatorCount: number): number {
    if (patterns.length === 0) return 0.1;
    
    const patternConfidence = patterns[0].risk_weight;
    const indicatorConfidence = Math.min(1, indicatorCount / 5);
    
    return (patternConfidence + indicatorConfidence) / 2;
  }

  private getRecommendation(riskScore: number): 'approve' | 'review' | 'decline' {
    if (riskScore < 0.3) return 'approve';
    if (riskScore < 0.7) return 'review';
    return 'decline';
  }

  private calculateDistance(loc1: any, loc2: any): number {
    // Simple distance calculation
    const dx = loc1.lat - loc2.lat;
    const dy = loc1.lng - loc2.lng;
    return Math.sqrt(dx * dx + dy * dy) * 111; // Rough km conversion
  }
}