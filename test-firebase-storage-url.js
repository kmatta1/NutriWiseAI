/**
 * Test Firebase Storage URL Access
 * This script tests if the Firebase Storage URLs are accessible
 */

const testFirebaseStorageUrls = async () => {
  console.log('🔍 Testing Firebase Storage URL Access');
  console.log('='.repeat(60));
  
  // Test URLs from the database
  const testUrls = [
    'https://storage.googleapis.com/nutriwiseai-f8bd1.firebasestorage.app/images/supplements/galaherbs_gaia_herbs_ginseng_capsules_63702278.jpg',
    'https://storage.googleapis.com/nutriwiseai-f8bd1.firebasestorage.app/images/supplements/garden_of_life_vitamin_code_men_capsules_37156824.jpg',
    'https://storage.googleapis.com/nutriwiseai-f8bd1.firebasestorage.app/images/supplements/nutricost_creatine_monohydrate_powder_49037629.jpg'
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`\n🌐 Testing: ${url}`);
      
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors' // Avoid CORS issues
      });
      
      console.log(`   Status: ${response.status || 'Unknown (no-cors mode)'}`);
      console.log(`   Type: ${response.type}`);
      
      // Try a regular GET request to see if image loads
      const getResponse = await fetch(url);
      console.log(`   GET Status: ${getResponse.status}`);
      console.log(`   Content-Type: ${getResponse.headers.get('content-type')}`);
      
      if (getResponse.status === 200) {
        console.log('   ✅ URL is accessible!');
      } else {
        console.log(`   ❌ URL failed with status: ${getResponse.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n🎯 Firebase Storage Test Complete');
};

// Run the test
testFirebaseStorageUrls();
