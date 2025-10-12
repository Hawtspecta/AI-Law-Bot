const http = require('http');

// Test the server endpoints
async function testServer() {
  console.log('🧪 Testing AI Law Assistant Server...\n');

  const baseURL = 'http://localhost:3001';
  
  // Test health check
  try {
    console.log('1. Testing health check...');
    const healthResponse = await makeRequest(`${baseURL}/health`);
    console.log('✅ Health check:', healthResponse);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test chat endpoint
  try {
    console.log('\n2. Testing chat endpoint...');
    const chatResponse = await makeRequest(`${baseURL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What is the Consumer Protection Act?',
        language: 'en',
        userId: 'test_user',
        sessionId: 'test_session'
      })
    });
    console.log('✅ Chat response received');
    console.log('Response preview:', chatResponse.assistantMessage.content.substring(0, 100) + '...');
  } catch (error) {
    console.log('❌ Chat test failed:', error.message);
  }

  // Test legal news
  try {
    console.log('\n3. Testing legal news...');
    const newsResponse = await makeRequest(`${baseURL}/api/news?region=India&limit=3`);
    console.log('✅ Legal news received');
    console.log('News count:', newsResponse.news.length);
    console.log('First article:', newsResponse.news[0].title);
  } catch (error) {
    console.log('❌ News test failed:', error.message);
  }

  // Test legal search
  try {
    console.log('\n4. Testing legal search...');
    const searchResponse = await makeRequest(`${baseURL}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'consumer protection',
        filters: { category: 'consumer', jurisdiction: 'India' },
        userId: 'test_user'
      })
    });
    console.log('✅ Legal search completed');
    console.log('Search results preview:', searchResponse.results.content.substring(0, 100) + '...');
  } catch (error) {
    console.log('❌ Search test failed:', error.message);
  }

  console.log('\n🎉 Server testing completed!');
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Run tests
testServer().catch(console.error);