import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 VUs in 30s
    { duration: '1m', target: 50 },   // Stay at 50 VUs for 1 minute
    { duration: '30s', target: 0 },   // Ramp down to 0 in 30s
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // P95 should be less than 1s
    http_req_duration: ['p(90)<500'],  // P90 should be less than 500ms
    http_req_failed: ['rate<0.05'],     // Error rate should be less than 5%
  },
};

export default function () {
  // Test Backend Health Endpoint
  const healthRes = http.get('http://localhost:8081/api/health');
  check(healthRes, {
    'Health status is 200': (r) => r.status === 200,
    'Health response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.5);

  // Test Backend Products Endpoint (main load target)
  const productsRes = http.get('http://localhost:8081/api/products');
  check(productsRes, {
    'Products status is 200': (r) => r.status === 200,
    'Products response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.5);
}
