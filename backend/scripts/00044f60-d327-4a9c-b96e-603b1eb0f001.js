import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function() {

  // Step 1: GET http://google.com
  const res_0 = http.get('http://google.com');
  check(res_0, {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
  });

  sleep(1);
}
