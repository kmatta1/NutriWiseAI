/**
 * Test Amazon Product API Integration
 * This script tests the new Amazon Product Advertising API integration
 * 
 * Before running:
 * 1. Set up your Amazon Associates account
 * 2. Get your Product Advertising API credentials
 * 3. Add credentials to .env.local file
 */

import { amazonProductService } from './src/lib/amazon-product-api.js';

async function testAmazonIntegration() {
  console.log('🚀 Testing Amazon Product API Integration...\n');

  // Test supplements to search for
  const testSupplements = [
    'Omega 3 Fish Oil',
    'Magnesium Glycinate', 
    'Vitamin D3',
    'Creatine Monohydrate',
    'Whey Protein Isolate'
  ];

  for (const supplementName of testSupplements) {
    console.log(`\n🔍 Testing: ${supplementName}`);
    console.log('─'.repeat(50));

    try {
      // Test search functionality
      console.log('1. Searching for products...');
      const products = await amazonProductService.searchSupplementProducts(supplementName);
      console.log(`   Found ${products.length} products`);

      if (products.length > 0) {
        const bestProduct = products[0];
        console.log('2. Best product details:');
        console.log(`   Title: ${bestProduct.title}`);
        console.log(`   ASIN: ${bestProduct.asin}`);
        console.log(`   Brand: ${bestProduct.brand || 'N/A'}`);
        console.log(`   Price: $${bestProduct.price}`);
        console.log(`   Prime: ${bestProduct.primeEligible ? 'Yes' : 'No'}`);
        console.log(`   Image: ${bestProduct.imageUrl ? 'Yes' : 'No'}`);
        console.log(`   Link: ${bestProduct.affiliateUrl}`);

        // Test getting specific product by ASIN
        console.log('3. Testing ASIN lookup...');
        const specificProduct = await amazonProductService.getProductByASIN(bestProduct.asin);
        if (specificProduct) {
          console.log(`   ✅ Successfully retrieved product by ASIN`);
        } else {
          console.log(`   ❌ Failed to retrieve product by ASIN`);
        }
      } else {
        console.log('   ❌ No products found');
      }

    } catch (error) {
      console.error(`   ❌ Error testing ${supplementName}:`, error.message);
    }
  }

  console.log('\n🎉 Amazon API Integration Test Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Verify Amazon Associates account is approved');
  console.log('2. Ensure API credentials are valid');
  console.log('3. Test affiliate links manually');
  console.log('4. Monitor API usage and rate limits');
}

// Run the test
testAmazonIntegration().catch(console.error);
