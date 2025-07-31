/**
 * Debug Specific Image URLs from Screenshot
 * Test the exact URLs being generated to see why images aren't loading
 */

// URLs I can see from the console in the screenshot
const testUrls = [
  'https://firebasestorage.googleapis.com/v0/b/nutriwise-ai-3fmvs.firebasestorage.app/o/images%252Fsupplements%252Foptimum_nutrition_gold_standard_whey_protein_65956443.jpg?alt=media',
  'https://firebasestorage.googleapis.com/v0/b/nutriwise-ai-3fmvs.firebasestorage.app/o/images%252Fsupplements%252Fbulksupplements_bulksupplements_buffered_creatine_63937016.jpg?alt=media',
  'https://firebasestorage.googleapis.com/v0/b/nutriwise-ai-3fmvs.firebasestorage.app/o/images%252Fsupplements%252Fnow_foods_vitamin_d3_5000_iu_63702278.jpg?alt=media'
];

console.log('🧪 Testing specific URLs from console output...');
console.log('='.repeat(70));

async function testSpecificUrls() {
  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    console.log(`\\nTest ${i + 1}:`);
    console.log(`URL: ${url}`);
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const statusIcon = response.status === 200 ? '✅ SUCCESS' : 
                        response.status === 403 ? '🔒 FORBIDDEN' : 
                        response.status === 404 ? '❌ NOT FOUND' : 
                        `❓ ${response.status}`;
      console.log(`Status: ${statusIcon}`);
      
      if (response.status !== 200) {
        // Try alternative URL format
        console.log('Trying alternative format...');
        const altUrl = url.replace('%252F', '%2F');
        console.log(`Alt URL: ${altUrl}`);
        
        const altResponse = await fetch(altUrl, { method: 'HEAD' });
        const altStatusIcon = altResponse.status === 200 ? '✅ SUCCESS' : 
                             altResponse.status === 403 ? '🔒 FORBIDDEN' : 
                             altResponse.status === 404 ? '❌ NOT FOUND' : 
                             `❓ ${altResponse.status}`;
        console.log(`Alt Status: ${altStatusIcon}`);
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }
  
  // Check if the issue is double URL encoding
  console.log('\\n🔍 ANALYSIS:');
  console.log('I notice the URLs have %252F instead of %2F');
  console.log('This suggests double URL encoding is happening');
  console.log('');
  console.log('🔧 LIKELY FIX:');
  console.log('Update getOptimizedImageUrl to prevent double encoding');
}

testSpecificUrls();
