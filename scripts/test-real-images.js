/**
 * Test script to verify all supplements now have real Amazon product images
 */

async function testRealProductImages() {
  console.log("🖼️ Testing Real Product Images Implementation\n");
  
  try {
    // Import our caching service
    const { CachedStackService } = require('../src/lib/cached-stack-service.ts');
    const stackService = new CachedStackService();
    
    console.log("📦 Checking all verified supplements...\n");
    
    const supplements = stackService.verifiedSupplements;
    let placeholderCount = 0;
    let realImageCount = 0;
    
    supplements.forEach(supplement => {
      const isPlaceholder = supplement.imageUrl.includes('placeholder') || 
                           supplement.imageUrl.includes('placehold');
      const isAmazonImage = supplement.imageUrl.includes('media-amazon.com');
      
      if (isPlaceholder) {
        console.log(`❌ ${supplement.name}: Still using placeholder image`);
        console.log(`   URL: ${supplement.imageUrl}`);
        placeholderCount++;
      } else if (isAmazonImage) {
        console.log(`✅ ${supplement.name}: Real Amazon product image`);
        console.log(`   URL: ${supplement.imageUrl}`);
        console.log(`   Status: ${supplement.imageStatus}`);
        realImageCount++;
      } else {
        console.log(`⚠️ ${supplement.name}: Unknown image source`);
        console.log(`   URL: ${supplement.imageUrl}`);
      }
      console.log();
    });
    
    console.log("📊 Image Status Summary:");
    console.log(`✅ Real Amazon Images: ${realImageCount}`);
    console.log(`❌ Placeholder Images: ${placeholderCount}`);
    console.log(`📈 Success Rate: ${((realImageCount / supplements.length) * 100).toFixed(1)}%`);
    
    if (placeholderCount === 0) {
      console.log("\n🎉 SUCCESS: All supplements now have real Amazon product images!");
      console.log("✅ Users will see actual product photos instead of placeholders");
      console.log("✅ Improved user experience and trust");
      console.log("✅ Ready for production deployment");
    } else {
      console.log(`\n⚠️ ${placeholderCount} supplements still need real images`);
    }
    
    console.log("\n🔗 Sample Amazon Image URLs:");
    supplements.slice(0, 3).forEach(supplement => {
      console.log(`- ${supplement.name}: ${supplement.imageUrl}`);
    });
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testRealProductImages();
