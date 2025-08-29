#!/usr/bin/env node

/**
 * STARGUARD System Monitor
 * Real-time monitoring and metrics collection
 */

import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';

class SystemMonitor {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      requests: 0,
      errors: 0,
      threats: 0,
      consciousness: 0,
      memory: 0,
      cpu: 0
    };
    
    this.isRunning = false;
    this.intervalId = null;
  }

  async collectSystemMetrics() {
    try {
      const memUsage = process.memoryUsage();
      this.metrics.memory = Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100; // MB
      
      // CPU usage estimation (simplified)
      const cpuUsage = process.cpuUsage();
      this.metrics.cpu = Math.round((cpuUsage.user + cpuUsage.system) / 1000000 * 100) / 100;
      
    } catch (error) {
      console.warn('⚠️  Could not collect system metrics:', error.message);
    }
  }

  async fetchApplicationMetrics() {
    const endpoints = [
      { name: 'consciousness', url: 'http://localhost:3000/api/consciousness/status' },
      { name: 'threats', url: 'http://localhost:3000/api/threats/count' },
      { name: 'health', url: 'http://localhost:3000/health' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await this.httpRequest(endpoint.url);
        if (response.status === 200) {
          const data = JSON.parse(response.data);
          
          switch (endpoint.name) {
            case 'consciousness':
              this.metrics.consciousness = data.awarenessLevel || 0;
              break;
            case 'threats':
              this.metrics.threats = data.count || 0;
              break;
            case 'health':
              if (data.status === 'healthy') {
                this.metrics.requests++;
              } else {
                this.metrics.errors++;
              }
              break;
          }
        }
      } catch (error) {
        this.metrics.errors++;
        console.warn(`⚠️  Could not fetch ${endpoint.name} metrics:`, error.message);
      }
    }
  }

  httpRequest(url, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const req = http.get(url, { timeout }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({ status: res.statusCode, data });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  displayMetrics() {
    const uptime = Math.floor((Date.now() - this.metrics.startTime) / 1000);
    const uptimeFormatted = this.formatUptime(uptime);

    console.clear();
    console.log('🔍 STARGUARD SYSTEM MONITOR');
    console.log('=' .repeat(50));
    console.log(`🕐 Uptime: ${uptimeFormatted}`);
    console.log(`🧠 Consciousness: ${this.metrics.consciousness.toFixed(2)}`);
    console.log(`⚠️  Threats Detected: ${this.metrics.threats}`);
    console.log(`📊 Memory Usage: ${this.metrics.memory} MB`);
    console.log(`⚡ CPU Usage: ${this.metrics.cpu}%`);
    console.log(`📈 Requests: ${this.metrics.requests}`);
    console.log(`❌ Errors: ${this.metrics.errors}`);
    console.log('=' .repeat(50));
    console.log(`Last updated: ${new Date().toLocaleTimeString()}`);
    console.log('Press Ctrl+C to exit');
  }

  formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  }

  async logMetrics() {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...this.metrics
    };

    try {
      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, 'metrics.log');
      
      // Ensure log directory exists
      try {
        await fs.access(logDir);
      } catch {
        await fs.mkdir(logDir, { recursive: true });
      }

      await fs.appendFile(logFile, JSON.stringify(logEntry) + '\\n');
    } catch (error) {
      console.warn('⚠️  Could not write metrics log:', error.message);
    }
  }

  async start() {
    console.log('🚀 Starting STARGUARD System Monitor...');
    this.isRunning = true;

    // Initial display
    await this.collectSystemMetrics();
    await this.fetchApplicationMetrics();
    this.displayMetrics();
    await this.logMetrics();

    // Set up interval for updates
    this.intervalId = setInterval(async () => {
      if (this.isRunning) {
        await this.collectSystemMetrics();
        await this.fetchApplicationMetrics();
        this.displayMetrics();
        await this.logMetrics();
      }
    }, 5000); // Update every 5 seconds

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.stop();
    });

    process.on('SIGTERM', () => {
      this.stop();
    });
  }

  stop() {
    console.log('\\n🛑 Stopping System Monitor...');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    console.log('👋 Monitor stopped');
    process.exit(0);
  }
}

// Run monitor
const monitor = new SystemMonitor();
monitor.start().catch((error) => {
  console.error('🔥 Monitor error:', error);
  process.exit(1);
});