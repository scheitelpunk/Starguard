#!/usr/bin/env node

/**
 * Health Check Script for Starguard Security System
 * Performs comprehensive health checks for all system components
 */

const http = require('http');
const https = require('https');
const { promisify } = require('util');
const fs = require('fs');

// Configuration
const config = {
    api: {
        protocol: process.env.SSL_ENABLED === 'true' ? 'https' : 'http',
        host: process.env.API_HOST || 'localhost',
        port: process.env.PORT || 3000,
        timeout: 5000
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost', 
        port: process.env.REDIS_PORT || 6379,
        timeout: 3000
    },
    ml: {
        protocol: 'http',
        host: process.env.ML_HOST || 'localhost',
        port: process.env.ML_PORT || 5000,
        timeout: 10000
    },
    thresholds: {
        responseTime: 2000, // ms
        memoryUsage: 0.9,   // 90%
        cpuUsage: 0.8       // 80%
    }
};

class HealthChecker {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            status: 'unknown',
            checks: {},
            metrics: {},
            errors: []
        };
    }

    /**
     * Perform HTTP health check
     */
    async checkHTTP(name, options) {
        const startTime = Date.now();
        
        return new Promise((resolve) => {
            const protocol = options.protocol === 'https' ? https : http;
            const path = options.path || '/health';
            
            const req = protocol.request({
                hostname: options.host,
                port: options.port,
                path: path,
                method: 'GET',
                timeout: options.timeout || 5000,
                headers: {
                    'User-Agent': 'Starguard-HealthCheck/1.0'
                }
            }, (res) => {
                const responseTime = Date.now() - startTime;
                let body = '';
                
                res.on('data', (chunk) => {
                    body += chunk;
                });
                
                res.on('end', () => {
                    const isHealthy = res.statusCode >= 200 && res.statusCode < 300;
                    
                    resolve({
                        status: isHealthy ? 'healthy' : 'unhealthy',
                        statusCode: res.statusCode,
                        responseTime,
                        body: body.slice(0, 200), // Limit body size
                        error: isHealthy ? null : `HTTP ${res.statusCode}: ${body}`
                    });
                });
            });
            
            req.on('error', (error) => {
                resolve({
                    status: 'unhealthy',
                    statusCode: null,
                    responseTime: Date.now() - startTime,
                    body: null,
                    error: error.message
                });
            });
            
            req.on('timeout', () => {
                req.destroy();
                resolve({
                    status: 'unhealthy',
                    statusCode: null,
                    responseTime: Date.now() - startTime,
                    body: null,
                    error: 'Request timeout'
                });
            });
            
            req.end();
        });
    }

    /**
     * Check Redis connectivity
     */
    async checkRedis() {
        const net = require('net');
        const startTime = Date.now();
        
        return new Promise((resolve) => {
            const socket = new net.Socket();
            
            socket.setTimeout(config.redis.timeout);
            
            socket.connect(config.redis.port, config.redis.host, () => {
                socket.write('PING\r\n');
            });
            
            socket.on('data', (data) => {
                const responseTime = Date.now() - startTime;
                const response = data.toString();
                socket.destroy();
                
                if (response.includes('+PONG')) {
                    resolve({
                        status: 'healthy',
                        responseTime,
                        error: null
                    });
                } else {
                    resolve({
                        status: 'unhealthy',
                        responseTime,
                        error: `Unexpected response: ${response}`
                    });
                }
            });
            
            socket.on('error', (error) => {
                resolve({
                    status: 'unhealthy',
                    responseTime: Date.now() - startTime,
                    error: error.message
                });
            });
            
            socket.on('timeout', () => {
                socket.destroy();
                resolve({
                    status: 'unhealthy',
                    responseTime: Date.now() - startTime,
                    error: 'Connection timeout'
                });
            });
        });
    }

    /**
     * Run all health checks
     */
    async runAllChecks() {
        console.log('Starting Starguard health checks...');
        
        // API Health Check
        console.log('Checking API health...');
        this.results.checks.api = await this.checkHTTP('api', config.api);
        
        // Redis Health Check
        console.log('Checking Redis connectivity...');
        this.results.checks.redis = await this.checkRedis();
        
        // ML Service Health Check (if enabled)
        if (process.env.ML_SERVICE_ENABLED !== 'false') {
            console.log('Checking ML service...');
            this.results.checks.ml = await this.checkHTTP('ml', {
                ...config.ml,
                path: '/health'
            });
        }
        
        // Determine overall status
        const allChecks = Object.values(this.results.checks);
        const healthyChecks = allChecks.filter(check => check.status === 'healthy');
        const unhealthyChecks = allChecks.filter(check => check.status === 'unhealthy');
        
        if (unhealthyChecks.length === 0) {
            this.results.status = 'healthy';
        } else if (healthyChecks.length === 0) {
            this.results.status = 'unhealthy';
        } else {
            this.results.status = 'degraded';
        }
        
        // Collect errors
        this.results.errors = allChecks
            .filter(check => check.error)
            .map(check => check.error);
        
        // Calculate metrics
        this.results.metrics = {
            totalChecks: allChecks.length,
            healthyChecks: healthyChecks.length,
            unhealthyChecks: unhealthyChecks.length,
            averageResponseTime: Math.round(
                allChecks
                    .filter(check => check.responseTime)
                    .reduce((sum, check) => sum + check.responseTime, 0) / 
                allChecks.filter(check => check.responseTime).length
            ) || 0
        };
        
        return this.results;
    }

    /**
     * Output results
     */
    outputResults() {
        const status = this.results.status.toUpperCase();
        console.log(`\nHealth Status: ${status}`);
        console.log(`Checks: ${this.results.metrics.healthyChecks}/${this.results.metrics.totalChecks} passing`);
        
        if (this.results.errors.length > 0) {
            console.log('\nErrors:');
            this.results.errors.forEach(error => console.log(`  - ${error}`));
        }
        
        // Exit with appropriate code
        if (this.results.status === 'healthy') {
            process.exit(0);
        } else if (this.results.status === 'degraded') {
            process.exit(1);
        } else {
            process.exit(2);
        }
    }
}

// Main execution
async function main() {
    const checker = new HealthChecker();
    
    try {
        await checker.runAllChecks();
        checker.outputResults();
    } catch (error) {
        console.error('Health check failed:', error.message);
        process.exit(3);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = HealthChecker;