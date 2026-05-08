import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 3,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  // Test Frontend Homepage
  const frontendRes = http.get('http://localhost:8080');
  check(frontendRes, {
    'Frontend status is 200': (r) => r.status === 200,
    'Frontend response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test Backend Health Endpoint
  const backendRes = http.get('http://localhost:8081/api/health');
  check(backendRes, {
    'Backend status is 200': (r) => r.status === 200,
    'Backend response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test Backend Products Endpoint
  const productsRes = http.get('http://localhost:8081/api/products');
  check(productsRes, {
    'Products status is 200': (r) => r.status === 200,
    'Products response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test NLP Service Health Endpoint
  const nlpRes = http.get('http://localhost:3001/health');
  check(nlpRes, {
    'NLP service status is 200': (r) => r.status === 200,
    'NLP service response time < 500ms': (r) => r.timings.duration < 500,
  });
}
