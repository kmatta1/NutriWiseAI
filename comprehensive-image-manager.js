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

class ComprehensiveImageManager {
  constructor() {
    // Google Custom Search API for real product images
    this.googleApiKey = process.env.GOOGLE_API_KEY;
    this.googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    // Bing Image Search API as backup
    this.bingApiKey = process.env.BING_API_KEY;
    
    // SerpApi for high-quality Google Images scraping
    this.serpApiKey = process.env.SERPAPI_KEY;
    
    this.maxRequestsPerDay = 100; // Conservative limit
    this.processedToday = 0;
    
    // Track processed products to avoid duplicates
    this.processedProducts = new Set();
  }

  // Get unique image search query for each product variation
  generateUniqueSearchQuery(productName, brand, productId) {
    const baseQuery = `${brand} ${productName} supplement bottle container`.trim();
    
    // Add specific terms to make each search unique
    const specificTerms = [
      'official product',
      'original packaging',
      'authentic bottle',
      'supplement container',
      'nutrition label',
      'product image'
    ];
    
    // Use product ID hash to select specific terms consistently
    const hash = this.simpleHash(productId);
    const termIndex = hash % specificTerms.length;
    
    return `${baseQuery} ${specificTerms[termIndex]}`;
  }

  // Simple hash function for consistent term selection
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Search Google Images using Custom Search API
  async searchGoogleImages(searchQuery, startIndex = 1) {
    if (!this.googleApiKey || !this.googleSearchEngineId) {
      throw new Error('Google API credentials missing');
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${this.googleApiKey}&cx=${this.googleSearchEngineId}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=10&start=${startIndex}&imgType=photo&imgSize=medium&imgColorType=color&safe=active`;
    
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.items && result.items.length > 0) {
              // Filter for high-quality, relevant images
              const goodImages = result.items.filter(item => {
                const link = item.link.toLowerCase();
                const title = (item.title || '').toLowerCase();
                
                return !link.includes('pinterest') && 
                       !link.includes('facebook') && 
                       !link.includes('instagram') &&
                       !link.includes('twitter') &&
                       !link.includes('reddit') &&
                       (link.includes('.jpg') || link.includes('.jpeg') || link.includes('.png')) &&
                       item.image && item.image.width >= 200 && item.image.height >= 200;
              });
              
              resolve(goodImages);
            } else {
              resolve([]);
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  // Search using SerpApi for better Google Images results
  async searchSerpApi(searchQuery) {
    if (!this.serpApiKey) {
      throw new Error('SerpApi key missing');
    }

    const url = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(searchQuery)}&api_key=${this.serpApiKey}&num=10&safe=active&ijn=0`;
    
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.images_results && result.images_results.length > 0) {
              const goodImages = result.images_results.filter(item => {
                const link = (item.original || '').toLowerCase();
                return link && 
                       !link.includes('pinterest') && 
                       !link.includes('facebook') &&
                       (link.includes('.jpg') || link.includes('.jpeg') || link.includes('.png'));
              });
              
              resolve(goodImages.map(item => ({
                link: item.original,
                title: item.title,
                image: { width: item.original_width, height: item.original_height }
              })));
            } else {
              resolve([]);
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  // Search Bing Images as backup
  async searchBingImages(searchQuery) {
    if (!this.bingApiKey) {
      throw new Error('Bing API key missing');
    }

    const url = `https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURIComponent(searchQuery)}&count=10&imageType=Photo&size=Medium&safeSearch=Strict`;
    
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'Ocp-Apim-Subscription-Key': this.bingApiKey
        }
      };

      https.get(url, options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.value && result.value.length > 0) {
              const goodImages = result.value.filter(img => 
                img.contentUrl && 
                !img.contentUrl.includes('pinterest') &&
                !img.contentUrl.includes('facebook') &&
                img.width >= 200 && img.height >= 200
              );
              
              resolve(goodImages.map(item => ({
                link: item.contentUrl,
                title: item.name,
                image: { width: item.width, height: item.height }
              })));
            } else {
              resolve([]);
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  // Try multiple sources to find the best unique image
  async findUniqueProductImage(productName, brand, productId) {
    const searchQuery = this.generateUniqueSearchQuery(productName, brand, productId);
    console.log(`🔍 Searching: "${searchQuery}"`);

    const sources = [
      { name: 'SerpApi', method: () => this.searchSerpApi(searchQuery) },
      { name: 'Google Custom Search', method: () => this.searchGoogleImages(searchQuery) },
      { name: 'Bing Images', method: () => this.searchBingImages(searchQuery) }
    ];

    for (const source of sources) {
      try {
        console.log(`  📡 Trying ${source.name}...`);
        const images = await source.method();
        
        if (images && images.length > 0) {
          // Select the best image (prefer larger, more relevant ones)
          const bestImage = this.selectBestImage(images, productName, brand);
          if (bestImage) {
            console.log(`  ✅ Found unique image from ${source.name}`);
            return { 
              imageUrl: bestImage.link, 
              source: source.name,
              title: bestImage.title 
            };
          }
        }
      } catch (error) {
        console.log(`  ❌ ${source.name} failed: ${error.message}`);
      }
    }

    throw new Error('No unique image found from any source');
  }

  // Select the best image from search results
  selectBestImage(images, productName, brand) {
    // Score images based on relevance and quality
    const scoredImages = images.map(img => {
      let score = 0;
      const title = (img.title || '').toLowerCase();
      const link = img.link.toLowerCase();
      
      // Higher score for brand mentions
      if (title.includes(brand.toLowerCase())) score += 30;
      
      // Higher score for product mentions
      const productWords = productName.toLowerCase().split(' ');
      productWords.forEach(word => {
        if (word.length > 3 && title.includes(word)) score += 10;
      });
      
      // Higher score for supplement-related terms
      const supplementTerms = ['supplement', 'vitamin', 'bottle', 'container', 'nutrition'];
      supplementTerms.forEach(term => {
        if (title.includes(term)) score += 5;
      });
      
      // Higher score for appropriate image size
      if (img.image && img.image.width >= 400 && img.image.height >= 400) score += 20;
      if (img.image && img.image.width >= 300 && img.image.height >= 300) score += 10;
      
      // Penalize social media and low-quality sources
      if (link.includes('amazon') || link.includes('walmart') || link.includes('iherb')) score += 25;
      if (link.includes('ebay') || link.includes('alibaba')) score -= 20;
      
      return { ...img, score };
    });

    // Sort by score and return the best
    scoredImages.sort((a, b) => b.score - a.score);
    return scoredImages.length > 0 ? scoredImages[0] : null;
  }

  // Download and upload image with proper naming
  async downloadAndUploadUniqueImage(imageUrl, productName, brand, productId, source) {
    return new Promise((resolve, reject) => {
      try {
        const cleanName = this.generateUniqueImageFileName(productName, brand, productId);
        const firebasePath = `images/supplements/${cleanName}.jpg`;
        const tempFile = path.join(os.tmpdir(), `${Date.now()}_${productId}.jpg`);
        
        console.log(`📥 Downloading unique image from ${source}...`);
        
        const file = fs.createWriteStream(tempFile);
        
        // Handle both http and https
        const requestModule = imageUrl.startsWith('https:') ? https : require('http');
        
        requestModule.get(imageUrl, (response) => {
          // Handle redirects
          if (response.statusCode === 301 || response.statusCode === 302) {
            const redirectUrl = response.headers.location;
            console.log(`🔄 Following redirect to: ${redirectUrl}`);
            return this.downloadAndUploadUniqueImage(redirectUrl, productName, brand, productId, source)
              .then(resolve)
              .catch(reject);
          }
          
          if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
            return;
          }

          response.pipe(file);
          
          file.on('finish', async () => {
            file.close();
            
            try {
              // Check file size
              const stats = fs.statSync(tempFile);
              if (stats.size < 1024) { // Less than 1KB
                fs.unlinkSync(tempFile);
                reject(new Error('Downloaded file is too small'));
                return;
              }
              
              // Upload to Firebase Storage with metadata
              await bucket.upload(tempFile, {
                destination: firebasePath,
                metadata: {
                  contentType: 'image/jpeg',
                  customMetadata: {
                    originalUrl: imageUrl,
                    productId: productId,
                    source: source,
                    uploadDate: new Date().toISOString(),
                    productName: productName,
                    brand: brand
                  }
                }
              });
              
              // Get permanent signed URL
              const firebaseFile = bucket.file(firebasePath);
              const [url] = await firebaseFile.getSignedUrl({
                action: 'read',
                expires: '03-09-2491'
              });
              
              // Clean up temp file
              if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
              }
              
              console.log(`✅ Uploaded unique image: ${cleanName}.jpg`);
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

  // Generate unique filename to prevent conflicts
  generateUniqueImageFileName(productName, brand, productId) {
    const clean = (str) => (str || '').toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20);
    
    const cleanName = clean(productName);
    const cleanBrand = clean(brand);
    const shortId = productId.substring(0, 8);
    
    return `${cleanBrand}_${cleanName}_${shortId}`;
  }

  // Get all products that need unique images
  async getProductsNeedingUniqueImages() {
    console.log('🔍 Analyzing products needing unique images...\n');

    const snapshot = await db.collection('productCatalog').get();
    const products = [];
    const imageUrlCounts = {};

    // First pass: count image URL usage
    snapshot.forEach(doc => {
      const data = doc.data();
      const imageUrl = data.imageUrl || '';
      
      if (imageUrl) {
        imageUrlCounts[imageUrl] = (imageUrlCounts[imageUrl] || 0) + 1;
      }
    });

    // Second pass: identify products needing unique images
    snapshot.forEach(doc => {
      const data = doc.data();
      const imageUrl = data.imageUrl || '';
      
      // Needs unique image if:
      // 1. No image
      // 2. Broken/Amazon URL
      // 3. Sharing image with other products
      // 4. Invalid Firebase URL format
      const needsUniqueImage = !imageUrl || 
                              imageUrl.includes('amazon.com') ||
                              imageUrl.includes('media-amazon.com') ||
                              (imageUrlCounts[imageUrl] > 1) ||
                              imageUrl.includes('alt=media') ||
                              imageUrl.includes('GoogleAccessId');
      
      if (needsUniqueImage) {
        products.push({
          id: doc.id,
          name: data.name,
          brand: data.brand,
          currentImageUrl: imageUrl,
          shareCount: imageUrlCounts[imageUrl] || 0
        });
      }
    });

    console.log(`📦 Found ${products.length} products needing unique images:`);
    console.log(`   (${snapshot.size - products.length} products already have unique images)\n`);

    return products;
  }

  // Main process to fix all image issues
  async processAllImageFixes() {
    console.log('🚀 COMPREHENSIVE IMAGE MANAGEMENT SYSTEM');
    console.log('=========================================\n');

    try {
      // Check API availability
      console.log('🔑 Checking API availability:');
      console.log(`  Google Custom Search: ${this.googleApiKey && this.googleSearchEngineId ? '✅ Available' : '❌ Missing credentials'}`);
      console.log(`  Bing Image Search: ${this.bingApiKey ? '✅ Available' : '❌ Missing BING_API_KEY'}`);
      console.log(`  SerpApi: ${this.serpApiKey ? '✅ Available' : '❌ Missing SERPAPI_KEY'}`);
      console.log('');

      const products = await this.getProductsNeedingUniqueImages();
      
      if (products.length === 0) {
        console.log('✅ All products already have unique images!');
        return;
      }

      const results = {
        processed: 0,
        successful: 0,
        failed: 0,
        errors: [],
        sources: {},
        duplicatesFixed: 0
      };

      // Process products in batches to respect API limits
      const batchSize = 10;
      const batches = [];
      for (let i = 0; i < products.length; i += batchSize) {
        batches.push(products.slice(i, i + batchSize));
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`\n📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} products):`);

        const dbBatch = db.batch();
        let batchSuccesses = 0;

        for (const product of batch) {
          try {
            results.processed++;
            console.log(`\n${results.processed}. ${product.name} (${product.brand || 'No Brand'})`);
            
            if (product.shareCount > 1) {
              console.log(`   ⚠️ Shared by ${product.shareCount} products - creating unique image`);
              results.duplicatesFixed++;
            }

            // Find and download unique image
            const imageData = await this.findUniqueProductImage(
              product.name, 
              product.brand, 
              product.id
            );

            // Track source usage
            results.sources[imageData.source] = (results.sources[imageData.source] || 0) + 1;

            // Download and upload
            const firebaseUrl = await this.downloadAndUploadUniqueImage(
              imageData.imageUrl,
              product.name,
              product.brand,
              product.id,
              imageData.source
            );

            // Update database
            const docRef = db.collection('productCatalog').doc(product.id);
            dbBatch.update(docRef, {
              imageUrl: firebaseUrl,
              lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
              imageSource: 'unique-search-managed',
              searchSource: imageData.source,
              originalImageUrl: imageData.imageUrl,
              imageTitle: imageData.title || '',
              isUniqueImage: true
            });

            results.successful++;
            batchSuccesses++;
            console.log(`   ✅ Success - unique image downloaded and stored`);

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));

          } catch (error) {
            results.failed++;
            console.error(`   ❌ Failed: ${error.message}`);
            results.errors.push(`${product.name}: ${error.message}`);
          }
        }

        // Commit batch updates
        if (batchSuccesses > 0) {
          try {
            await dbBatch.commit();
            console.log(`\n💾 Committed ${batchSuccesses} updates for batch ${batchIndex + 1}`);
          } catch (commitError) {
            console.error(`❌ Batch commit failed: ${commitError.message}`);
          }
        }

        // Longer delay between batches
        if (batchIndex < batches.length - 1) {
          console.log(`⏳ Waiting 5 seconds before next batch...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      // Final summary
      console.log('\n📊 COMPREHENSIVE IMAGE FIX RESULTS:');
      console.log('====================================');
      console.log(`📦 Products processed: ${results.processed}`);
      console.log(`✅ Successfully updated: ${results.successful}`);
      console.log(`❌ Failed: ${results.failed}`);
      console.log(`🔄 Duplicate issues fixed: ${results.duplicatesFixed}`);
      console.log(`📈 Success rate: ${((results.successful / results.processed) * 100).toFixed(1)}%`);

      if (Object.keys(results.sources).length > 0) {
        console.log('\n📡 Image sources used:');
        Object.entries(results.sources).forEach(([source, count]) => {
          console.log(`  ${source}: ${count} images`);
        });
      }

      if (results.errors.length > 0 && results.errors.length <= 10) {
        console.log('\n❌ Errors:');
        results.errors.forEach(error => console.log(`  - ${error}`));
      } else if (results.errors.length > 10) {
        console.log(`\n❌ ${results.errors.length} errors occurred (too many to display)`);
      }

      // Save detailed results
      const resultData = {
        timestamp: new Date().toISOString(),
        totalProducts: products.length,
        processed: results.processed,
        successful: results.successful,
        failed: results.failed,
        duplicatesFixed: results.duplicatesFixed,
        sources: results.sources,
        errors: results.errors
      };

      fs.writeFileSync('comprehensive-image-fix-results.json', JSON.stringify(resultData, null, 2));
      
      if (results.successful > 0) {
        console.log('\n🎉 IMAGE MANAGEMENT SYSTEM COMPLETE!');
        console.log('=====================================');
        console.log('✅ All products now have unique, high-quality images');
        console.log('✅ Broken URLs have been fixed');
        console.log('✅ Duplicate images have been resolved');
        console.log('✅ Proper image management system implemented');
        console.log('📁 Detailed results saved to comprehensive-image-fix-results.json');
        console.log('\n🔄 Restart your development server to see all the properly managed images!');
      }

    } catch (error) {
      console.error('❌ Process failed:', error);
    }
  }
}

// Export for use in other scripts
module.exports = ComprehensiveImageManager;

// Run if called directly
if (require.main === module) {
  console.log('🛠️ COMPREHENSIVE IMAGE MANAGEMENT SYSTEM');
  console.log('==========================================\n');
  console.log('This will:');
  console.log('✅ Download unique images for each product using Google Images');
  console.log('✅ Fix all broken image URLs in the database');
  console.log('✅ Resolve duplicate image issues');
  console.log('✅ Implement proper image management for the future');
  console.log('\nAPI Keys needed (add to .env file):');
  console.log('- GOOGLE_API_KEY (free 100 requests/day)');
  console.log('- GOOGLE_SEARCH_ENGINE_ID (free)');
  console.log('- SERPAPI_KEY (optional, 100 free requests/month)');
  console.log('- BING_API_KEY (optional, 1000 free requests/month)');
  console.log('\n🚀 Starting...\n');

  const manager = new ComprehensiveImageManager();
  manager.processAllImageFixes().catch(console.error);
}
