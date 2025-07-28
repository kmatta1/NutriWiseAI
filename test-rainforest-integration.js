// test-rainforest-integration.js
// Test the Rainforest API with simpler search terms

require('dotenv').config();
const https = require('https');

async function testRainforestAPI() {
  const apiKey = process.env.RAINFOREST_API_KEY;
  
  if (!apiKey) {
    console.error('❌ RAINFOREST_API_KEY not found');
    return;
  }

  console.log('🧪 Testing Rainforest API with simple search...\n');

  // Test with a simple, common supplement
  const testSearches = [
    'creatine monohydrate',
    'whey protein',
    'vitamin d3',
    'multivitamin men'
  ];

  for (const searchTerm of testSearches) {
    try {
      console.log(`🔍 Testing search: "${searchTerm}"`);
      
      const requestOptions = {
        hostname: 'api.rainforestapi.com',
        path: `/request?api_key=${apiKey}&type=search&amazon_domain=amazon.com&search_term=${encodeURIComponent(searchTerm)}&output=json`,
        method: 'GET',
        headers: {
          'User-Agent': 'NutriWiseAI/1.0'
        }
      };

      const result = await new Promise((resolve, reject) => {
        const req = https.request(requestOptions, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              resolve(response);
            } catch (error) {
              reject(error);
            }
          });
        });

        req.on('error', reject);
        req.setTimeout(30000, () => {
          req.abort();
          reject(new Error('Request timeout'));
        });

        req.end();
      });

      console.log(`📊 Response status: ${result.request_info?.success ? 'SUCCESS' : 'FAILED'}`);
      
      if (result.search_results && result.search_results.length > 0) {
        console.log(`✅ Found ${result.search_results.length} results`);
        const firstResult = result.search_results[0];
        console.log(`   Title: ${firstResult.title?.substring(0, 60)}...`);
        console.log(`   Image: ${firstResult.image ? 'YES' : 'NO'}`);
        console.log(`   ASIN: ${firstResult.asin || 'N/A'}`);
      } else {
        console.log('❌ No search results found');
        if (result.request_info) {
          console.log(`   Message: ${result.request_info.message || 'No message'}`);
        }
      }
      
      console.log('');
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Error testing "${searchTerm}":`, error.message);
    }
  }
}

testRainforestAPI().catch(console.error);
