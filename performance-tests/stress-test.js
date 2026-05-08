import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 0 },    // Warm-up period
    { duration: '30s', target: 20 },   // Ramp up to 20 VUs
    { duration: '30s', target: 50 },   // Ramp up to 50 VUs
    { duration: '30s', target: 100 },   // Ramp up to 100 VUs
    { duration: '1m', target: 100 },    // Stay at 100 VUs for 1 minute
    { duration: '30s', target: 50 },    // Ramp down to 50 VUs
    { duration: '30s', target: 0 },     // Ramp down to 0 VUs
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],   // P95 should be less than 2s
    http_req_duration: ['p(90)<1000'],   // P90 should be less than 1s
    http_req_failed: ['rate<0.1'],       // Error rate should be less than 10%
  },
};

const sampleReviews = [
  'Sản phẩm này tuyệt vời! Mình đã dùng được 3 tháng và rất hài lòng.',
  'Đừng mua máy này! Hư hỏng liên tục, mới dùng 2 tuần đã bị lỗi.',
  'Máy ổn trong tầm giá. Thiết kế mỏng nhẹ dễ mang đi.',
  'Tốt tốt tốt tốt tốt! Mua ngay đi! Sản phẩm tốt nhất!',
  'Dùng Acer ổn nhưng so với Dell thì vẫn kém hơn.',
  'Máy này TỨC GIẬN quá! Mới mua 3 ngày đã bị màn hình xanh liên tục.',
  'Đã dùng sản phẩm được 6 tháng và muốn chia sẻ trải nghiệm chi tiết.',
  'Mua ngay hôm nay! Giảm giá 30%! Free ship toàn quốc!',
];

export default function () {
  // Test NLP Service /analyze endpoint with various reviews
  const randomReview = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
  const payload = JSON.stringify({
    reviewText: randomReview,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const analyzeRes = http.post('http://localhost:3001/analyze', payload, params);
  check(analyzeRes, {
    'Analyze endpoint status is 200': (r) => r.status === 200,
    'Analyze response has sentiment': (r) => JSON.parse(r.body).sentiment !== undefined,
    'Analyze response has rating_score': (r) => JSON.parse(r.body).rating_score !== undefined,
    'Analyze response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);

  // Also test health endpoint periodically
  if (__VU % 10 === 0) {
    const healthRes = http.get('http://localhost:3001/health');
    check(healthRes, {
      'Health endpoint status is 200': (r) => r.status === 200,
    });
  }
}
