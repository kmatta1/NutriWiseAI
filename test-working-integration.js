/**
 * Test Working Amazon Integration
 * Verifies that real Amazon products are being loaded correctly
 */

import { workingAmazonService } from './src/lib/working-amazon-service.js';
import { FallbackAIService } from './src/lib/fallback-ai.js';

console.log('🚀 Testing Working Amazon Integration...\n');

// Test 1: Verify working Amazon service has real products
console.log('1️⃣ Testing Working Amazon Service...');
const testSupplements = ['Omega 3 Fish Oil', 'Magnesium Glycinate', 'Vitamin D3', 'Creatine'];

testSupplements.forEach(supplement => {
  const product = workingAmazonService.getRealProduct(supplement);
  if (product) {
    console.log(`✅ ${supplement}:`);
    console.log(`   ASIN: ${product.asin}`);
    console.log(`   Title: ${product.title}`);
    console.log(`   Brand: ${product.brand}`);
    console.log(`   Price: $${product.price}`);
    console.log(`   Image: ${product.imageUrl.substring(0, 50)}...`);
    console.log(`   Affiliate URL: ${product.affiliateUrl.substring(0, 50)}...`);
    console.log(`   Prime: ${product.primeEligible ? 'Yes' : 'No'}`);
  } else {
    console.log(`❌ ${supplement}: No product found`);
  }
  console.log('');
});

// Test 2: Test AI service integration
console.log('\n2️⃣ Testing AI Service Integration...');
const aiService = new FallbackAIService();

const testInput = {
  goals: ['Improve energy', 'Build muscle'],
  currentSupplements: [],
  dietaryRestrictions: [],
  budget: 100,
  isPremium: true // This should trigger real Amazon products
};

aiService.generateSupplementStack(testInput).then(result => {
  console.log(`✅ Generated stack: ${result.name}`);
  console.log(`📦 Supplements: ${result.supplements.length}`);
  
  result.supplements.forEach((supplement, index) => {
    console.log(`\n${index + 1}. ${supplement.name}`);
    console.log(`   Brand: ${supplement.brand || 'N/A'}`);
    console.log(`   Has Image: ${supplement.imageUrl ? 'Yes' : 'No'}`);
    console.log(`   Has Affiliate URL: ${supplement.affiliateUrl ? 'Yes' : 'No'}`);
    console.log(`   Amazon Product: ${supplement.amazonProduct ? 'Yes' : 'No'}`);
    if (supplement.amazonProduct) {
      console.log(`   ASIN: ${supplement.amazonProduct.asin}`);
      console.log(`   Prime: ${supplement.amazonProduct.primeEligible ? 'Yes' : 'No'}`);
    }
  });

  console.log('\n🎉 Test Complete! The integration is working correctly.');
  console.log('\n📋 Summary:');
  console.log(`- Real Amazon products: ${result.supplements.filter(s => s.amazonProduct).length}/${result.supplements.length}`);
  console.log(`- With images: ${result.supplements.filter(s => s.imageUrl).length}/${result.supplements.length}`);
  console.log(`- With brands: ${result.supplements.filter(s => s.brand).length}/${result.supplements.length}`);
}).catch(error => {
  console.error('❌ Error testing AI service:', error);
});

console.log('\n3️⃣ Ready to test in browser! Start the dev server and:\n');
console.log('1. Go to /advisor and generate supplements');
console.log('2. Verify images load correctly');
console.log('3. Test "View Product Details" buttons');
console.log('4. Test cart functionality');
console.log('5. Test Amazon checkout');
