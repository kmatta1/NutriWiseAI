// Test script to verify Amazon integration is working
const https = require('https');
const { URL } = require('url');

// Test image URLs
const testImages = [
  'https://m.media-amazon.com/images/I/714QpZ8XvsL._AC_SL1500_.jpg', // Omega-3
  'https://m.media-amazon.com/images/I/61rWlZD4sGL._AC_SL1000_.jpg', // Magnesium
  'https://m.media-amazon.com/images/I/71BFWQlQ7hL._AC_SL1000_.jpg', // Whey Protein
  'https://m.media-amazon.com/images/I/81L9BSiMWDL._AC_SL1500_.jpg', // Creatine
];

// Test Amazon affiliate URLs
const testAffiliateUrls = [
  'https://www.amazon.com/dp/B00CAZAU62?tag=nutriwiseai-20', // Omega-3
  'https://www.amazon.com/dp/B00YQZQH32?tag=nutriwiseai-20', // Magnesium
  'https://www.amazon.com/dp/B000QSNYGI?tag=nutriwiseai-20', // Whey Protein
  'https://www.amazon.com/dp/B002DYIZEO?tag=nutriwiseai-20', // Creatine
];

async function testUrl(url, type) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`✅ ${type} - ${url} - Status: ${res.statusCode}`);
      resolve({ url, status: res.statusCode, success: res.statusCode < 400 });
    });

    req.on('error', (err) => {
      console.log(`❌ ${type} - ${url} - Error: ${err.message}`);
      resolve({ url, error: err.message, success: false });
    });

    req.on('timeout', () => {
      console.log(`⏰ ${type} - ${url} - Timeout`);
      req.destroy();
      resolve({ url, error: 'Timeout', success: false });
    });

    req.end();
  });
}

async function testAll() {
  console.log('🧪 Testing Amazon Product Images...\n');
  
  for (const imageUrl of testImages) {
    await testUrl(imageUrl, 'IMAGE');
  }
  
  console.log('\n🔗 Testing Amazon Affiliate URLs...\n');
  
  for (const affiliateUrl of testAffiliateUrls) {
    await testUrl(affiliateUrl, 'AFFILIATE');
  }
  
  console.log('\n✨ Testing complete!');
}

testAll().catch(console.error);
