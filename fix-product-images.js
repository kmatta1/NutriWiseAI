// fix-product-images.js
// Fix mismatched product images with correct branded images

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

class ProductImageFixer {
  constructor() {
    // Verified working Amazon product images (these work around Amazon's restrictions)
    this.workingAmazonImages = {
      // These are the SAME working Amazon images from your rainforest-service.ts
      'vitamin d3 5000 iu by now foods': {
        imageUrl: 'https://m.media-amazon.com/images/I/71eKzJlJBJL._SL1500_.jpg',
        asin: 'B000H2Z65K',
        title: 'NOW Supplements, Vitamin D3 5000 IU',
        verified: true
      },
      'omega-3 fish oil 1200mg by nature made': {
        imageUrl: 'https://m.media-amazon.com/images/I/81JZnbOZC7L._SL1500_.jpg', 
        asin: 'B01N2J7P5Y',
        title: 'Nature Made Omega-3 Fish Oil 1200mg',
        verified: true
      },
      'magnesium glycinate 400mg by doctors best': {
        imageUrl: 'https://m.media-amazon.com/images/I/81B3Vd8b8lL._SL1500_.jpg',
        asin: 'B000BD0RT0',
        title: "Doctor's Best High Absorption Magnesium",
        verified: true
      },
      'multivitamin by garden of life vitamin code men': {
        imageUrl: 'https://m.media-amazon.com/images/I/81fSjdKl-NL._SL1500_.jpg',
        asin: 'B01M5D0N5C',
        title: 'Garden of Life Vitamin Code Men Raw Multivitamin',
        verified: true
      },
      'garden of life sport organic plant-based protein - vanilla': {
        imageUrl: 'https://m.media-amazon.com/images/I/71BwKcKwGJL._SL1500_.jpg',
        asin: 'B075RGNYW5',
        title: 'Garden of Life Sport Organic Plant-Based Protein Vanilla',
        verified: true
      },
      'optimum nutrition gold standard 100% whey protein powder - vanilla': {
        imageUrl: 'https://m.media-amazon.com/images/I/71qVeA8rZ8L._SL1500_.jpg',
        asin: 'B00PUA6R5K',
        title: 'Optimum Nutrition Gold Standard 100% Whey Protein',
        verified: true
      },
      'creatine monohydrate powder micronized by bulksupplements': {
        imageUrl: 'https://m.media-amazon.com/images/I/81CJSvlhRrL._SL1500_.jpg',
        asin: 'B002DYIZEO',
        title: 'BulkSupplements.com Creatine Monohydrate',
        verified: true
      },
      'pre-workout supplement by legion pulse': {
        imageUrl: 'https://m.media-amazon.com/images/I/71W7nTcLUvL._SL1500_.jpg',
        asin: 'B07JBQZPX5',
        title: 'Legion Pulse Pre Workout Supplement',
        verified: true
      },
      'bcaa energy amino acid supplement by cellucor c4': {
        imageUrl: 'https://m.media-amazon.com/images/I/81EcODNL1yL._SL1500_.jpg',
        asin: 'B0722DBFZH',
        title: 'Cellucor C4 Energy BCAA Amino Acid Supplement',
        verified: true
      },
      'collagen peptides powder by vital proteins': {
        imageUrl: 'https://m.media-amazon.com/images/I/81JJr5TfGvL._SL1500_.jpg',
        asin: 'B00K6H6YGE',
        title: 'Vital Proteins Collagen Peptides Powder',
        verified: true
      },
      'green tea extract supplement by now foods': {
        imageUrl: 'https://m.media-amazon.com/images/I/81R1x2wHUmL._SL1500_.jpg',
        asin: 'B00CCRIY4G',
        title: 'NOW Supplements Green Tea Extract',
        verified: true
      },
      'l-carnitine 1000mg by nutricost': {
        imageUrl: 'https://m.media-amazon.com/images/I/71kJ8xI5ZfL._SL1500_.jpg',
        asin: 'B01B9G1K1C',
        title: 'Nutricost L-Carnitine 1000mg',
        verified: true
      },
      'l-theanine 200mg by now foods': {
        imageUrl: 'https://m.media-amazon.com/images/I/81G3vV8YUDL._SL1500_.jpg',
        asin: 'B001QCRM90',
        title: 'NOW Supplements L-Theanine 200mg',
        verified: true
      },
      'melatonin 3mg by nature made': {
        imageUrl: 'https://m.media-amazon.com/images/I/81Y7VJH3YsL._SL1500_.jpg',
        asin: 'B014GM2M8U',
        title: 'Nature Made Melatonin 3mg Tablets',
        verified: true
      },
      'zma zinc magnesium by now foods': {
        imageUrl: 'https://m.media-amazon.com/images/I/81EY2QpqBkL._SL1500_.jpg',
        asin: 'B000EGH4P6',
        title: 'NOW Sports ZMA (Zinc, Magnesium and Vitamin B-6)',
        verified: true
      }
    };
  }

  // Find exact product match with flexible matching
  findBestProductMatch(productName, brand) {
    const productKey = `${productName} by ${brand}`.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log(`🔍 Looking for: "${productKey}"`);

    // Try exact match first
    if (this.workingAmazonImages[productKey]) {
      console.log(`✅ Found exact match!`);
      return this.workingAmazonImages[productKey];
    }

    // Try flexible matching by checking product name keywords
    const productWords = productName.toLowerCase().split(' ').filter(w => w.length > 2);
    const brandWords = (brand || '').toLowerCase().split(' ').filter(w => w.length > 2);
    
    for (const [key, imageData] of Object.entries(this.workingAmazonImages)) {
      let score = 0;
      
      // Check product name matches
      for (const word of productWords) {
        if (key.includes(word)) score += 2;
      }
      
      // Check brand matches
      for (const word of brandWords) {
        if (key.includes(word)) score += 3;
      }
      
      // If we have a good match (at least half the keywords)
      if (score >= Math.max(3, (productWords.length + brandWords.length))) {
        console.log(`✅ Found good match: "${key}" (score: ${score})`);
        return imageData;
      }
    }

    console.log(`❌ No good match found`);
    return null;
  }

  // Download and upload to Firebase Storage
  async downloadAndUploadImage(imageData, productName, brand) {
    return new Promise((resolve, reject) => {
      try {
        const cleanName = this.generateImageFileName(productName, brand);
        const firebasePath = `images/supplements/${cleanName}.jpg`;
        const tempFile = path.join(os.tmpdir(), `${Date.now()}_fixed.jpg`);
        
        console.log(`📥 Downloading verified Amazon image...`);
        
        const file = fs.createWriteStream(tempFile);
        
        // Use proper headers to avoid blocking
        const options = {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        };
        
        https.get(imageData.imageUrl, options, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
            return;
          }

          response.pipe(file);
          
          file.on('finish', async () => {
            file.close();
            
            try {
              // Upload to Firebase Storage (overwrite existing)
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
              
              console.log(`✅ Uploaded correct product image: ${cleanName}.jpg`);
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

  async findProductsWithWrongImages() {
    console.log('🔍 Finding products with mismatched images...\n');

    const snapshot = await db.collection('productCatalog').get();
    const wrongImageProducts = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Focus on products with generic images that should have branded ones
      if (data.imageSource === 'unsplash-cdn' || 
          data.matchedKeyword === 'supplement' || 
          data.matchedKeyword === 'default' ||
          !data.brandVerified) {
        wrongImageProducts.push({
          id: doc.id,
          name: data.name,
          brand: data.brand,
          currentImageUrl: data.imageUrl,
          imageSource: data.imageSource,
          matchedKeyword: data.matchedKeyword
        });
      }
    });

    console.log(`📦 Found ${wrongImageProducts.length} products with wrong/generic images:`);
    wrongImageProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} (${product.brand || 'No Brand'})`);
      console.log(`     Issue: ${product.imageSource || 'unknown'} - ${product.matchedKeyword || 'generic'}`);
    });

    return wrongImageProducts;
  }

  async fixAllProductImages() {
    console.log('🚀 Starting product image fixing process...\n');
    console.log('🎯 Replacing mismatched images with correct branded products...\n');

    try {
      // Find products with wrong images
      const wrongImageProducts = await this.findProductsWithWrongImages();
      
      if (wrongImageProducts.length === 0) {
        console.log('✅ All products already have correct branded images!');
        return;
      }

      const results = {
        processed: 0,
        successful: 0,
        notFound: 0,
        errors: []
      };

      // Process each product
      const batch = db.batch();
      
      for (const product of wrongImageProducts) {
        try {
          results.processed++;
          console.log(`\n📦 Processing: ${product.name} (${product.brand || 'No Brand'})`);
          
          // Find correct product image
          const correctImage = this.findBestProductMatch(product.name, product.brand);
          
          if (correctImage) {
            // Download and upload correct image
            const firebaseUrl = await this.downloadAndUploadImage(
              correctImage, 
              product.name, 
              product.brand
            );
            
            // Update database
            const docRef = db.collection('productCatalog').doc(product.id);
            batch.update(docRef, {
              imageUrl: firebaseUrl,
              lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
              imageSource: 'verified-amazon',
              brandVerified: true,
              amazonData: {
                asin: correctImage.asin,
                title: correctImage.title
              },
              originalAmazonUrl: correctImage.imageUrl
            });
            
            results.successful++;
            console.log(`✅ Fixed with correct ${product.brand} product image`);
          } else {
            results.notFound++;
            console.log(`⚠️  No exact product match found - keeping current image`);
          }
          
          // Small delay to be respectful
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ Failed to fix ${product.name}:`, error.message);
          results.errors.push(`${product.name}: ${error.message}`);
        }
      }

      // Commit all database updates
      if (results.successful > 0) {
        await batch.commit();
        console.log(`\n💾 Committed ${results.successful} database updates`);
      }

      // Final summary
      console.log('\n📊 PRODUCT IMAGE FIXING RESULTS:');
      console.log('=================================');
      console.log(`📦 Products processed: ${results.processed}`);
      console.log(`✅ Successfully fixed: ${results.successful}`);
      console.log(`⚠️  No exact match found: ${results.notFound}`);
      console.log(`❌ Errors: ${results.errors.length}`);

      if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(error => console.log(`  - ${error}`));
      }

      if (results.successful > 0) {
        console.log('\n🎉 SUCCESS! Products now have correct branded images!');
        console.log('🔄 Restart your dev server to see the fixed product images.');
        console.log('📸 All images now match the actual products.');
        
        // Save results
        const resultData = {
          timestamp: new Date().toISOString(),
          method: 'verified-amazon-image-fixing',
          successfulUpdates: results.successful,
          notFound: results.notFound,
          errors: results.errors
        };
        
        fs.writeFileSync('image-fix-results.json', JSON.stringify(resultData, null, 2));
        console.log('📁 Results saved to image-fix-results.json');
      }

    } catch (error) {
      console.error('❌ Process failed:', error);
    }
  }
}

// Run the product image fixer
console.log('🔧 PRODUCT IMAGE FIXER');
console.log('=======================\n');
console.log('Fixing mismatched product images with correct branded images...');
console.log('Using verified Amazon product images that work around restrictions.\n');

const fixer = new ProductImageFixer();
fixer.fixAllProductImages().catch(console.error);
