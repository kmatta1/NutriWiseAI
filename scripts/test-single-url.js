// Simple test to verify a single Amazon URL
async function testSingleUrl() {
  const testUrl = 'https://m.media-amazon.com/images/I/71QnFQQS1iL._AC_SL1500_.jpg';
  
  console.log(`Testing: ${testUrl}`);
  
  try {
    const response = await fetch(testUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`OK: ${response.ok}`);
    
    if (response.ok) {
      console.log('✅ URL is working');
    } else {
      console.log('❌ URL failed');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testSingleUrl();
