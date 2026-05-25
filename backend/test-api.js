const http = require('http');

// Test health check
function testHealth() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:5000/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n✓ GET /health');
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        resolve();
      });
    });
    req.on('error', reject);
  });
}

// Test universities list
function testUniversities() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:5000/api/universities', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n✓ GET /api/universities');
        console.log('Status:', res.statusCode);
        const json = JSON.parse(data);
        console.log('Success:', json.success);
        console.log('Message:', json.message);
        console.log('Data count:', json.data?.length || 0);
        resolve();
      });
    });
    req.on('error', reject);
  });
}

// Test register
function testRegister() {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      citizen_id: 123456789012,
      full_name: 'Test User ' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n✓ POST /api/auth/register');
        console.log('Status:', res.statusCode);
        try {
          const json = JSON.parse(data);
          console.log('Response:', JSON.stringify(json, null, 2));
        } catch (e) {
          console.log('Response:', data);
        }
        resolve();
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Run tests
(async () => {
  try {
    console.log('🧪 Testing API Endpoints on localhost:5000\n');
    await testHealth();
    await testUniversities();
    await testRegister();
    console.log('\n✅ All tests completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
