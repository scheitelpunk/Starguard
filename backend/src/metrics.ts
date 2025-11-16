// STARGUARD System Metrics Collector
// Real-time system monitoring optimized for 8GB RAM

import { EventEmitter } from 'events';
import { cpus, totalmem, freemem, loadavg } from 'os';
import { SystemMetrics } from '../types/index.js';
import { logger, metricsLogger } from '../utils/logger.js';
import { database } from '../utils/database.js';

export class MetricsCollector extends EventEmitter {
  private metricsInterval: NodeJS.Timeout | null = null;
  private networkStats = {
    bytesIn: 0,
    bytesOut: 0,
    connections: 0,
    lastUpdate: Date.now()
  };
  private quantumStats = {
    coherenceTime: 100, // microseconds
    gateFidelity: 0.999,
    errorRate: 0.001,
    lastCalibration: Date.now()
  };
  private aiStats = {
    inferenceSpeed: 50, // milliseconds
    modelAccuracy: 0.95,
    trainingProgress: 0,
    lastTraining: 0
  };
  private securityStats = {
    activeThreats: 0,
    blockedAttempts: 0,
    firewallStatus: 'active' as 'active' | 'inactive' | 'learning',
    encryptionStrength: 256
  };
  private performanceHistory: SystemMetrics[] = [];
  private readonly MAX_HISTORY = 1000; // Keep last 1000 metrics in memory

  constructor() {
    super();
    logger.info('System Metrics Collector initialized');
  }

  start(): void {
    if (this.metricsInterval) return;
    
    // Collect metrics every 10 seconds
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, 10000);
    
    // Initial collection
    this.collectMetrics();
    
    metricsLogger.info('Metrics collection started');
  }

  stop(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    
    metricsLogger.info('Metrics collection stopped');
  }

  private async collectMetrics(): Promise<void> {
    try {
      const timestamp = Date.now();
      
      // Collect system metrics
      const cpuUsage = this.getCPUUsage();
      const memoryUsage = this.getMemoryUsage();
      const networkActivity = this.getNetworkActivity();
      
      // Update simulated quantum processor stats
      this.updateQuantumStats();
      
      // Update AI performance stats
      this.updateAIStats();
      
      // Create metrics object
      const metrics: SystemMetrics = {
        timestamp,
        cpu_usage: cpuUsage,
        memory_usage: memoryUsage,
        network_activity: networkActivity,
        quantum_processor: {
          coherence_time: this.quantumStats.coherenceTime,
          gate_fidelity: this.quantumStats.gateFidelity,
          error_rate: this.quantumStats.errorRate
        },
        ai_performance: {
          inference_speed: this.aiStats.inferenceSpeed,
          model_accuracy: this.aiStats.modelAccuracy,
          training_progress: this.aiStats.trainingProgress
        },
        security_status: {
          active_threats: this.securityStats.activeThreats,
          blocked_attempts: this.securityStats.blockedAttempts,
          firewall_status: this.securityStats.firewallStatus,
          encryption_strength: this.securityStats.encryptionStrength
        }
      };
      
      // Save to database
      await database.saveMetrics(metrics);
      
      // Add to performance history
      this.performanceHistory.push(metrics);
      if (this.performanceHistory.length > this.MAX_HISTORY) {
        this.performanceHistory = this.performanceHistory.slice(-this.MAX_HISTORY / 2);
      }
      
      // Emit metrics event
      this.emit('metrics_update', metrics);
      
      // Log metrics (debug level to avoid spam)
      metricsLogger.metrics(metrics);
      
      // Check for performance issues
      this.checkPerformanceAlerts(metrics);
      
    } catch (error) {
      metricsLogger.error('Error collecting metrics', error instanceof Error ? error : new Error(String(error)));
    }
  }

  private getCPUUsage(): number {
    // Get system load average
    const loads = loadavg();
    const cpuCount = cpus().length;
    
    // Calculate CPU usage as percentage (1-minute load average)
    const usage = (loads[0] / cpuCount) * 100;
    
    // Cap at 100%
    return Math.min(100, Math.max(0, usage));
  }

  private getMemoryUsage(): number {
    const total = totalmem();
    const free = freemem();
    const used = total - free;
    
    // Return memory usage as percentage
    return (used / total) * 100;
  }

  private getNetworkActivity(): {
    incoming: number;
    outgoing: number;
    connections: number;
  } {
    const now = Date.now();
    const timeDelta = (now - this.networkStats.lastUpdate) / 1000; // seconds
    
    // Simulate network activity with some randomness
    const baseIncoming = 1024 * 1024; // 1MB/s base
    const baseOutgoing = 512 * 1024;  // 512KB/s base
    
    const incoming = baseIncoming + (Math.random() * baseIncoming * 0.5);
    const outgoing = baseOutgoing + (Math.random() * baseOutgoing * 0.5);
    
    // Simulate connection count
    const connections = Math.floor(50 + (Math.random() * 200));
    
    this.networkStats = {
      bytesIn: this.networkStats.bytesIn + (incoming * timeDelta),
      bytesOut: this.networkStats.bytesOut + (outgoing * timeDelta),
      connections,
      lastUpdate: now
    };
    
    return {
      incoming,
      outgoing,
      connections
    };
  }

  private updateQuantumStats(): void {
    // Simulate quantum processor degradation and recovery
    const time = Date.now();
    const timeSinceCalibration = time - this.quantumStats.lastCalibration;
    
    // Coherence time degrades over time, recovers with calibration
    if (timeSinceCalibration > 3600000) { // 1 hour
      this.quantumStats.coherenceTime *= 0.99; // Slight degradation
    } else {
      this.quantumStats.coherenceTime = Math.min(120, this.quantumStats.coherenceTime * 1.001);
    }
    
    // Gate fidelity affected by environmental factors
    const envNoise = Math.random() * 0.001;
    this.quantumStats.gateFidelity = Math.max(0.99, 
      Math.min(0.9999, this.quantumStats.gateFidelity + (Math.random() * 0.0001) - envNoise));
    
    // Error rate inversely related to gate fidelity
    this.quantumStats.errorRate = 1 - this.quantumStats.gateFidelity;
    
    // Periodic calibration
    if (Math.random() > 0.999) { // 0.1% chance per collection
      this.quantumStats.lastCalibration = time;
      this.quantumStats.coherenceTime = 120;
      this.quantumStats.gateFidelity = 0.9999;
      metricsLogger.info('Quantum processor calibration performed');
    }
  }

  private updateAIStats(): void {
    // Simulate AI model performance variations
    
    // Inference speed varies with system load
    const cpuLoad = this.getCPUUsage();
    const baseInferenceSpeed = 45;
    this.aiStats.inferenceSpeed = baseInferenceSpeed + (cpuLoad * 0.3);
    
    // Model accuracy slowly improves with training
    if (this.aiStats.trainingProgress > 0) {
      this.aiStats.modelAccuracy = Math.min(0.99, 
        this.aiStats.modelAccuracy + (this.aiStats.trainingProgress * 0.0001));
    }
    
    // Random training sessions
    if (Math.random() > 0.95 && this.aiStats.trainingProgress === 0) {
      this.aiStats.trainingProgress = 0.1;
      this.aiStats.lastTraining = Date.now();
      metricsLogger.info('AI model training started');
    }
    
    // Update training progress
    if (this.aiStats.trainingProgress > 0 && this.aiStats.trainingProgress < 1) {
      this.aiStats.trainingProgress += 0.05;
      if (this.aiStats.trainingProgress >= 1) {
        this.aiStats.trainingProgress = 0;
        metricsLogger.info('AI model training completed');
      }
    }
  }

  private checkPerformanceAlerts(metrics: SystemMetrics): void {
    // CPU usage alert
    if (metrics.cpu_usage > 90) {
      this.emit('performance_alert', {
        type: 'high_cpu',
        severity: 'high',
        value: metrics.cpu_usage,
        threshold: 90,
        message: 'CPU usage critically high'
      });
    }
    
    // Memory usage alert
    if (metrics.memory_usage > 85) {
      this.emit('performance_alert', {
        type: 'high_memory',
        severity: metrics.memory_usage > 95 ? 'critical' : 'high',
        value: metrics.memory_usage,
        threshold: 85,
        message: 'Memory usage high - approaching 8GB limit'
      });
    }
    
    // Quantum coherence alert
    if (metrics.quantum_processor.coherence_time < 50) {
      this.emit('performance_alert', {
        type: 'quantum_decoherence',
        severity: 'medium',
        value: metrics.quantum_processor.coherence_time,
        threshold: 50,
        message: 'Quantum coherence time below optimal threshold'
      });
    }
    
    // AI inference speed alert
    if (metrics.ai_performance.inference_speed > 100) {
      this.emit('performance_alert', {
        type: 'slow_inference',
        severity: 'medium',
        value: metrics.ai_performance.inference_speed,
        threshold: 100,
        message: 'AI inference speed degraded'
      });
    }
  }

  // Public API methods
  updateSecurityStats(stats: Partial<typeof this.securityStats>): void {
    this.securityStats = { ...this.securityStats, ...stats };
  }

  updateAIPerformance(stats: Partial<typeof this.aiStats>): void {
    this.aiStats = { ...this.aiStats, ...stats };
  }

  updateQuantumPerformance(stats: Partial<typeof this.quantumStats>): void {
    this.quantumStats = { ...this.quantumStats, ...stats };
  }

  getCurrentMetrics(): SystemMetrics | null {
    if (this.performanceHistory.length === 0) return null;
    return this.performanceHistory[this.performanceHistory.length - 1];
  }

  getMetricsHistory(minutes: number = 60): SystemMetrics[] {
    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    return this.performanceHistory.filter(m => m.timestamp > cutoffTime);
  }

  getPerformanceSummary(minutes: number = 60): {
    avg_cpu: number;
    avg_memory: number;
    max_cpu: number;
    max_memory: number;
    quantum_health: 'good' | 'degraded' | 'critical';
    ai_health: 'good' | 'degraded' | 'critical';
  } {
    const history = this.getMetricsHistory(minutes);
    
    if (history.length === 0) {
      return {
        avg_cpu: 0,
        avg_memory: 0,
        max_cpu: 0,
        max_memory: 0,
        quantum_health: 'good',
        ai_health: 'good'
      };
    }
    
    const cpuValues = history.map(m => m.cpu_usage);
    const memoryValues = history.map(m => m.memory_usage);
    
    const avg_cpu = cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length;
    const avg_memory = memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length;
    const max_cpu = Math.max(...cpuValues);
    const max_memory = Math.max(...memoryValues);
    
    // Assess quantum health
    const avgCoherence = history.reduce((a, m) => a + m.quantum_processor.coherence_time, 0) / history.length;
    const quantum_health = avgCoherence > 80 ? 'good' : avgCoherence > 40 ? 'degraded' : 'critical';
    
    // Assess AI health
    const avgInferenceSpeed = history.reduce((a, m) => a + m.ai_performance.inference_speed, 0) / history.length;
    const ai_health = avgInferenceSpeed < 60 ? 'good' : avgInferenceSpeed < 100 ? 'degraded' : 'critical';
    
    return {
      avg_cpu: Math.round(avg_cpu * 100) / 100,
      avg_memory: Math.round(avg_memory * 100) / 100,
      max_cpu: Math.round(max_cpu * 100) / 100,
      max_memory: Math.round(max_memory * 100) / 100,
      quantum_health,
      ai_health
    };
  }

  // Memory optimization for 8GB systems
  optimizeMemoryUsage(): void {
    const currentMemory = this.getMemoryUsage();
    
    if (currentMemory > 80) {
      // Trigger garbage collection
      if (global.gc) {
        global.gc();
        metricsLogger.info('Manual garbage collection triggered');
      }
      
      // Reduce history size
      if (this.performanceHistory.length > 500) {
        this.performanceHistory = this.performanceHistory.slice(-250);
        metricsLogger.info('Performance history trimmed for memory optimization');
      }
      
      // Emit memory optimization event
      this.emit('memory_optimization', {
        before: currentMemory,
        action: 'gc_and_trim',
        timestamp: Date.now()
      });
    }
  }

  // System health assessment
  getSystemHealth(): {
    overall: 'healthy' | 'degraded' | 'critical';
    cpu_status: 'good' | 'high' | 'critical';
    memory_status: 'good' | 'high' | 'critical';
    quantum_status: 'good' | 'degraded' | 'critical';
    ai_status: 'good' | 'degraded' | 'critical';
    recommendations: string[];
  } {
    const current = this.getCurrentMetrics();
    const recommendations: string[] = [];
    
    if (!current) {
      return {
        overall: 'critical',
        cpu_status: 'critical',
        memory_status: 'critical',
        quantum_status: 'critical',
        ai_status: 'critical',
        recommendations: ['Metrics collection not available']
      };
    }
    
    // CPU status
    const cpu_status = current.cpu_usage > 90 ? 'critical' : 
                      current.cpu_usage > 70 ? 'high' : 'good';
    
    // Memory status
    const memory_status = current.memory_usage > 95 ? 'critical' : 
                         current.memory_usage > 80 ? 'high' : 'good';
    
    // Quantum status
    const quantum_status = current.quantum_processor.coherence_time < 30 ? 'critical' :
                          current.quantum_processor.coherence_time < 60 ? 'degraded' : 'good';
    
    // AI status
    const ai_status = current.ai_performance.inference_speed > 120 ? 'critical' :
                     current.ai_performance.inference_speed > 80 ? 'degraded' : 'good';
    
    // Generate recommendations
    if (cpu_status !== 'good') {
      recommendations.push('Reduce CPU load or scale processing capacity');
    }
    if (memory_status !== 'good') {
      recommendations.push('Optimize memory usage or consider system upgrade');
    }
    if (quantum_status !== 'good') {
      recommendations.push('Perform quantum processor calibration');
    }
    if (ai_status !== 'good') {
      recommendations.push('Optimize AI model or reduce inference load');
    }
    
    // Overall status
    const statuses = [cpu_status, memory_status, quantum_status, ai_status];
    const overall = statuses.includes('critical') ? 'critical' :
                   statuses.includes('high') || statuses.includes('degraded') ? 'degraded' : 'healthy';
    
    return {
      overall,
      cpu_status,
      memory_status,
      quantum_status,
      ai_status,
      recommendations
    };
  }

  // Export metrics for analysis
  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.performanceHistory, null, 2);
    }
    
    // CSV export
    const headers = [
      'timestamp', 'cpu_usage', 'memory_usage', 'network_incoming', 'network_outgoing',
      'quantum_coherence', 'ai_inference_speed', 'active_threats'
    ];
    
    const csv = [headers.join(',')];
    
    for (const metric of this.performanceHistory) {
      csv.push([
        metric.timestamp,
        metric.cpu_usage,
        metric.memory_usage,
        metric.network_activity.incoming,
        metric.network_activity.outgoing,
        metric.quantum_processor.coherence_time,
        metric.ai_performance.inference_speed,
        metric.security_status.active_threats
      ].join(','));
    }
    
    return csv.join('\n');
  }
}
