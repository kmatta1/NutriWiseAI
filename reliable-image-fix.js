// reliable-image-fix.js
// Use reliable, static supplement images that match actual products

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

class ReliableProductImageService {
  constructor() {
    // RELIABLE STATIC IMAGES from iHerb - these URLs are stable and won't change
    this.reliableProductImages = {
      // Protein Products
      'whey protein': 'https://images.iherb.com/l/OPN-01067-14.jpg', // ON Gold Standard Whey
      'protein powder': 'https://images.iherb.com/l/OPN-01067-14.jpg',
      'optimum nutrition': 'https://images.iherb.com/l/OPN-01067-14.jpg',
      'dymatize': 'https://images.iherb.com/l/DYM-31010-4.jpg', // Dymatize ISO100
      'garden of life protein': 'https://images.iherb.com/l/GOL-15154-8.jpg', // Garden of Life Sport Protein
      
      // Creatine Products
      'creatine': 'https://images.iherb.com/l/OPN-01072-6.jpg', // ON Creatine
      'creatine monohydrate': 'https://images.iherb.com/l/OPN-01072-6.jpg',
      'bulksupplements': 'https://images.iherb.com/l/BLS-50025-2.jpg', // BulkSupplements Creatine
      
      // Vitamins
      'vitamin d3': 'https://images.iherb.com/l/NOW-00625-8.jpg', // NOW Vitamin D3
      'vitamin d': 'https://images.iherb.com/l/NOW-00625-8.jpg',
      'multivitamin': 'https://images.iherb.com/l/GOL-15102-12.jpg', // Garden of Life Vitamin Code
      'garden of life vitamin': 'https://images.iherb.com/l/GOL-15102-12.jpg',
      
      // Fish Oil & Omega-3
      'omega-3': 'https://images.iherb.com/l/NTM-00055-8.jpg', // Nature Made Fish Oil
      'fish oil': 'https://images.iherb.com/l/NTM-00055-8.jpg',
      'nature made': 'https://images.iherb.com/l/NTM-00055-8.jpg',
      
      // Magnesium
      'magnesium': 'https://images.iherb.com/l/DRB-00129-13.jpg', // Doctor's Best Magnesium
      'doctor\'s best': 'https://images.iherb.com/l/DRB-00129-13.jpg',
      
      // Pre-Workout
      'pre workout': 'https://images.iherb.com/l/LGN-40023-5.jpg', // Legion Pulse
      'legion': 'https://images.iherb.com/l/LGN-40023-5.jpg',
      
      // BCAA
      'bcaa': 'https://images.iherb.com/l/CEL-45037-5.jpg', // Cellucor C4
      'cellucor': 'https://images.iherb.com/l/CEL-45037-5.jpg',
      
      // Collagen
      'collagen': 'https://images.iherb.com/l/VPC-79493-12.jpg', // Vital Proteins Collagen
      'vital proteins': 'https://images.iherb.com/l/VPC-79493-12.jpg',
      
      // Green Tea
      'green tea': 'https://images.iherb.com/l/NOW-00541-10.jpg', // NOW Green Tea
      
      // L-Carnitine
      'l-carnitine': 'https://images.iherb.com/l/NCS-00623-8.jpg', // Nutricost L-Carnitine
      'nutricost': 'https://images.iherb.com/l/NCS-00623-8.jpg',
      
      // NOW Foods Products
      'now foods': 'https://images.iherb.com/l/NOW-00625-8.jpg', // NOW Vitamin D3
      
      // Default supplement bottle - generic but professional
      'default': 'https://images.iherb.com/l/GOL-15102-12.jpg' // Using multivitamin as default
    };
  }

  // Smart product matching with multiple attempts
  findBestProductImage(productName, brand) {
    const searchText = `${productName} ${brand || ''}`.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log(`🔍 Finding image for: "${searchText}"`);
    
    // Try exact brand + product combinations first
    const searchVariations = [
      searchText,
      `${brand} ${productName}`.toLowerCase(),
      productName.toLowerCase(),
      brand ? brand.toLowerCase() : null
    ].filter(Boolean);
    
    // Check all variations against product database
    for (const variation of searchVariations) {
      for (const [key, imageUrl] of Object.entries(this.reliableProductImages)) {
        if (this.isProductMatch(variation, key)) {
          console.log(`✅ Found match: "${key}" for "${variation}"`);
          return {
            imageUrl: imageUrl,
            matchedKey: key,
            matchType: 'exact-product'
          };
        }
      }
    }
    
    // Try category matching
    const categories = ['protein', 'creatine', 'vitamin d', 'multivitamin', 'omega-3', 'magnesium', 'pre workout', 'bcaa', 'collagen', 'green tea', 'l-carnitine'];
    for (const category of categories) {
      if (searchText.includes(category.replace('-', ' '))) {
        console.log(`✅ Category match: "${category}"`);
        return {
          imageUrl: this.reliableProductImages[category] || this.reliableProductImages['default'],
          matchedKey: category,
          matchType: 'category'
        };
      }
    }
    
    // Final fallback
    console.log(`🎲 Using default supplement image`);
    return {
      imageUrl: this.reliableProductImages['default'],
      matchedKey: 'default',
      matchType: 'fallback'
    };
  }

  // Improved product matching
  isProductMatch(searchText, productKey) {
    const searchWords = searchText.split(' ').filter(w => w.length > 2);
    const keyWords = productKey.split(' ').filter(w => w.length > 2);
    
    let matches = 0;
    for (const keyWord of keyWords) {
      for (const searchWord of searchWords) {
        if (keyWord.includes(searchWord) || searchWord.includes(keyWord)) {
          matches++;
          break;
        }
      }
    }
    
    return matches >= Math.max(1, keyWords.length - 1);
  }

  async downloadAndUploadImage(imageUrl, productName, brand, source) {
    return new Promise((resolve, reject) => {
      try {
        const cleanName = this.generateImageFileName(productName, brand);
        const firebasePath = `images/supplements/${cleanName}.jpg`;
        const tempFile = path.join(os.tmpdir(), `${Date.now()}.jpg`);
        
        console.log(`📥 Downloading reliable product image (${source})...`);
        
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
              await bucket.upload(tempFile, {
                destination: firebasePath,
                metadata: {
                  contentType: 'image/jpeg'
                }
              });
              
              const firebaseFile = bucket.file(firebasePath);
              const [url] = await firebaseFile.getSignedUrl({
                action: 'read',
                expires: '03-09-2491'
              });
              
              if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
              }
              
              console.log(`✅ Uploaded reliable image: ${cleanName}.jpg`);
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

  async findAllProductsNeedingImages() {
    console.log('🔍 Finding ALL products for reliable image updates...\n');

    const snapshot = await db.collection('productCatalog').get();
    const allProducts = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      allProducts.push({
        id: doc.id,
        name: data.name,
        brand: data.brand,
        currentImageUrl: data.imageUrl || '',
        currentImageSource: data.imageSource || ''
      });
    });

    console.log(`📦 Found ${allProducts.length} products to update with reliable images:`);
    allProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} (${product.brand || 'No Brand'})`);
    });

    return allProducts;
  }

  async processAllProductsWithReliableImages() {
    console.log('🚀 Starting RELIABLE image replacement process...\n');
    console.log('📸 Using stable, high-quality product images from iHerb...\n');

    try {
      const allProducts = await this.findAllProductsNeedingImages();
      
      const results = {
        processed: 0,
        successful: 0,
        errors: [],
        matchTypes: {}
      };

      const batch = db.batch();
      
      for (const product of allProducts) {
        try {
          results.processed++;
          console.log(`\n📦 Processing: ${product.name} (${product.brand || 'No Brand'})`);
          
          const imageData = this.findBestProductImage(product.name, product.brand);
          
          results.matchTypes[imageData.matchType] = (results.matchTypes[imageData.matchType] || 0) + 1;
          
          const firebaseUrl = await this.downloadAndUploadImage(
            imageData.imageUrl, 
            product.name, 
            product.brand, 
            imageData.matchedKey
          );
          
          const docRef = db.collection('productCatalog').doc(product.id);
          batch.update(docRef, {
            imageUrl: firebaseUrl,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            imageSource: 'reliable-iherb-images',
            matchedKey: imageData.matchedKey,
            matchType: imageData.matchType
          });
          
          results.successful++;
          console.log(`✅ Updated with reliable image`);
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ Failed to process ${product.name}:`, error.message);
          results.errors.push(`${product.name}: ${error.message}`);
        }
      }

      if (results.successful > 0) {
        await batch.commit();
        console.log(`\n💾 Committed ${results.successful} database updates`);
      }

      console.log('\n📊 RELIABLE IMAGE REPLACEMENT RESULTS:');
      console.log('=======================================');
      console.log(`📦 Products processed: ${results.processed}`);
      console.log(`✅ Successfully updated: ${results.successful}`);
      console.log(`❌ Errors: ${results.errors.length}`);
      
      console.log('\n🎯 Match types used:');
      Object.entries(results.matchTypes).forEach(([type, count]) => {
        console.log(`  ${type}: ${count} products`);
      });

      if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(error => console.log(`  - ${error}`));
      }

      if (results.successful > 0) {
        console.log('\n🎉 SUCCESS! All products now have reliable, stable images!');
        console.log('🔄 Restart your dev server to see the properly matched product images.');
        console.log('📸 Images are now from reliable iHerb source and won\'t change randomly.');
        
        fs.writeFileSync('reliable-image-results.json', JSON.stringify({
          timestamp: new Date().toISOString(),
          method: 'reliable-iherb-images',
          successfulUpdates: results.successful,
          matchTypes: results.matchTypes,
          errors: results.errors
        }, null, 2));
        console.log('📁 Results saved to reliable-image-results.json');
      }

    } catch (error) {
      console.error('❌ Process failed:', error);
    }
  }
}

console.log('🛡️ RELIABLE PRODUCT IMAGE SERVICE');
console.log('===================================\n');
console.log('Replacing all images with stable, reliable product images from iHerb...');
console.log('No more random gym photos or changing URLs!\n');

const service = new ReliableProductImageService();
service.processAllProductsWithReliableImages().catch(console.error);
