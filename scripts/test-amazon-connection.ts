/**
 * Amazon Product API Connection Test
 * 
 * Simple test script to validate your Amazon Product Advertising API credentials
 * and connection before running the full product population script.
 */

import { AmazonProductAPI, SUPPLEMENT_COMBINATIONS } from './amazon-product-fetcher';

async function testAmazonConnection() {
  console.log('🧪 Testing Amazon Product API Connection...\n');

  // Check environment variables
  const requiredEnvVars = ['AMAZON_ACCESS_KEY', 'AMAZON_SECRET_KEY', 'AMAZON_ASSOCIATE_TAG'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.log('\n💡 Please check your .env.local file and ensure all credentials are set.');
    return false;
  }

  console.log('✅ Environment variables configured');

  try {
    // Initialize API client
    const amazonAPI = new AmazonProductAPI();
    console.log('✅ Amazon API client initialized');

    // Test with a simple search
    console.log('🔍 Testing API with sample search...');
    
    const testSearchRequest = {
      keywords: 'whey protein powder',
      searchIndex: 'HealthPersonalCare',
      itemCount: 3
    };

    const startTime = Date.now();
    const products = await amazonAPI.searchItems(testSearchRequest);
    const endTime = Date.now();

    console.log(`✅ API Response received in ${endTime - startTime}ms`);
    console.log(`📦 Found ${products.length} products`);

    if (products.length > 0) {
      console.log('\n🎯 Sample Product Data:');
      const sampleProduct = products[0];
      console.log(`   Title: ${sampleProduct.title.substring(0, 60)}...`);
      console.log(`   Brand: ${sampleProduct.brand}`);
      console.log(`   Price: ${sampleProduct.price.displayAmount}`);
      console.log(`   Image: ${sampleProduct.images.primary ? '✅ Available' : '❌ Missing'}`);
      console.log(`   ASIN: ${sampleProduct.asin}`);
      console.log(`   Affiliate URL: ${sampleProduct.affiliateUrl.substring(0, 60)}...`);
    }

    console.log('\n📊 System Readiness Check:');
    console.log(`✅ API Authentication: Working`);
    console.log(`✅ Product Search: Functional`);
    console.log(`✅ Image URLs: ${products.filter(p => p.images.primary).length}/${products.length} valid`);
    console.log(`✅ Pricing Data: ${products.filter(p => p.price.amount > 0).length}/${products.length} valid`);

    console.log('\n🚀 Ready to run full product population!');
    console.log('   Command: npm run populate-amazon-products');
    
    return true;

  } catch (error) {
    console.error('\n❌ API Test Failed:');
    console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (error instanceof Error) {
      if (error.message.includes('InvalidSignature')) {
        console.log('\n💡 Troubleshooting Tips:');
        console.log('   - Double-check your AWS Access Key and Secret Key');
        console.log('   - Ensure your system clock is synchronized');
        console.log('   - Verify your Amazon Associate Tag is correct');
      } else if (error.message.includes('TooManyRequests')) {
        console.log('\n💡 Rate Limiting Detected:');
        console.log('   - Wait a moment and try again');
        console.log('   - Check your daily API usage limits');
      }
    }
    
    return false;
  }
}

async function displaySystemInfo() {
  console.log('📋 System Configuration:');
  console.log(`   Archetypes to process: ${SUPPLEMENT_COMBINATIONS.length}`);
  console.log(`   Total search terms: ${SUPPLEMENT_COMBINATIONS.reduce((sum, combo) => sum + combo.searchTerms.length, 0)}`);
  console.log(`   Estimated products: ~${SUPPLEMENT_COMBINATIONS.reduce((sum, combo) => sum + combo.searchTerms.length, 0) * 5}`);
  console.log(`   Estimated runtime: ~${Math.ceil(SUPPLEMENT_COMBINATIONS.reduce((sum, combo) => sum + combo.searchTerms.length, 0) / 60)} minutes\n`);
}

// Main test execution
async function main() {
  await displaySystemInfo();
  const success = await testAmazonConnection();
  
  if (success) {
    console.log('\n🎉 Connection test passed! You\'re ready to populate the database.');
  } else {
    console.log('\n🔧 Please fix the issues above before running the full script.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { testAmazonConnection };
