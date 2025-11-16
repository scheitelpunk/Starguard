/**
 * Load Testing Suite for Starguard Backend
 *
 * Uses k6 for load testing
 * Run with: k6 run tests/performance/load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const threatDetectionErrors = new Counter('threat_detection_errors');
const authenticationErrors = new Counter('authentication_errors');
const quantumAnalysisErrors = new Counter('quantum_analysis_errors');
const cacheHitRate = new Rate('cache_hit_rate');
const apiResponseTime = new Trend('api_response_time');

// Test configuration
export const options = {
  stages: [
    // Warm-up
    { duration: '30s', target: 10 },

    // Ramp up to moderate load
    { duration: '1m', target: 50 },

    // Maintain moderate load
    { duration: '2m', target: 50 },

    // Ramp up to high load
    { duration: '1m', target: 100 },

    // Spike test
    { duration: '30s', target: 200 },

    // Maintain high load
    { duration: '2m', target: 100 },

    // Ramp down
    { duration: '1m', target: 10 },

    // Cool down
    { duration: '30s', target: 0 },
  ],

  thresholds: {
    // HTTP errors should be less than 1%
    'http_req_failed': ['rate<0.01'],

    // 95% of requests should be below 500ms
    'http_req_duration': ['p(95)<500'],

    // 99% of requests should be below 1000ms
    'http_req_duration': ['p(99)<1000'],

    // Average response time should be below 200ms
    'http_req_duration': ['avg<200'],

    // Custom metrics thresholds
    'threat_detection_errors': ['count<10'],
    'authentication_errors': ['count<5'],
  ],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// Test data
const testUsers = [
  { id: 'user-1', sessionId: 'session-1' },
  { id: 'user-2', sessionId: 'session-2' },
  { id: 'user-3', sessionId: 'session-3' },
];

/**
 * Main test scenario
 */
export default function () {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];

  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/api/quantum/health`);

    check(res, {
      'health check status is 200': (r) => r.status === 200,
      'health check has operational status': (r) => {
        const body = JSON.parse(r.body);
        return body.status === 'operational';
      },
    });

    apiResponseTime.add(res.timings.duration);
  });

  group('Quantum Analysis', () => {
    const payload = JSON.stringify({
      data: 'test-data-' + Math.random().toString(36),
      analysisType: 'threat-detection',
    });

    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const res = http.post(`${BASE_URL}/api/quantum/analyze`, payload, params);

    const success = check(res, {
      'quantum analysis status is 200': (r) => r.status === 200,
      'quantum analysis has result': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.status === 'success';
        } catch {
          return false;
        }
      },
    });

    if (!success) {
      quantumAnalysisErrors.add(1);
    }

    apiResponseTime.add(res.timings.duration);
  });

  group('Threat Detection', () => {
    const res = http.get(`${BASE_URL}/api/quantum/threats`);

    const success = check(res, {
      'threats endpoint status is 200': (r) => r.status === 200,
      'threats endpoint returns array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.threats);
        } catch {
          return false;
        }
      },
    });

    if (!success) {
      threatDetectionErrors.add(1);
    }

    apiResponseTime.add(res.timings.duration);

    // Check cache performance
    const cacheHeader = res.headers['X-Cache'];
    if (cacheHeader) {
      cacheHitRate.add(cacheHeader === 'HIT' ? 1 : 0);
    }
  });

  group('Quantum Particles', () => {
    const res = http.get(`${BASE_URL}/api/quantum/particles`);

    check(res, {
      'particles endpoint status is 200': (r) => r.status === 200,
      'particles endpoint returns data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.particles) && body.particles.length > 0;
        } catch {
          return false;
        }
      },
    });

    apiResponseTime.add(res.timings.duration);
  });

  group('Consciousness Status', () => {
    const res = http.get(`${BASE_URL}/api/consciousness/status`);

    check(res, {
      'consciousness status is 200': (r) => r.status === 200,
      'consciousness is awake': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.status === 'awake';
        } catch {
          return false;
        }
      },
    });

    apiResponseTime.add(res.timings.duration);
  });

  group('Swarm Configuration', () => {
    const payload = JSON.stringify({
      topology: 'mesh',
      nodeCount: Math.floor(Math.random() * 10) + 5,
      parameters: {},
    });

    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const res = http.post(`${BASE_URL}/api/quantum/swarm/configure`, payload, params);

    check(res, {
      'swarm config status is 200': (r) => r.status === 200,
      'swarm config returns swarmId': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.swarmId && body.status === 'configured';
        } catch {
          return false;
        }
      },
    });

    apiResponseTime.add(res.timings.duration);
  });

  // Random think time between 0.5s and 2s
  sleep(Math.random() * 1.5 + 0.5);
}

/**
 * Setup function - runs once before test
 */
export function setup() {
  console.log('Starting load test against:', BASE_URL);

  // Verify server is accessible
  const res = http.get(`${BASE_URL}/api/quantum/health`);
  if (res.status !== 200) {
    throw new Error(`Server not accessible: ${res.status}`);
  }

  console.log('Server health check passed');
  return { startTime: new Date() };
}

/**
 * Teardown function - runs once after test
 */
export function teardown(data) {
  const endTime = new Date();
  const duration = (endTime - data.startTime) / 1000;

  console.log(`\nLoad test completed in ${duration.toFixed(2)} seconds`);
  console.log('Check detailed metrics above for performance analysis');
}

/**
 * Custom summary for better reporting
 */
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'tests/performance/load-test-results.json': JSON.stringify(data),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const colors = options.enableColors ? true : false;

  let summary = '\n';
  summary += `${indent}========== Load Test Summary ==========\n\n`;

  // Test duration
  summary += `${indent}Test Duration: ${(data.state.testRunDurationMs / 1000).toFixed(2)}s\n`;

  // HTTP metrics
  const httpMetrics = data.metrics.http_req_duration;
  if (httpMetrics) {
    summary += `\n${indent}HTTP Response Times:\n`;
    summary += `${indent}  Average: ${httpMetrics.values.avg.toFixed(2)}ms\n`;
    summary += `${indent}  Median:  ${httpMetrics.values.med.toFixed(2)}ms\n`;
    summary += `${indent}  P95:     ${httpMetrics.values['p(95)'].toFixed(2)}ms\n`;
    summary += `${indent}  P99:     ${httpMetrics.values['p(99)'].toFixed(2)}ms\n`;
    summary += `${indent}  Max:     ${httpMetrics.values.max.toFixed(2)}ms\n`;
  }

  // Request metrics
  const requests = data.metrics.http_reqs;
  if (requests) {
    summary += `\n${indent}Total Requests: ${requests.values.count}\n`;
    summary += `${indent}Requests/sec: ${requests.values.rate.toFixed(2)}\n`;
  }

  // Error rate
  const errors = data.metrics.http_req_failed;
  if (errors) {
    const errorRate = (errors.values.rate * 100).toFixed(2);
    summary += `\n${indent}Error Rate: ${errorRate}%\n`;
  }

  // Custom metrics
  summary += `\n${indent}Custom Metrics:\n`;
  if (data.metrics.threat_detection_errors) {
    summary += `${indent}  Threat Detection Errors: ${data.metrics.threat_detection_errors.values.count}\n`;
  }
  if (data.metrics.authentication_errors) {
    summary += `${indent}  Authentication Errors: ${data.metrics.authentication_errors.values.count}\n`;
  }
  if (data.metrics.cache_hit_rate) {
    const hitRate = (data.metrics.cache_hit_rate.values.rate * 100).toFixed(2);
    summary += `${indent}  Cache Hit Rate: ${hitRate}%\n`;
  }

  summary += `\n${indent}======================================\n`;

  return summary;
}
