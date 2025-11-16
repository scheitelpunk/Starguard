/**
 * SENTINEL ENTERPRISE - k6 Load Test
 *
 * This test simulates realistic user behavior under various load conditions
 *
 * Usage:
 *   k6 run --vus 10 --duration 30s load-test.js
 *   k6 run --vus 100 --duration 5m load-test.js
 *   k6 run load-test.js  # Uses stages defined below
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom Metrics
const errorRate = new Rate('error_rate');
const threatDetectionTime = new Trend('threat_detection_time');
const apiResponseTime = new Trend('api_response_time');
const websocketConnections = new Counter('websocket_connections');

// Test Configuration
export const options = {
  stages: [
    { duration: '2m', target: 50 },    // Ramp-up to 50 users
    { duration: '5m', target: 50 },    // Stay at 50 users
    { duration: '2m', target: 100 },   // Ramp-up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 200 },   // Ramp-up to 200 users
    { duration: '5m', target: 200 },   // Stay at 200 users
    { duration: '5m', target: 0 },     // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% under 500ms, 99% under 1s
    http_req_failed: ['rate<0.01'],                  // Error rate < 1%
    error_rate: ['rate<0.05'],                       // Custom error rate < 5%
    api_response_time: ['p(95)<400'],                // API 95th percentile < 400ms
    threat_detection_time: ['p(95)<200'],            // Detection 95th percentile < 200ms
  },
  ext: {
    loadimpact: {
      projectID: 3595374,
      name: 'SENTINEL ENTERPRISE Load Test'
    }
  }
};

// Configuration
const BASE_URL = __ENV.API_URL || 'http://localhost:3001';
const WS_URL = __ENV.WS_URL || 'ws://localhost:3001';

// Test Data
const TEST_USER = {
  email: 'load-test@sentinel-enterprise.io',
  password: 'LoadTest2025!',
};

/**
 * Setup - Runs once per VU
 */
export function setup() {
  // Authenticate and get token
  const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
    email: TEST_USER.email,
    password: TEST_USER.password,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'authentication successful': (r) => r.status === 200,
    'received access token': (r) => r.json('accessToken') !== undefined,
  });

  return {
    token: loginRes.json('accessToken'),
  };
}

/**
 * Main Test Scenario
 */
export default function(data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // Group: Dashboard Access
  group('Dashboard Access', function() {
    const dashboardRes = http.get(`${BASE_URL}/api/v1/analytics/dashboard`, { headers });

    apiResponseTime.add(dashboardRes.timings.duration);

    check(dashboardRes, {
      'dashboard status 200': (r) => r.status === 200,
      'dashboard has summary': (r) => r.json('summary') !== undefined,
      'dashboard response < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);
  });

  sleep(1);

  // Group: Threat Detection
  group('Threat Detection API', function() {
    // List threats
    const threatsRes = http.get(`${BASE_URL}/api/v1/threats?limit=50`, { headers });

    apiResponseTime.add(threatsRes.timings.duration);

    check(threatsRes, {
      'threats status 200': (r) => r.status === 200,
      'threats is array': (r) => Array.isArray(r.json('threats')),
      'threats response < 400ms': (r) => r.timings.duration < 400,
    }) || errorRate.add(1);

    // Get specific threat
    const threats = threatsRes.json('threats');
    if (threats && threats.length > 0) {
      const threatId = threats[0].id;
      const startTime = Date.now();

      const threatDetailRes = http.get(`${BASE_URL}/api/v1/threats/${threatId}`, { headers });

      const detectionTime = Date.now() - startTime;
      threatDetectionTime.add(detectionTime);

      check(threatDetailRes, {
        'threat detail status 200': (r) => r.status === 200,
        'threat has timeline': (r) => r.json('timeline') !== undefined,
      }) || errorRate.add(1);
    }
  });

  sleep(2);

  // Group: Network Monitoring
  group('Network Monitoring API', function() {
    // Get network nodes
    const nodesRes = http.get(`${BASE_URL}/api/v1/network/nodes`, { headers });

    apiResponseTime.add(nodesRes.timings.duration);

    check(nodesRes, {
      'nodes status 200': (r) => r.status === 200,
      'nodes is array': (r) => Array.isArray(r.json('nodes')),
    }) || errorRate.add(1);

    // Get network health
    const healthRes = http.get(`${BASE_URL}/api/v1/network/health`, { headers });

    check(healthRes, {
      'health status 200': (r) => r.status === 200,
      'health has metrics': (r) => r.json('metrics') !== undefined,
      'overall health is number': (r) => typeof r.json('overall') === 'number',
    }) || errorRate.add(1);
  });

  sleep(1);

  // Group: Agent Management
  group('Agent Management API', function() {
    const agentsRes = http.get(`${BASE_URL}/api/v1/agents`, { headers });

    apiResponseTime.add(agentsRes.timings.duration);

    check(agentsRes, {
      'agents status 200': (r) => r.status === 200,
      'agents is array': (r) => Array.isArray(r.json('agents')),
    }) || errorRate.add(1);
  });

  sleep(2);

  // Group: Write Operations (10% of users)
  if (Math.random() < 0.1) {
    group('Write Operations', function() {
      // Update threat status
      const updateRes = http.patch(
        `${BASE_URL}/api/v1/threats/thr_test_${__VU}_${__ITER}`,
        JSON.stringify({
          status: 'investigating',
          notes: `Load test iteration ${__ITER}`,
        }),
        { headers }
      );

      check(updateRes, {
        'update accepted': (r) => [200, 404].includes(r.status), // 404 ok for test threats
      }) || errorRate.add(1);
    });

    sleep(1);
  }
}

/**
 * Teardown - Runs once after all VUs complete
 */
export function teardown(data) {
  console.log('Load test completed');
}

/**
 * Handle Summary - Custom results formatting
 */
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'results/load-test-summary.json': JSON.stringify(data),
    'results/load-test-report.html': htmlReport(data),
  };
}

// Helper: Text Summary
function textSummary(data, opts = {}) {
  const { indent = '', enableColors = false } = opts;

  let output = `\n${indent}Load Test Summary\n${indent}${'='.repeat(50)}\n\n`;

  const metrics = data.metrics;

  output += `${indent}HTTP Requests:\n`;
  output += `${indent}  Total: ${metrics.http_reqs.values.count}\n`;
  output += `${indent}  Failed: ${metrics.http_req_failed.values.rate * 100}%\n`;
  output += `${indent}  Duration (p95): ${metrics.http_req_duration.values['p(95)']}ms\n`;
  output += `${indent}  Duration (p99): ${metrics.http_req_duration.values['p(99)']}ms\n\n`;

  output += `${indent}Custom Metrics:\n`;
  output += `${indent}  Error Rate: ${metrics.error_rate.values.rate * 100}%\n`;
  output += `${indent}  API Response (p95): ${metrics.api_response_time.values['p(95)']}ms\n`;
  output += `${indent}  Threat Detection (p95): ${metrics.threat_detection_time.values['p(95)']}ms\n\n`;

  return output;
}

// Helper: HTML Report
function htmlReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>SENTINEL ENTERPRISE - Load Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
    h1 { color: #1a237e; border-bottom: 3px solid #00838f; padding-bottom: 10px; }
    h2 { color: #00838f; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #1a237e; color: white; }
    .metric { background: #f9f9f9; padding: 20px; margin: 10px 0; border-left: 4px solid #00838f; }
    .metric-name { font-weight: bold; color: #1a237e; }
    .metric-value { font-size: 24px; color: #00838f; }
    .pass { color: #4caf50; }
    .fail { color: #f44336; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🛡️ SENTINEL ENTERPRISE - Load Test Report</h1>
    <p><strong>Date:</strong> ${new Date().toISOString()}</p>

    <h2>Overview</h2>
    <div class="metric">
      <div class="metric-name">Total HTTP Requests</div>
      <div class="metric-value">${data.metrics.http_reqs.values.count}</div>
    </div>

    <div class="metric">
      <div class="metric-name">Error Rate</div>
      <div class="metric-value ${data.metrics.http_req_failed.values.rate < 0.01 ? 'pass' : 'fail'}">
        ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
      </div>
    </div>

    <h2>Performance Metrics</h2>
    <table>
      <tr>
        <th>Metric</th>
        <th>p50</th>
        <th>p95</th>
        <th>p99</th>
        <th>Status</th>
      </tr>
      <tr>
        <td>HTTP Request Duration</td>
        <td>${data.metrics.http_req_duration.values['p(50)']}ms</td>
        <td>${data.metrics.http_req_duration.values['p(95)']}ms</td>
        <td>${data.metrics.http_req_duration.values['p(99)']}ms</td>
        <td class="${data.metrics.http_req_duration.values['p(95)'] < 500 ? 'pass' : 'fail'}">
          ${data.metrics.http_req_duration.values['p(95)'] < 500 ? '✓ PASS' : '✗ FAIL'}
        </td>
      </tr>
      <tr>
        <td>API Response Time</td>
        <td>${data.metrics.api_response_time.values['p(50)']}ms</td>
        <td>${data.metrics.api_response_time.values['p(95)']}ms</td>
        <td>${data.metrics.api_response_time.values['p(99)']}ms</td>
        <td class="${data.metrics.api_response_time.values['p(95)'] < 400 ? 'pass' : 'fail'}">
          ${data.metrics.api_response_time.values['p(95)'] < 400 ? '✓ PASS' : '✗ FAIL'}
        </td>
      </tr>
      <tr>
        <td>Threat Detection Time</td>
        <td>${data.metrics.threat_detection_time.values['p(50)']}ms</td>
        <td>${data.metrics.threat_detection_time.values['p(95)']}ms</td>
        <td>${data.metrics.threat_detection_time.values['p(99)']}ms</td>
        <td class="${data.metrics.threat_detection_time.values['p(95)'] < 200 ? 'pass' : 'fail'}">
          ${data.metrics.threat_detection_time.values['p(95)'] < 200 ? '✓ PASS' : '✗ FAIL'}
        </td>
      </tr>
    </table>

    <h2>Test Configuration</h2>
    <pre>${JSON.stringify(data.options, null, 2)}</pre>
  </div>
</body>
</html>
  `;
}
