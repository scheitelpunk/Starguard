/**
 * SENTINEL ENTERPRISE - k6 Spike Test
 *
 * Tests system resilience against sudden traffic spikes
 *
 * Usage:
 *   k6 run spike-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },    // Baseline
    { duration: '1m', target: 10 },     // Stay at baseline
    { duration: '10s', target: 500 },   // SPIKE to 500 users
    { duration: '3m', target: 500 },    // Sustain spike
    { duration: '10s', target: 10 },    // Drop back to baseline
    { duration: '3m', target: 10 },     // Recovery
    { duration: '10s', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // Allow degraded performance during spike
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001';

export default function() {
  http.get(`${BASE_URL}/api/v1/analytics/dashboard`);
  sleep(Math.random() * 3);
}
