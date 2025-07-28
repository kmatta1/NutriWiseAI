// free-image-scraping-options.js
// Multiple free options for getting supplement product images

require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');
const https = require('https');
const fs = require('fs');
const os = require('os');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = require(path.resolve(__dirname, 'serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'nutriwise-ai-3fmvs.firebasestorage.app'
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

class FreeImageScrapingService {
  constructor() {
    // Option 1: Unsplash API (Free tier: 50 requests/hour)
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY; // Get free at unsplash.com/developers
    
    // Option 2: Pixabay API (Free tier: 20,000 requests/month)
    this.pixabayApiKey = process.env.PIXABAY_API_KEY; // Get free at pixabay.com/api/
    
    // Option 3: Pexels API (Free tier: 200 requests/hour)
    this.pexelsApiKey = process.env.PEXELS_API_KEY; // Get free at pexels.com/api/
    
    // Option 4: Free manufacturer websites (no API needed)
    this.manufacturerSites = {
      'garden of life': 'https://www.gardenoflife.com',
      'optimum nutrition': 'https://www.optimumnutrition.com',
      'now foods': 'https://www.nowfoods.com',
      'nature made': 'https://www.naturemade.com',
      'rainbow light': 'https://www.rainbowlight.com',
      'vitafusion': 'https://www.vitafusion.com',
      'centrum': 'https://www.centrum.com',
      'nature bounty': 'https://www.naturebounty.com'
    };
    
    // Option 5: Generic supplement images from free sources
    this.genericSupplementImages = [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800', // Vitamin pills
      'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800', // Supplement bottle
      'https://images.unsplash.com/photo-1550572017-edd951b55104?w=800', // Pills and capsules
      'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800', // Vitamin D
      'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=800', // Omega 3
      'https://images.unsplash.com/photo-1616671276441-8f6c0e3e83ae?w=800', // Protein powder
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800', // Multivitamin
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800', // Supplement capsules
      'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=800'  // Health supplements
    ];
  }

  // Option 1: Search Unsplash for supplement images
  async searchUnsplash(query) {
    if (!this.unsplashAccessKey) {
      throw new Error('UNSPLASH_ACCESS_KEY not found in .env file');
    }

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' supplement vitamin')}&per_page=5&orientation=portrait`;
    
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'Authorization': `Client-ID ${this.unsplashAccessKey}`
        }
      };

      https.get(url, options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.results && result.results.length > 0) {
              resolve(result.results[0].urls.regular);
            } else {
              resolve(null);
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  // Option 2: Search Pixabay for supplement images
  async searchPixabay(query) {
    if (!this.pixabayApiKey) {
      throw new Error('PIXABAY_API_KEY not found in .env file');
    }

    const url = `https://pixabay.com/api/?key=${this.pixabayApiKey}&q=${encodeURIComponent(query + ' supplement vitamin pills')}&image_type=photo&category=health&per_page=5&min_width=400`;
    
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.hits && result.hits.length > 0) {
              resolve(result.hits[0].webformatURL);
            } else {
              resolve(null);
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  // Option 3: Search Pexels for supplement images
  async searchPexels(query) {
    if (!this.pexelsApiKey) {
      throw new Error('PEXELS_API_KEY not found in .env file');
    }

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query + ' supplement vitamin')}&per_page=5&orientation=portrait`;
    
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'Authorization': this.pexelsApiKey
        }
      };

      https.get(url, options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.photos && result.photos.length > 0) {
              resolve(result.photos[0].src.medium);
            } else {
              resolve(null);
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  // Option 4: Get manufacturer website URL (for manual scraping)
  getManufacturerWebsite(brand) {
    const brandLower = (brand || '').toLowerCase();
    for (const [key, url] of Object.entries(this.manufacturerSites)) {
      if (brandLower.includes(key)) {
        return url;
      }
    }
    return null;
  }

  // Option 5: Get random generic supplement image
  getGenericSupplementImage() {
    const randomIndex = Math.floor(Math.random() * this.genericSupplementImages.length);
    return this.genericSupplementImages[randomIndex];
  }

  // Try multiple sources to find an image
  async findImageFromMultipleSources(productName, brand) {
    const searchTerm = `${productName} ${brand || ''}`.trim();
    console.log(`🔍 Searching for: "${searchTerm}"`);

    // Try each source in order
    const sources = [
      { name: 'Unsplash', method: () => this.searchUnsplash(searchTerm) },
      { name: 'Pixabay', method: () => this.searchPixabay(searchTerm) },
      { name: 'Pexels', method: () => this.searchPexels(searchTerm) }
    ];

    for (const source of sources) {
      try {
        console.log(`  📡 Trying ${source.name}...`);
        const imageUrl = await source.method();
        if (imageUrl) {
          console.log(`  ✅ Found image from ${source.name}`);
          return { imageUrl, source: source.name };
        }
      } catch (error) {
        console.log(`  ❌ ${source.name} failed: ${error.message}`);
      }
    }

    // Fallback to generic supplement image
    console.log(`  🎲 Using generic supplement image`);
    return { 
      imageUrl: this.getGenericSupplementImage(), 
      source: 'generic' 
    };
  }

  // Download and upload to Firebase Storage
  async downloadAndUploadImage(imageUrl, productName, brand, source) {
    return new Promise((resolve, reject) => {
      try {
        const cleanName = this.generateImageFileName(productName, brand);
        const firebasePath = `images/supplements/${cleanName}.jpg`;
        const tempFile = path.join(os.tmpdir(), `${Date.now()}.jpg`);
        
        console.log(`📥 Downloading from ${source}...`);
        
        const file = fs.createWriteStream(tempFile);
        
        https.get(imageUrl, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
            return;
          }

          response.pipe(file);
          
          file.on('finish', async () => {
            file.close();
            
            try {
              // Upload to Firebase Storage
              await bucket.upload(tempFile, {
                destination: firebasePath,
                metadata: {
                  contentType: 'image/jpeg'
                }
              });
              
              // Get public URL
              const firebaseFile = bucket.file(firebasePath);
              const [url] = await firebaseFile.getSignedUrl({
                action: 'read',
                expires: '03-09-2491'
              });
              
              // Clean up temp file
              if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
              }
              
              console.log(`✅ Uploaded to Firebase Storage: ${cleanName}.jpg`);
              resolve(url);
              
            } catch (uploadError) {
              if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
              }
              reject(uploadError);
            }
          });
          
        }).on('error', (error) => {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
          reject(error);
        });
        
      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate clean filename
  generateImageFileName(productName, brand) {
    const clean = (str) => (str || '').toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 40);
    
    const cleanName = clean(productName);
    const cleanBrand = clean(brand);
    
    if (cleanName && cleanBrand && (cleanName.length + cleanBrand.length + 1) <= 40) {
      return `${cleanBrand}_${cleanName}`;
    } else if (cleanName) {
      return cleanName;
    } else if (cleanBrand) {
      return cleanBrand;
    } else {
      return 'unnamed_supplement';
    }
  }

  async findProductsNeedingImages() {
    console.log('🔍 Finding products that still need images...\n');

    const snapshot = await db.collection('productCatalog').get();
    const productsNeedingImages = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const imageUrl = data.imageUrl || '';
      
      // Check if product has Amazon URL (broken) or no image
      if (!imageUrl || imageUrl.includes('amazon.com')) {
        productsNeedingImages.push({
          id: doc.id,
          name: data.name,
          brand: data.brand,
          currentImageUrl: imageUrl
        });
      }
    });

    console.log(`📦 Found ${productsNeedingImages.length} products needing images:`);
    productsNeedingImages.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} (${product.brand || 'No Brand'})`);
    });

    return productsNeedingImages;
  }

  async processAllMissingImages() {
    console.log('🚀 Starting free image scraping process...\n');

    try {
      // Check which APIs are available
      console.log('🔑 Checking available APIs:');
      console.log(`  Unsplash: ${this.unsplashAccessKey ? '✅ Available' : '❌ Missing UNSPLASH_ACCESS_KEY'}`);
      console.log(`  Pixabay: ${this.pixabayApiKey ? '✅ Available' : '❌ Missing PIXABAY_API_KEY'}`);
      console.log(`  Pexels: ${this.pexelsApiKey ? '✅ Available' : '❌ Missing PEXELS_API_KEY'}`);
      console.log('');

      // Find products needing images
      const productsNeedingImages = await this.findProductsNeedingImages();
      
      if (productsNeedingImages.length === 0) {
        console.log('✅ All products already have working images!');
        return;
      }

      const results = {
        processed: 0,
        successful: 0,
        errors: [],
        sources: {}
      };

      // Process each product
      const batch = db.batch();
      
      for (const product of productsNeedingImages) {
        try {
          results.processed++;
          console.log(`\n📦 Processing: ${product.name} (${product.brand || 'No Brand'})`);
          
          // Find image from multiple sources
          const imageData = await this.findImageFromMultipleSources(product.name, product.brand);
          
          // Track source usage
          results.sources[imageData.source] = (results.sources[imageData.source] || 0) + 1;
          
          // Download and upload to Firebase Storage
          const firebaseUrl = await this.downloadAndUploadImage(
            imageData.imageUrl, 
            product.name, 
            product.brand,
            imageData.source
          );
          
          // Update database
          const docRef = db.collection('productCatalog').doc(product.id);
          batch.update(docRef, {
            imageUrl: firebaseUrl,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            imageSource: imageData.source,
            originalImageUrl: imageData.imageUrl
          });
          
          results.successful++;
          console.log(`✅ Updated database for ${product.name}`);
          
          // Small delay to respect API rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`❌ Failed to process ${product.name}:`, error.message);
          results.errors.push(`${product.name}: ${error.message}`);
        }
      }

      // Commit all database updates
      if (results.successful > 0) {
        await batch.commit();
        console.log(`\n💾 Committed ${results.successful} database updates`);
      }

      // Final summary
      console.log('\n📊 FREE IMAGE SCRAPING RESULTS:');
      console.log('================================');
      console.log(`📦 Products processed: ${results.processed}`);
      console.log(`✅ Successfully updated: ${results.successful}`);
      console.log(`❌ Errors: ${results.errors.length}`);
      
      console.log('\n📡 Sources used:');
      Object.entries(results.sources).forEach(([source, count]) => {
        console.log(`  ${source}: ${count} images`);
      });

      if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(error => console.log(`  - ${error}`));
      }

      if (results.successful > 0) {
        console.log('\n🎉 SUCCESS! Used free image sources to complete coverage.');
        console.log('🔄 Restart your dev server to see all products with working images.');
        
        // Save results
        const resultData = {
          timestamp: new Date().toISOString(),
          method: 'free-image-scraping',
          successfulUpdates: results.successful,
          sources: results.sources,
          errors: results.errors
        };
        
        fs.writeFileSync('free-image-scraping-results.json', JSON.stringify(resultData, null, 2));
        console.log('📁 Results saved to free-image-scraping-results.json');
      }

    } catch (error) {
      console.error('❌ Process failed:', error);
    }
  }

  // Test API connections
  async testApiConnections() {
    console.log('🧪 Testing API connections...\n');

    const testTerm = 'vitamin';

    if (this.unsplashAccessKey) {
      try {
        const result = await this.searchUnsplash(testTerm);
        console.log(`✅ Unsplash: ${result ? 'Working' : 'No results'}`);
      } catch (error) {
        console.log(`❌ Unsplash: ${error.message}`);
      }
    }

    if (this.pixabayApiKey) {
      try {
        const result = await this.searchPixabay(testTerm);
        console.log(`✅ Pixabay: ${result ? 'Working' : 'No results'}`);
      } catch (error) {
        console.log(`❌ Pixabay: ${error.message}`);
      }
    }

    if (this.pexelsApiKey) {
      try {
        const result = await this.searchPexels(testTerm);
        console.log(`✅ Pexels: ${result ? 'Working' : 'No results'}`);
      } catch (error) {
        console.log(`❌ Pexels: ${error.message}`);
      }
    }

    console.log(`✅ Generic images: ${this.genericSupplementImages.length} available`);
  }
}

// Export for use in other scripts
module.exports = FreeImageScrapingService;

// Run if called directly
if (require.main === module) {
  console.log('🆓 FREE IMAGE SCRAPING SERVICE');
  console.log('==============================\n');
  console.log('Testing multiple free sources for supplement images...\n');

  const service = new FreeImageScrapingService();
  
  // Test APIs first
  service.testApiConnections().then(() => {
    console.log('\n🚀 Starting image processing...\n');
    return service.processAllMissingImages();
  }).catch(console.error);
}
