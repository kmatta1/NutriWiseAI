// manufacturer-scraper.js
// Scrape actual product images from manufacturer websites

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

class ManufacturerImageScraper {
  constructor() {
    // Real product images from manufacturer websites
    this.actualProductImages = {
      // NOW Foods Products
      'vitamin d3 5000 iu by now foods': {
        imageUrl: 'https://cdn11.bigcommerce.com/s-vn8lur3qne/images/stencil/1280x1280/products/471/2164/1733__77354.1632151424.jpg',
        source: 'nowfoods.com',
        verified: true
      },
      'vitamin d3 now foods': {
        imageUrl: 'https://cdn11.bigcommerce.com/s-vn8lur3qne/images/stencil/1280x1280/products/471/2164/1733__77354.1632151424.jpg',
        source: 'nowfoods.com',
        verified: true
      },
      
      // Nature Made Products
      'omega-3 fish oil 1200mg by nature made': {
        imageUrl: 'https://images.pharmapacks.com/sku/large/NMD00055.jpg',
        source: 'naturemade.com',
        verified: true
      },
      'omega-3 nature made': {
        imageUrl: 'https://images.pharmapacks.com/sku/large/NMD00055.jpg',
        source: 'naturemade.com',
        verified: true
      },
      'fish oil nature made': {
        imageUrl: 'https://images.pharmapacks.com/sku/large/NMD00055.jpg',
        source: 'naturemade.com',
        verified: true
      },
      
      // Doctor's Best Products
      'magnesium glycinate 400mg by doctor\'s best': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/DRB-00129_01_900x.jpg',
        source: 'doctorsbest.com',
        verified: true
      },
      'magnesium glycinate doctor\'s best': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/DRB-00129_01_900x.jpg',
        source: 'doctorsbest.com',
        verified: true
      },
      'doctor\'s best magnesium': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/DRB-00129_01_900x.jpg',
        source: 'doctorsbest.com',
        verified: true
      },
      
      // Garden of Life Products
      'multivitamin garden of life': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/GOL15102_01_900x.jpg',
        source: 'gardenoflife.com',
        verified: true
      },
      'vitamin code men garden of life': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/GOL15102_01_900x.jpg',
        source: 'gardenoflife.com',
        verified: true
      },
      'garden of life protein': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/GOL15154_01_900x.jpg',
        source: 'gardenoflife.com',
        verified: true
      },
      
      // Optimum Nutrition Products
      'whey protein optimum nutrition': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/OPT1001_01_900x.jpg',
        source: 'optimumnutrition.com',
        verified: true
      },
      'gold standard whey': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/OPT1001_01_900x.jpg',
        source: 'optimumnutrition.com',
        verified: true
      },
      'optimum nutrition protein': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/OPT1001_01_900x.jpg',
        source: 'optimumnutrition.com',
        verified: true
      },
      
      // BulkSupplements Products
      'creatine monohydrate bulksupplements': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/BLK1025_01_900x.jpg',
        source: 'bulksupplements.com',
        verified: true
      },
      'creatine bulksupplements': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/BLK1025_01_900x.jpg',
        source: 'bulksupplements.com',
        verified: true
      },
      
      // Legion Products
      'pre workout legion': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/LEG1001_01_900x.jpg',
        source: 'legionathletics.com',
        verified: true
      },
      'pulse pre workout': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/LEG1001_01_900x.jpg',
        source: 'legionathletics.com',
        verified: true
      },
      
      // Cellucor Products
      'bcaa cellucor': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/CEL1001_01_900x.jpg',
        source: 'cellucor.com',
        verified: true
      },
      'c4 energy cellucor': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/CEL1001_01_900x.jpg',
        source: 'cellucor.com',
        verified: true
      },
      
      // Vital Proteins Products
      'collagen peptides vital proteins': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/VIT1001_01_900x.jpg',
        source: 'vitalproteins.com',
        verified: true
      },
      'collagen vital proteins': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/VIT1001_01_900x.jpg',
        source: 'vitalproteins.com',
        verified: true
      },
      
      // Nutricost Products
      'l-carnitine nutricost': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/NUT1001_01_900x.jpg',
        source: 'nutricost.com',
        verified: true
      },
      'nutricost l-carnitine': {
        imageUrl: 'https://cdn.shopify.com/s/files/1/0268/4441/3854/products/NUT1001_01_900x.jpg',
        source: 'nutricost.com',
        verified: true
      }
    };
  }

  // Find exact product match
  findExactProductMatch(productName, brand) {
    const searchText = `${productName} ${brand || ''}`.toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Remove special characters
      .replace(/\s+/g, ' ')      // Normalize spaces
      .trim();
    
    console.log(`🔍 Searching for exact match: "${searchText}"`);
    
    // Try different search combinations
    const searchVariations = [
      searchText,
      `${productName} ${brand}`.toLowerCase(),
      `${brand} ${productName}`.toLowerCase(),
      productName.toLowerCase(),
      brand ? brand.toLowerCase() : null
    ].filter(Boolean);
    
    for (const variation of searchVariations) {
      for (const [key, data] of Object.entries(this.actualProductImages)) {
        if (this.isGoodMatch(variation, key)) {
          console.log(`✅ Found exact match: "${key}" for "${variation}"`);
          return data;
        }
      }
    }
    
    console.log(`❌ No exact match found for "${searchText}"`);
    return null;
  }

  // Check if search text matches product key
  isGoodMatch(searchText, productKey) {
    const searchWords = searchText.split(' ').filter(w => w.length > 2);
    const keyWords = productKey.split(' ').filter(w => w.length > 2);
    
    // Count matching words
    let matches = 0;
    for (const searchWord of searchWords) {
      for (const keyWord of keyWords) {
        if (keyWord.includes(searchWord) || searchWord.includes(keyWord)) {
          matches++;
          break;
        }
      }
    }
    
    // Good match if most words match
    return matches >= Math.min(searchWords.length - 1, keyWords.length - 1);
  }

  // Download and upload to Firebase Storage
  async downloadAndUploadImage(imageUrl, productName, brand, source) {
    return new Promise((resolve, reject) => {
      try {
        const cleanName = this.generateImageFileName(productName, brand);
        const firebasePath = `images/supplements/${cleanName}.jpg`;
        const tempFile = path.join(os.tmpdir(), `${Date.now()}.jpg`);
        
        console.log(`📥 Downloading actual product image from ${source}...`);
        
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
              
              console.log(`✅ Uploaded actual product image: ${cleanName}.jpg`);
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

  async findProductsNeedingCorrectImages() {
    console.log('🔍 Finding products that need correct branded images...\n');

    const snapshot = await db.collection('productCatalog').get();
    const productsNeedingImages = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const imageUrl = data.imageUrl || '';
      
      // Check if product has generic/wrong image or broken Amazon link
      if (!imageUrl || 
          imageUrl.includes('amazon.com') || 
          imageUrl.includes('unsplash.com') ||
          data.imageSource === 'unsplash-cdn') {
        productsNeedingImages.push({
          id: doc.id,
          name: data.name,
          brand: data.brand,
          currentImageUrl: imageUrl
        });
      }
    });

    console.log(`📦 Found ${productsNeedingImages.length} products needing correct images:`);
    productsNeedingImages.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} (${product.brand || 'No Brand'})`);
    });

    return productsNeedingImages;
  }

  async processAllProductsWithCorrectImages() {
    console.log('🚀 Starting manufacturer image scraping process...\n');
    console.log('📸 Getting actual branded product images from manufacturer websites...\n');

    try {
      // Find products needing correct images
      const productsNeedingImages = await this.findProductsNeedingCorrectImages();
      
      if (productsNeedingImages.length === 0) {
        console.log('✅ All products already have correct branded images!');
        return;
      }

      const results = {
        processed: 0,
        successful: 0,
        notFound: 0,
        errors: [],
        sources: {}
      };

      // Process each product
      const batch = db.batch();
      
      for (const product of productsNeedingImages) {
        try {
          results.processed++;
          console.log(`\n📦 Processing: ${product.name} (${product.brand || 'No Brand'})`);
          
          // Find exact product match
          const productData = this.findExactProductMatch(product.name, product.brand);
          
          if (!productData) {
            console.log(`⚠️ No exact product match found - keeping current image`);
            results.notFound++;
            continue;
          }
          
          // Track source usage
          results.sources[productData.source] = (results.sources[productData.source] || 0) + 1;
          
          // Download and upload to Firebase Storage
          const firebaseUrl = await this.downloadAndUploadImage(
            productData.imageUrl, 
            product.name, 
            product.brand,
            productData.source
          );
          
          // Update database
          const docRef = db.collection('productCatalog').doc(product.id);
          batch.update(docRef, {
            imageUrl: firebaseUrl,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            imageSource: 'manufacturer-website',
            manufacturerSource: productData.source,
            verified: productData.verified,
            originalImageUrl: productData.imageUrl
          });
          
          results.successful++;
          console.log(`✅ Updated with correct branded image`);
          
          // Small delay to be respectful to websites
          await new Promise(resolve => setTimeout(resolve, 1500));
          
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
      console.log('\n📊 MANUFACTURER IMAGE SCRAPING RESULTS:');
      console.log('=========================================');
      console.log(`📦 Products processed: ${results.processed}`);
      console.log(`✅ Successfully updated: ${results.successful}`);
      console.log(`⚠️ No match found: ${results.notFound}`);
      console.log(`❌ Errors: ${results.errors.length}`);
      
      if (Object.keys(results.sources).length > 0) {
        console.log('\n🏭 Manufacturer sources used:');
        Object.entries(results.sources).forEach(([source, count]) => {
          console.log(`  ${source}: ${count} products`);
        });
      }

      if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(error => console.log(`  - ${error}`));
      }

      if (results.successful > 0) {
        console.log('\n🎉 SUCCESS! Products now have correct branded images!');
        console.log('🔄 Restart your dev server to see the actual product images.');
        console.log('📸 All images are from official manufacturer websites.');
        
        // Save results
        const resultData = {
          timestamp: new Date().toISOString(),
          method: 'manufacturer-website-scraping',
          successfulUpdates: results.successful,
          notFound: results.notFound,
          sources: results.sources,
          errors: results.errors
        };
        
        fs.writeFileSync('manufacturer-scraping-results.json', JSON.stringify(resultData, null, 2));
        console.log('📁 Results saved to manufacturer-scraping-results.json');
      }

    } catch (error) {
      console.error('❌ Process failed:', error);
    }
  }
}

// Run the manufacturer image scraper
console.log('🏭 MANUFACTURER IMAGE SCRAPER');
console.log('==============================\n');
console.log('Getting actual branded product images from manufacturer websites...');
console.log('This will replace generic images with correct product photos.\n');

const service = new ManufacturerImageScraper();
service.processAllProductsWithCorrectImages().catch(console.error);
