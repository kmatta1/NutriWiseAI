// reliable-image-sources.js
// Test multiple reliable sources for supplement images

const https = require('https');

class ReliableImageSourcesTester {
  constructor() {
    this.sources = {
      // 1. Vitacost - Usually allows image access
      vitacost: {
        baseUrl: 'https://www.vitacost.com',
        sampleImage: 'https://cdn.vitacost.com/images/products/1000/optimum-nutrition-gold-standard-100-whey-protein.jpg',
        description: 'Large supplement retailer with CDN images'
      },
      
      // 2. Swanson Vitamins - Often accessible
      swanson: {
        baseUrl: 'https://www.swansonvitamins.com',
        sampleImage: 'https://www.swansonvitamins.com/images/products/medium/SWU133.jpg',
        description: 'Well-known vitamin retailer'
      },
      
      // 3. A1Supplements - Sports nutrition focused
      a1supplements: {
        baseUrl: 'https://www.a1supplements.com',
        sampleImage: 'https://www.a1supplements.com/media/catalog/product/o/p/optimum-nutrition-gold-standard-100-whey-protein-5-lbs.jpg',
        description: 'Sports nutrition specialist'
      },
      
      // 4. Bodybuilding.com - Large sports nutrition site
      bodybuilding: {
        baseUrl: 'https://www.bodybuilding.com',
        sampleImage: 'https://www.bodybuilding.com/images/2020/xdb/originals/xdb-44e-dumbbell-bicep-curl-m1-16x9.jpg',
        description: 'Major fitness/supplement platform'
      },
      
      // 5. PricePlow - Supplement price comparison (has images)
      priceplow: {
        baseUrl: 'https://priceplow.com',
        sampleImage: 'https://priceplow.com/img/products/optimum-nutrition-gold-standard-whey.jpg',
        description: 'Supplement price comparison site'
      },
      
      // 6. Supplement manufacturer CDNs
      manufacturers: {
        optimumNutrition: 'https://www.optimumnutrition.com/dw/image/v2/productimages/',
        gardenOfLife: 'https://www.gardenoflife.com/on/demandware.static/',
        nowFoods: 'https://www.nowfoods.com/sites/default/files/',
        natureMade: 'https://www.naturemade.com/sites/default/files/',
        description: 'Direct from manufacturer websites'
      },
      
      // 7. Wikimedia Commons - Free, stable images
      wikimedia: {
        baseUrl: 'https://commons.wikimedia.org',
        sampleImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Vitamin_pills.jpg/800px-Vitamin_pills.jpg',
        description: 'Free, permanent images (limited selection)'
      },
      
      // 8. Unsplash specific stable URLs (not dynamic)
      unsplashStable: {
        baseUrl: 'https://images.unsplash.com',
        sampleImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae',
        description: 'Stable Unsplash URLs (specific photo IDs)'
      },
      
      // 9. iStock/Getty (if we use specific image IDs)
      istock: {
        baseUrl: 'https://media.istockphoto.com',
        sampleImage: 'https://media.istockphoto.com/photos/vitamin-d-supplement-capsules-picture-id1234567890',
        description: 'Professional stock photos (may require licensing)'
      },
      
      // 10. Local pharmacy chains
      cvs: {
        baseUrl: 'https://www.cvs.com',
        sampleImage: 'https://www.cvs.com/dw/image/iw_400,ih_400,im_Crop/D1/perch/productimages/',
        description: 'CVS Pharmacy product images'
      }
    };
  }

  async testImageUrl(url, sourceName) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'Timeout' });
      }, 5000);

      https.get(url, (response) => {
        clearTimeout(timeout);
        
        const result = {
          success: response.statusCode === 200,
          statusCode: response.statusCode,
          contentType: response.headers['content-type'],
          contentLength: response.headers['content-length'],
          source: sourceName
        };
        
        response.destroy(); // Don't download the full image
        resolve(result);
        
      }).on('error', (error) => {
        clearTimeout(timeout);
        resolve({ 
          success: false, 
          error: error.message,
          source: sourceName 
        });
      });
    });
  }

  async testAllSources() {
    console.log('🧪 Testing Reliable Image Sources for Supplements\n');
    console.log('=' .repeat(60) + '\n');

    const results = [];

    for (const [sourceName, sourceData] of Object.entries(this.sources)) {
      if (sourceName === 'manufacturers') {
        console.log(`🏭 ${sourceName.toUpperCase()}: ${sourceData.description}`);
        console.log('   → Multiple manufacturer CDNs available\n');
        continue;
      }

      console.log(`🔍 Testing ${sourceName.toUpperCase()}...`);
      console.log(`   URL: ${sourceData.sampleImage}`);
      console.log(`   Description: ${sourceData.description}`);

      const result = await this.testImageUrl(sourceData.sampleImage, sourceName);
      results.push(result);

      if (result.success) {
        console.log(`   ✅ SUCCESS - Status: ${result.statusCode}, Type: ${result.contentType}`);
      } else {
        console.log(`   ❌ FAILED - ${result.error || `Status: ${result.statusCode}`}`);
      }
      console.log('');
    }

    // Summary
    console.log('\n📊 SUMMARY OF WORKING SOURCES:');
    console.log('=' .repeat(40));
    
    const workingSources = results.filter(r => r.success);
    const failedSources = results.filter(r => !r.success);

    console.log(`\n✅ Working Sources: ${workingSources.length}`);
    workingSources.forEach(source => {
      console.log(`   • ${source.source.toUpperCase()}`);
    });

    console.log(`\n❌ Failed Sources: ${failedSources.length}`);
    failedSources.forEach(source => {
      console.log(`   • ${source.source.toUpperCase()} - ${source.error || 'HTTP ' + source.statusCode}`);
    });

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('=' .repeat(30));
    
    if (workingSources.length > 0) {
      console.log('\n🎯 Use these working sources for supplement images:');
      workingSources.forEach(source => {
        const sourceData = this.sources[source.source];
        console.log(`\n${source.source.toUpperCase()}:`);
        console.log(`   • Base URL: ${sourceData.baseUrl}`);
        console.log(`   • Description: ${sourceData.description}`);
        console.log(`   • Status: Working ✅`);
      });
    }

    console.log('\n🔄 Alternative Strategies:');
    console.log('   1. Use manufacturer websites directly');
    console.log('   2. Use stable Unsplash photo IDs (not dynamic URLs)');
    console.log('   3. Use Wikimedia Commons for basic supplement categories');
    console.log('   4. Create local image repository');
    console.log('   5. Use Google Custom Search API (100 free searches/day)');

    return results;
  }

  // Get specific stable Unsplash URLs by photo ID
  getStableUnsplashUrls() {
    return {
      // These are permanent photo IDs from Unsplash
      multivitamin: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae',
      vitaminD: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2',
      omega3: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926',
      protein: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f',
      creatine: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b',
      magnesium: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb',
      collagen: 'https://images.unsplash.com/photo-1550572017-edd951b55104',
      greenTea: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7',
      preworkout: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      bcaa: 'https://images.unsplash.com/photo-1594736797933-d0601ba2fe65'
    };
  }

  // Test Google Custom Search API for supplement images
  async testGoogleCustomSearch() {
    console.log('\n🔍 Google Custom Search API Information:');
    console.log('=' .repeat(40));
    console.log('• Free tier: 100 searches per day');
    console.log('• Setup: Create Custom Search Engine at cse.google.com');
    console.log('• Get API key from Google Cloud Console');
    console.log('• Can search specific sites like manufacturer websites');
    console.log('• More likely to find exact product matches');
    
    console.log('\nExample API call:');
    console.log('https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_CSE_ID&q=optimum+nutrition+gold+standard+whey&searchType=image');
  }
}

// Run the test
console.log('🌐 SUPPLEMENT IMAGE SOURCE TESTER');
console.log('=================================\n');

const tester = new ReliableImageSourcesTester();
tester.testAllSources()
  .then(() => {
    console.log('\n📋 NEXT STEPS:');
    console.log('==============');
    console.log('1. Use the working sources identified above');
    console.log('2. Set up Google Custom Search API for best results');
    console.log('3. Create a curated list of stable manufacturer images');
    console.log('4. Use Wikimedia Commons for basic categories');
    console.log('\n🎯 Goal: Find reliable, permanent image URLs that won\'t change!');
    
    // Show stable Unsplash alternatives
    tester.testGoogleCustomSearch();
  })
  .catch(console.error);
