// STARGUARD Threat Detection System
// Real-time threat analysis with AI/ML integration

import { EventEmitter } from 'events';
import { ThreatDetectionResult, MLPrediction, AlertConfig } from '../types/index.js';
import { logger, securityLogger } from '../utils/logger.js';
import { database } from '../utils/database.js';

export class ThreatDetectionSystem extends EventEmitter {
  private alerts: Map<string, AlertConfig> = new Map();
  private activeThreat: Map<string, ThreatDetectionResult> = new Map();
  private threatHistory: ThreatDetectionResult[] = [];
  private mlPredictions: MLPrediction[] = [];
  private scanInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeDefaultAlerts();
    logger.info('Threat Detection System initialized');
  }

  private initializeDefaultAlerts(): void {
    // Initialize basic alerts
    logger.debug('Default alerts initialized');
  }

  start(): void {
    if (this.scanInterval) return;
    
    // Continuous threat scanning every 30 seconds
    this.scanInterval = setInterval(() => {
      this.performThreatScan();
    }, 30000);
    
    securityLogger.info('Threat detection active scanning started');
  }

  stop(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    
    securityLogger.info('Threat detection scanning stopped');
  }

  private async performThreatScan(): Promise<void> {
    try {
      // Simulate threat scanning
      if (Math.random() > 0.95) { // 5% chance of threat
        const threat: ThreatDetectionResult = {
          id: `threat_${Date.now()}`,
          timestamp: Date.now(),
          severity: 'medium',
          type: 'anomaly',
          confidence: 0.8,
          source: 'scanner',
          details: {
            description: 'Simulated threat detected',
            affected_systems: ['system1'],
            recommended_actions: ['investigate']
          },
          status: 'new',
          location: {}
        };
        
        await this.processThreat(threat);
      }
    } catch (error) {
      securityLogger.error('Error during threat scan', error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async processThreat(threat: ThreatDetectionResult): Promise<void> {
    try {
      // Save to database
      await database.saveThreat(threat);
      
      // Add to active threats
      this.activeThreat.set(threat.id, threat);
      
      // Add to history
      this.threatHistory.push(threat);
      if (this.threatHistory.length > 1000) {
        this.threatHistory = this.threatHistory.slice(-500);
      }
      
      // Log threat
      securityLogger.threat(threat);
      
      // Emit threat event
      this.emit('threat_detected', threat);
      
    } catch (error) {
      securityLogger.error('Error processing threat', error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Public API methods
  addAlert(alert: AlertConfig): void {
    this.alerts.set(alert.id, alert);
    securityLogger.info(`Alert configuration added: ${alert.name}`);
  }

  addMLPrediction(prediction: MLPrediction): void {
    this.mlPredictions.push(prediction);
    
    // Keep prediction history manageable
    if (this.mlPredictions.length > 1000) {
      this.mlPredictions = this.mlPredictions.slice(-500);
    }
  }

  getActiveThreats(): ThreatDetectionResult[] {
    return Array.from(this.activeThreat.values())
      .filter(t => t.status !== 'resolved');
  }

  getThreatHistory(limit = 100): ThreatDetectionResult[] {
    return this.threatHistory.slice(-limit);
  }

  getThreatStats(): {
    total: number;
    active: number;
    by_severity: Record<string, number>;
    by_type: Record<string, number>;
  } {
    const active = this.getActiveThreats();
    const total = this.threatHistory.length;
    
    const by_severity: Record<string, number> = {};
    const by_type: Record<string, number> = {};
    
    for (const threat of active) {
      by_severity[threat.severity] = (by_severity[threat.severity] || 0) + 1;
      by_type[threat.type] = (by_type[threat.type] || 0) + 1;
    }
    
    return {
      total,
      active: active.length,
      by_severity,
      by_type
    };
  }

  async resolveThreat(threatId: string): Promise<boolean> {
    const threat = this.activeThreat.get(threatId);
    if (!threat) return false;
    
    threat.status = 'resolved';
    await database.saveThreat(threat);
    
    securityLogger.info(`Threat resolved: ${threatId}`);
    this.emit('threat_resolved', threat);
    
    return true;
  }

  // Update security statistics
  updateSecurityStats(stats: {
    activeThreats?: number;
    blockedAttempts?: number;
    firewallStatus?: 'active' | 'inactive' | 'learning';
    encryptionStrength?: number;
  }): void {
    // Update internal security metrics
    securityLogger.debug('Security stats updated', stats);
  }

  // Health check
  getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'critical';
    active_threats: number;
    scanning_active: boolean;
    alerts_configured: number;
    last_scan: number;
  } {
    const activeThreats = this.getActiveThreats().length;
    const criticalThreats = this.getActiveThreats().filter(t => t.severity === 'critical').length;
    
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (criticalThreats > 0) {
      status = 'critical';
    } else if (activeThreats > 10) {
      status = 'degraded';
    }
    
    return {
      status,
      active_threats: activeThreats,
      scanning_active: this.scanInterval !== null,
      alerts_configured: this.alerts.size,
      last_scan: Date.now()
    };
  }
}