/**
 * SENTINEL ENTERPRISE - k6 Stress Test
 *
 * This test pushes the system beyond normal load to identify breaking points
 *
 * Usage:
 *   k6 run stress-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp-up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100
    { duration: '2m', target: 200 },   // Ramp to 200
    { duration: '5m', target: 200 },   // Stay at 200
    { duration: '2m', target: 300 },   // Ramp to 300
    { duration: '5m', target: 300 },   // Stay at 300
    { duration: '2m', target: 400 },   // Push to 400
    { duration: '5m', target: 400 },   // Stress test at 400
    { duration: '10m', target: 0 },    // Recovery
  ],
  thresholds: {
    http_req_duration: ['p(99)<3000'], // 99% under 3s (degraded is ok)
    'http_req_duration{staticAsset:yes}': ['p(99)<1000'],
    errors: ['rate<0.1'], // Error rate under 10% acceptable for stress test
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001';

export default function() {
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/v1/threats`, null, { tags: { name: 'Threats' } }],
    ['GET', `${BASE_URL}/api/v1/network/health`, null, { tags: { name: 'Health' } }],
    ['GET', `${BASE_URL}/api/v1/agents`, null, { tags: { name: 'Agents' } }],
    ['GET', `${BASE_URL}/api/v1/analytics/dashboard`, null, { tags: { name: 'Dashboard' } }],
  ]);

  check(responses[0], {
    'threats ok': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(1);
}
