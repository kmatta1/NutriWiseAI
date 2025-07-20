// Test different Amazon URL patterns to find working ones
const testUrls = [
  // Different image URL patterns
  'https://images-na.ssl-images-amazon.com/images/I/81Nx+7ikmUL._AC_SL1500_.jpg',
  'https://m.media-amazon.com/images/I/81Nx+7ikmUL._AC_SL1500_.jpg',
  'https://images-amazon.com/images/I/81Nx+7ikmUL._AC_SL1500_.jpg',
  
  // Product page patterns
  'https://www.amazon.com/dp/B00QQA0GSI',
  'https://amazon.com/dp/B00QQA0GSI',
  
  // Known working product
  'https://www.amazon.com/Sports-Research-Vitamin-Coconut-Softgels/dp/B003L1UTBQ'
];

async function testMultipleUrls() {
  console.log('Testing multiple Amazon URL patterns...\n');
  
  for (const url of testUrls) {
    try {
      console.log(`🔍 Testing: ${url}`);
      
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://www.amazon.com/'
        }
      });
      
      if (response.ok) {
        console.log(`✅ SUCCESS: ${response.status}\n`);
      } else {
        console.log(`❌ FAILED: ${response.status}\n`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}\n`);
    }
    
    // Small delay to be nice to Amazon's servers
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testMultipleUrls();
