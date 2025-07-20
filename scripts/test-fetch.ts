import fetch from 'node-fetch';

async function testBasicFetch() {
  console.log('Testing basic fetch functionality...');
  
  try {
    console.log('🔍 Testing Google...');
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      timeout: 5000
    });
    console.log(`✅ Google responded with status: ${response.status}`);
    
    console.log('🔍 Testing Amazon...');
    const amazonResponse = await fetch('https://www.amazon.com', { 
      method: 'HEAD',
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log(`✅ Amazon responded with status: ${amazonResponse.status}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  console.log('Test complete.');
}

testBasicFetch();
