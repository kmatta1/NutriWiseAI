/**
 * Complete Amazon Integration Test
 * Tests the full flow: AI recommendations -> Images -> Brands -> Cart
 */

import { FallbackAIService } from './src/lib/fallback-ai.js';

async function testCompleteAmazonIntegration() {
  console.log('🚀 Testing Complete Amazon Integration Flow...\n');
  
  try {
    // Initialize the AI service
    const aiService = new FallbackAIService();
    
    // Test input for recommendations
    const testInput = {
      goals: ['Improve energy levels', 'Build muscle'],
      currentSupplements: [],
      dietaryRestrictions: [],
      budget: 100,
      isPremium: true
    };
    
    console.log('1️⃣ Generating supplement recommendations...');
    const result = await aiService.generateSupplementStack(testInput);
    
    console.log('✅ Generated supplement stack:', result.name);
    console.log('📦 Number of supplements:', result.supplements.length);
    
    // Check each supplement for required properties
    console.log('\n2️⃣ Checking supplement details...');
    result.supplements.forEach((supplement, index) => {
      console.log(`\n--- Supplement ${index + 1}: ${supplement.name} ---`);
      console.log('✓ Name:', supplement.name);
      console.log('✓ Brand:', supplement.brand || '❌ Missing brand');
      console.log('✓ Image URL:', supplement.imageUrl ? '✅ Has image' : '❌ No image');
      console.log('✓ Affiliate URL:', supplement.affiliateUrl ? '✅ Has affiliate URL' : '❌ No affiliate URL');
      console.log('✓ Price:', `$${supplement.price}`);
      console.log('✓ Dosage:', supplement.dosage);
      console.log('✓ Timing:', supplement.timing);
      
      // Validate Amazon URL format
      if (supplement.affiliateUrl) {
        const isValidAmazonUrl = supplement.affiliateUrl.includes('amazon.com/dp/') && 
                                supplement.affiliateUrl.includes('tag=');
        console.log('✓ Amazon URL Format:', isValidAmazonUrl ? '✅ Valid' : '❌ Invalid');
      }
      
      // Validate image URL format
      if (supplement.imageUrl) {
        const isAmazonImage = supplement.imageUrl.includes('media-amazon') || 
                             supplement.imageUrl.includes('ssl-images-amazon') ||
                             supplement.imageUrl.includes('images-amazon');
        console.log('✓ Amazon Image:', isAmazonImage ? '✅ Amazon CDN' : '📦 Generic image');
      }
    });
    
    console.log('\n3️⃣ Testing affiliate URL generation...');
    const testUrls = [
      aiService.generateAmazonAffiliateUrl('Omega 3 Fish Oil'),
      aiService.generateAmazonAffiliateUrl('Magnesium Glycinate'),
      aiService.generateAmazonAffiliateUrl('Creatine Monohydrate')
    ];
    
    testUrls.forEach((url, index) => {
      console.log(`URL ${index + 1}:`, url);
      const isValid = url.includes('amazon.com/dp/') && url.includes('tag=nutri0ad-20');
      console.log(`Valid format: ${isValid ? '✅' : '❌'}`);
    });
    
    console.log('\n4️⃣ Testing brand mapping...');
    const testSupplements = ['Omega 3 Fish Oil', 'Magnesium Glycinate', 'Creatine Monohydrate'];
    testSupplements.forEach(supplementName => {
      const brand = aiService.getBrandForSupplement(supplementName);
      console.log(`${supplementName} -> Brand: ${brand || 'No brand mapping'}`);
    });
    
    console.log('\n🎉 Complete Amazon Integration Test Finished!');
    console.log('\n📊 Summary:');
    console.log(`- Generated ${result.supplements.length} supplements`);
    console.log(`- Supplements with brands: ${result.supplements.filter(s => s.brand).length}`);
    console.log(`- Supplements with images: ${result.supplements.filter(s => s.imageUrl).length}`);
    console.log(`- Supplements with affiliate URLs: ${result.supplements.filter(s => s.affiliateUrl).length}`);
    console.log(`- Total monthly cost: $${result.totalMonthlyCost}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCompleteAmazonIntegration();
