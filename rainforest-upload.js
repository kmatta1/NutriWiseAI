// rainforest-upload.js
// Use Rainforest API to get real Amazon product images for remaining products

require('dotenv').config(); // Load environment variables from .env
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

class RainforestImageService {
  constructor() {
    this.apiKey = process.env.RAINFOREST_API_KEY;
    if (!this.apiKey) {
      console.error('❌ RAINFOREST_API_KEY not found in environment variables');
      process.exit(1);
    }
    console.log('✅ Rainforest API key loaded');
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

  // Use Rainforest API to search for product on Amazon
  async searchAmazonProduct(productName, brand) {
    const searchQuery = `${brand || ''} ${productName}`.trim();
    console.log(`🔍 Searching Amazon for: "${searchQuery}"`);

    const requestOptions = {
      hostname: 'api.rainforestapi.com',
      path: `/request?api_key=${this.apiKey}&type=search&amazon_domain=amazon.com&search_term=${encodeURIComponent(searchQuery)}&output=json`,
      method: 'GET',
      headers: {
        'User-Agent': 'NutriWiseAI/1.0'
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (response.search_results && response.search_results.length > 0) {
              // Get the first sponsored or organic result
              const product = response.search_results.find(p => p.image && p.title) || response.search_results[0];
              
              if (product && product.image) {
                console.log(`✅ Found Amazon product: ${product.title.substring(0, 50)}...`);
                resolve({
                  title: product.title,
                  imageUrl: product.image,
                  asin: product.asin,
                  price: product.price?.value || 0,
                  rating: product.rating || 0
                });
              } else {
                console.log('⚠️  No products with images found');
                resolve(null);
              }
            } else {
              console.log('⚠️  No search results found');
              resolve(null);
            }
          } catch (error) {
            console.error('❌ Error parsing Rainforest API response:', error.message);
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Rainforest API request error:', error.message);
        reject(error);
      });

      req.setTimeout(30000, () => {
        req.abort();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  // Download image and upload to Firebase Storage
  async downloadAndUploadImage(imageUrl, productName, brand) {
    return new Promise((resolve, reject) => {
      try {
        const cleanName = this.generateImageFileName(productName, brand);
        const firebasePath = `images/supplements/${cleanName}.jpg`;
        const tempFile = path.join(os.tmpdir(), `${Date.now()}.jpg`);
        
        console.log(`📥 Downloading image from Amazon...`);
        
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

  async processAllMissingImages() {
    console.log('🚀 Starting Rainforest API image fetching process...\n');

    try {
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
        apiCalls: 0
      };

      // Process each product
      const batch = db.batch();
      
      for (const product of productsNeedingImages) {
        try {
          results.processed++;
          console.log(`\n📦 Processing: ${product.name} (${product.brand || 'No Brand'})`);
          
          // Use Rainforest API to find the product
          results.apiCalls++;
          const amazonProduct = await this.searchAmazonProduct(product.name, product.brand);
          
          if (!amazonProduct || !amazonProduct.imageUrl) {
            console.log(`⚠️  No Amazon image found for ${product.name}`);
            results.errors.push(`${product.name}: No Amazon image found`);
            continue;
          }
          
          // Download and upload to Firebase Storage
          const firebaseUrl = await this.downloadAndUploadImage(
            amazonProduct.imageUrl, 
            product.name, 
            product.brand
          );
          
          // Update database
          const docRef = db.collection('productCatalog').doc(product.id);
          batch.update(docRef, {
            imageUrl: firebaseUrl,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            imageSource: 'rainforest-api',
            amazonData: {
              asin: amazonProduct.asin,
              title: amazonProduct.title,
              rating: amazonProduct.rating,
              price: amazonProduct.price
            }
          });
          
          results.successful++;
          console.log(`✅ Updated database for ${product.name}`);
          
          // Delay between API calls to respect rate limits
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
      console.log('\n📊 RAINFOREST API RESULTS:');
      console.log('=========================');
      console.log(`📦 Products processed: ${results.processed}`);
      console.log(`🔍 API calls made: ${results.apiCalls}`);
      console.log(`✅ Successfully updated: ${results.successful}`);
      console.log(`❌ Errors: ${results.errors.length}`);

      if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(error => console.log(`  - ${error}`));
      }

      if (results.successful > 0) {
        console.log('\n🎉 SUCCESS! Used Rainforest API to get real Amazon images.');
        console.log('🔄 Restart your dev server to see the changes.');
        
        // Save results
        const resultData = {
          timestamp: new Date().toISOString(),
          apiCallsUsed: results.apiCalls,
          successfulUpdates: results.successful,
          errors: results.errors
        };
        
        fs.writeFileSync('rainforest-upload-results.json', JSON.stringify(resultData, null, 2));
        console.log('📁 Results saved to rainforest-upload-results.json');
      }

    } catch (error) {
      console.error('❌ Process failed:', error);
    }
  }
}

// Run the Rainforest image service
console.log('🌧️  RAINFOREST API IMAGE UPLOADER');
console.log('================================\n');

const service = new RainforestImageService();
service.processAllMissingImages().catch(console.error);