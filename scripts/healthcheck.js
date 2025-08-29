#!/usr/bin/env node

/**
 * STARGUARD Health Check Script
 * Verifies all critical system components are operational
 */

import http from 'http';
import { URL } from 'url';

const HEALTH_CHECKS = [
  {
    name: 'Main HTTP Server',
    url: 'http://localhost:3000/health',
    timeout: 5000
  },
  {
    name: 'WebSocket Server',
    url: 'http://localhost:3001/health',
    timeout: 5000
  },
  {
    name: 'ML Service',
    url: 'http://localhost:5000/health',
    timeout: 10000
  }
];

class HealthChecker {
  async checkEndpoint(check) {
    return new Promise((resolve) => {
      const url = new URL(check.url);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'GET',
        timeout: check.timeout
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const response = JSON.parse(data);
              resolve({
                name: check.name,
                status: 'healthy',
                statusCode: res.statusCode,
                response: response
              });
            } catch (e) {
              resolve({
                name: check.name,
                status: 'healthy',
                statusCode: res.statusCode,
                response: { message: 'OK' }
              });
            }
          } else {
            resolve({
              name: check.name,
              status: 'unhealthy',
              statusCode: res.statusCode,
              error: `HTTP ${res.statusCode}`
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({
          name: check.name,
          status: 'unhealthy',
          error: error.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          name: check.name,
          status: 'unhealthy',
          error: 'Timeout'
        });
      });

      req.end();
    });
  }

  async runHealthChecks() {
    console.log('🏥 STARGUARD Health Check Starting...');
    
    const results = await Promise.all(
      HEALTH_CHECKS.map(check => this.checkEndpoint(check))
    );

    let allHealthy = true;
    let healthyCount = 0;

    results.forEach(result => {
      if (result.status === 'healthy') {
        console.log(`✅ ${result.name}: ${result.status}`);
        healthyCount++;
      } else {
        console.log(`❌ ${result.name}: ${result.status} - ${result.error}`);
        allHealthy = false;
      }
    });

    console.log(`\\n📊 Health Summary: ${healthyCount}/${results.length} services healthy`);
    
    if (allHealthy) {
      console.log('🎉 All systems operational!');
      process.exit(0);
    } else {
      console.log('⚠️  Some services are unhealthy');
      process.exit(1);
    }
  }
}

// Run health check
const checker = new HealthChecker();
checker.runHealthChecks().catch((error) => {
  console.error('🔥 Health check failed:', error);
  process.exit(1);
});