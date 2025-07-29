import { EventEmitter } from 'events';
import { Logger } from 'winston';
import { getDatabase } from '../utils/database';

interface Transaction {
  id: string;
  from_account: string;
  to_account: string;
  amount: number;
  currency: string;
  timestamp: Date;
  metadata?: any;
}

interface AMLAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  transaction_ids: string[];
  risk_score: number;
  timestamp: Date;
}

export class AMLScanner extends EventEmitter {
  private logger: Logger;
  private riskThresholds = {
    low: 0.3,
    medium: 0.6,
    high: 0.8,
    critical: 0.95
  };

  constructor(logger: Logger) {
    super();
    this.logger = logger;
  }

  async scanTransaction(transaction: Transaction): Promise<AMLAlert[]> {
    const alerts: AMLAlert[] = [];
    
    // Check various AML patterns
    const structuringAlert = await this.checkStructuring(transaction);
    if (structuringAlert) alerts.push(structuringAlert);
    
    const velocityAlert = await this.checkVelocity(transaction);
    if (velocityAlert) alerts.push(velocityAlert);
    
    const layeringAlert = await this.checkLayering(transaction);
    if (layeringAlert) alerts.push(layeringAlert);
    
    const riskScore = this.calculateRiskScore(transaction);
    if (riskScore > this.riskThresholds.medium) {
      alerts.push(this.createRiskAlert(transaction, riskScore));
    }
    
    // Emit alerts
    alerts.forEach(alert => {
      this.emit('aml_alert', alert);
    });
    
    return alerts;
  }

  private async checkStructuring(transaction: Transaction): Promise<AMLAlert | null> {
    const db = await getDatabase();
    
    // Check for multiple transactions just below reporting threshold
    const result = await db.query(
      `SELECT COUNT(*) as count, SUM(amount) as total
       FROM transactions
       WHERE from_account = $1
       AND timestamp > NOW() - INTERVAL '24 hours'
       AND amount < 10000
       AND amount > 9000`,
      [transaction.from_account]
    );
    
    if (result.rows[0].count > 3) {
      return {
        id: `aml-${Date.now()}`,
        severity: 'high',
        type: 'structuring',
        description: 'Multiple transactions just below reporting threshold',
        transaction_ids: [transaction.id],
        risk_score: 0.85,
        timestamp: new Date()
      };
    }
    
    return null;
  }

  private async checkVelocity(transaction: Transaction): Promise<AMLAlert | null> {
    const db = await getDatabase();
    
    // Check transaction velocity
    const result = await db.query(
      `SELECT COUNT(*) as count
       FROM transactions
       WHERE from_account = $1
       AND timestamp > NOW() - INTERVAL '1 hour'`,
      [transaction.from_account]
    );
    
    if (result.rows[0].count > 20) {
      return {
        id: `aml-${Date.now()}`,
        severity: 'medium',
        type: 'high_velocity',
        description: 'Unusually high transaction frequency',
        transaction_ids: [transaction.id],
        risk_score: 0.65,
        timestamp: new Date()
      };
    }
    
    return null;
  }

  private async checkLayering(transaction: Transaction): Promise<AMLAlert | null> {
    // Simplified layering detection
    if (transaction.metadata?.hop_count > 5) {
      return {
        id: `aml-${Date.now()}`,
        severity: 'high',
        type: 'layering',
        description: 'Complex transaction layering detected',
        transaction_ids: [transaction.id],
        risk_score: 0.8,
        timestamp: new Date()
      };
    }
    
    return null;
  }

  private calculateRiskScore(transaction: Transaction): number {
    let score = 0;
    
    // Amount-based risk
    if (transaction.amount > 50000) score += 0.3;
    if (transaction.amount > 100000) score += 0.2;
    
    // Currency risk
    if (['XMR', 'ZEC', 'DASH'].includes(transaction.currency)) {
      score += 0.2; // Privacy coins
    }
    
    // Time-based risk (odd hours)
    const hour = transaction.timestamp.getHours();
    if (hour < 6 || hour > 22) score += 0.1;
    
    return Math.min(1, score);
  }

  private createRiskAlert(transaction: Transaction, riskScore: number): AMLAlert {
    let severity: AMLAlert['severity'] = 'low';
    
    if (riskScore > this.riskThresholds.critical) severity = 'critical';
    else if (riskScore > this.riskThresholds.high) severity = 'high';
    else if (riskScore > this.riskThresholds.medium) severity = 'medium';
    
    return {
      id: `aml-${Date.now()}`,
      severity,
      type: 'risk_threshold',
      description: `Transaction exceeds risk threshold: ${(riskScore * 100).toFixed(1)}%`,
      transaction_ids: [transaction.id],
      risk_score: riskScore,
      timestamp: new Date()
    };
  }
}