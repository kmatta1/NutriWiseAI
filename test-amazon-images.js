// Test Amazon ASIN-based image URLs
// This can be run in the browser console to test real Amazon images

export const testAmazonImages = async () => {
  console.log('🧪 Testing Amazon ASIN-based image URLs...');
  
  const asinToSupplementMap = {
    'B000QSNYGI': 'Whey Protein Isolate',
    'B002DYIZEO': 'Creatine Monohydrate', 
    'B00CAZAU62': 'Omega-3 Fish Oil',
    'B00YQZQH32': 'Magnesium Glycinate',
    'B000FGDIAI': 'Vitamin D3',
    'B004U5II8E': 'CoQ10 Ubiquinol',
    'B00JEKYNZA': 'Probiotics',
    'B078SZ5YTV': 'Ashwagandha KSM-66',
  };
  
  const urlPatterns = [
    'https://images-na.ssl-images-amazon.com/images/P/{ASIN}.01.L.jpg',
    'https://images-na.ssl-images-amazon.com/images/P/{ASIN}.01._SL1500_.jpg',
    'https://m.media-amazon.com/images/P/{ASIN}.01._SL1500_.jpg',
    'https://images-amazon.com/images/P/{ASIN}.01.LZZZZZZZ.jpg',
  ];
  
  const testResults = [];
  
  for (const [asin, supplementName] of Object.entries(asinToSupplementMap)) {
    console.log(`\n🔍 Testing ASIN: ${asin} (${supplementName})`);
    
    for (const pattern of urlPatterns) {
      const imageUrl = pattern.replace('{ASIN}', asin);
      console.log(`   Testing: ${imageUrl}`);
      
      try {
        const result = await testImageUrl(imageUrl);
        if (result.success) {
          console.log(`   ✅ SUCCESS: ${imageUrl}`);
          testResults.push({
            asin,
            supplementName,
            imageUrl,
            success: true,
            dimensions: result.dimensions
          });
          break; // Found working URL, move to next ASIN
        } else {
          console.log(`   ❌ FAILED: ${imageUrl}`);
        }
      } catch (error) {
        console.log(`   💥 ERROR: ${imageUrl} - ${error.message}`);
      }
    }
  }
  
  console.log('\n📊 SUMMARY OF WORKING IMAGES:');
  console.log('================================');
  testResults.forEach(result => {
    console.log(`✅ ${result.supplementName}: ${result.imageUrl}`);
  });
  
  // Generate code for fallback-ai.ts
  console.log('\n📝 CODE FOR FALLBACK-AI.TS:');
  console.log('================================');
  testResults.forEach(result => {
    console.log(`'${result.supplementName}': '${result.imageUrl}',`);
  });
  
  return testResults;
};

const testImageUrl = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      resolve({ success: false, error: 'Timeout' });
    }, 3000);
    
    img.onload = function() {
      clearTimeout(timeout);
      resolve({ 
        success: true, 
        dimensions: { width: this.width, height: this.height }
      });
    };
    
    img.onerror = function() {
      clearTimeout(timeout);
      resolve({ success: false, error: 'Failed to load' });
    };
    
    img.src = url;
  });
};

// Auto-run test when this file is imported in browser
if (typeof window !== 'undefined') {
  window.testAmazonImages = testAmazonImages;
  console.log('🚀 Amazon image test utility loaded! Run testAmazonImages() in console to test.');
}
