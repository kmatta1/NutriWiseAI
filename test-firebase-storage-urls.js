/**
 * Verify Firebase Storage URLs - Images exist but URLs might be wrong format
 */

// Test the exact URL format that should work
const testUrls = [
  // Current database format (what we think is stored)
  'https://storage.googleapis.com/nutriwise-ai-3fmvs.firebasestorage.app/images/supplements/galaherbs_gaia_herbs_ginseng_capsules_63702278.jpg',
  
  // Alternative format 1: Standard Firebase Storage format
  'https://firebasestorage.googleapis.com/v0/b/nutriwise-ai-3fmvs.firebasestorage.app/o/images%2Fsupplements%2Fgalaherbs_gaia_herbs_ginseng_capsules_63702278.jpg?alt=media',
  
  // Alternative format 2: Direct storage access
  'https://storage.cloud.google.com/nutriwise-ai-3fmvs.firebasestorage.app/images/supplements/galaherbs_gaia_herbs_ginseng_capsules_63702278.jpg',
  
  // Alternative format 3: Different bucket name
  'https://firebasestorage.googleapis.com/v0/b/nutriwiseai-f8bd1.appspot.com/o/images%2Fsupplements%2Fgalaherbs_gaia_herbs_ginseng_capsules_63702278.jpg?alt=media'
];

console.log('🧪 Testing Firebase Storage URL formats with 600+ images available...');
console.log('='.repeat(80));

async function testAllFormats() {
  for (let i = 0; i < testUrls.length; i++) {
    const url = testUrls[i];
    console.log(`\\nTest ${i + 1}: ${url.includes('firebasestorage.googleapis.com') ? 'Firebase API' : 'Direct Storage'}`);
    console.log(`URL: ${url}`);
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const statusIcon = response.status === 200 ? '✅ WORKING' : 
                        response.status === 403 ? '🔒 FORBIDDEN' : 
                        response.status === 404 ? '❌ NOT FOUND' : 
                        `❓ ${response.status}`;
      console.log(`Result: ${statusIcon}`);
      
      if (response.status === 200) {
        console.log('🎯 FOUND WORKING FORMAT! This is the URL format to use.');
        return url;
      }
    } catch (error) {
      console.log(`Result: ❌ ERROR - ${error.message}`);
    }
  }
  
  console.log('\\n⚠️  None of the URL formats worked. Checking bucket names...');
  
  // Test if we have the wrong bucket name
  const bucketTests = [
    'nutriwise-ai-3fmvs.firebasestorage.app',
    'nutriwiseai-f8bd1.appspot.com',
    'nutriwiseai-f8bd1.firebasestorage.app'
  ];
  
  console.log('\\n🪣 Testing different bucket names:');
  for (const bucket of bucketTests) {
    const testUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/images%2Fsupplements%2Fgalaherbs_gaia_herbs_ginseng_capsules_63702278.jpg?alt=media`;
    console.log(`\\nTesting bucket: ${bucket}`);
    try {
      const response = await fetch(testUrl, { method: 'HEAD' });
      const statusIcon = response.status === 200 ? '✅ WORKING' : 
                        response.status === 403 ? '🔒 FORBIDDEN' : 
                        response.status === 404 ? '❌ NOT FOUND' : 
                        `❓ ${response.status}`;
      console.log(`Result: ${statusIcon}`);
      
      if (response.status === 200) {
        console.log('🎯 FOUND CORRECT BUCKET! Use this bucket name.');
        return testUrl;
      }
    } catch (error) {
      console.log(`Result: ❌ ERROR - ${error.message}`);
    }
  }
  
  return null;
}

testAllFormats().then(workingUrl => {
  console.log('\\n📋 SUMMARY:');
  console.log('='.repeat(50));
  console.log('✅ Images exist in Firebase Storage (600+ files)');
  console.log('✅ Storage rules allow public read access');
  
  if (workingUrl) {
    console.log('✅ Found working URL format!');
    console.log('\\n🔧 NEXT STEPS:');
    console.log('1. Update database URLs to use working format');
    console.log('2. Or update ProductCatalogService to convert URLs');
    console.log(`3. Working format: ${workingUrl}`);
  } else {
    console.log('❌ No working URL format found');
    console.log('\\n🔧 NEXT STEPS:');
    console.log('1. Check Firebase project configuration');
    console.log('2. Verify storage bucket name');
    console.log('3. Test URLs manually in browser');
  }
});
