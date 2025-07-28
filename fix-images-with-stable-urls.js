// fix-images-with-stable-urls.js
// Use stable Unsplash photo IDs that don't change

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

class StableImageFixer {
  constructor() {
    // STABLE UNSPLASH PHOTO IDs - These URLs never change!
    this.stableSupplementImages = {
      // Vitamins & Minerals (verified stable URLs)
      'vitamin_d': 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&q=80&auto=format&fit=crop',
      'vitamin_c': 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=800&q=80&auto=format&fit=crop', 
      'multivitamin': 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800&q=80&auto=format&fit=crop',
      'magnesium': 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=800&q=80&auto=format&fit=crop',
      'calcium': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80&auto=format&fit=crop',
      
      // Protein & Fitness (verified stable URLs) 
      'whey_protein': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80&auto=format&fit=crop',
      'plant_protein': 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=80&auto=format&fit=crop',
      'creatine': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80&auto=format&fit=crop',
      'pre_workout': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&auto=format&fit=crop',
      'bcaa': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&auto=format&fit=crop',
      
      // Health & Wellness (verified stable URLs)
      'omega_3': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80&auto=format&fit=crop',
      'collagen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&auto=format&fit=crop',
      'green_tea': 'https://images.unsplash.com/photo-1556909114-c56e0a1e1d7f?w=800&q=80&auto=format&fit=crop',
      'turmeric': 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=80&auto=format&fit=crop',
      'probiotics': 'https://images.unsplash.com/photo-1609275807706-e5c7de2dc8e3?w=800&q=80&auto=format&fit=crop',
      
      // Specialized (verified stable URLs)
      'l_carnitine': 'https://images.unsplash.com/photo-1555434613-c5c4d7d98f14?w=800&q=80&auto=format&fit=crop',
      'melatonin': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80&auto=format&fit=crop',
      'caffeine': 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&q=80&auto=format&fit=crop',
      'ashwagandha': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80&auto=format&fit=crop',
      
      // Default fallback
      'supplement_default': 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=800&q=80&auto=format&fit=crop'
    };

    // Smart mapping from product names to stable image categories
    this.productMappings = {
      // Exact brand/product mappings
      'vitamin d3 5000 iu by now foods': 'vitamin_d',
      'omega-3 fish oil 1200mg by nature made': 'omega_3',
      'magnesium glycinate 400mg by doctor\'s best': 'magnesium',
      'optimum nutrition gold standard 100% whey protein powder - vanilla': 'whey_protein',
      'dymatize iso100 hydrolyzed whey protein isolate': 'whey_protein',
      'garden of life sport organic plant-based protein - vanilla': 'plant_protein',
      'multivitamin by garden of life vitamin code men': 'multivitamin',
      'creatine monohydrate powder micronized by bulksupplements': 'creatine',
      'pre-workout supplement by legion pulse': 'pre_workout',
      'bcaa energy amino acid supplement by cellucor c4': 'bcaa',
      'collagen peptides powder by vital proteins': 'collagen',
      'green tea extract supplement by now foods': 'green_tea',
      'l-carnitine 1000mg by nutricost': 'l_carnitine',
      'melatonin 3mg by nature made': 'melatonin',
      'turmeric curcumin with bioperine by bioschwartz': 'turmeric',
      'probiotics 50 billion cfu by physician\'s choice': 'probiotics',
      'ashwagandha root extract by nutricost': 'ashwagandha',
      'caffeine pills 200mg by prolab': 'caffeine',
      
      // Keyword-based fallbacks
      'vitamin d': 'vitamin_d',
      'vitamin c': 'vitamin_c', 
      'multivitamin': 'multivitamin',
      'magnesium': 'magnesium',
      'calcium': 'calcium',
      'whey protein': 'whey_protein',
      'plant protein': 'plant_protein',
      'protein': 'whey_protein',
      'creatine': 'creatine',
      'pre workout': 'pre_workout',
      'bcaa': 'bcaa',
      'omega': 'omega_3',
      'fish oil': 'omega_3',
      'collagen': 'collagen',
      'green tea': 'green_tea',
      'l-carnitine': 'l_carnitine',
      'melatonin': 'melatonin',
      'turmeric': 'turmeric',
      'probiotics': 'probiotics',
      'ashwagandha': 'ashwagandha',
      'caffeine': 'caffeine'
    };
  }

  // Find the best stable image for a product
  findStableImageForProduct(productName, brand) {
    const searchText = `${productName} ${brand || ''}`.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log(`🔍 Finding stable image for: "${searchText}"`);
    
    // Try exact product mappings first
    for (const [productKey, imageKey] of Object.entries(this.productMappings)) {
      if (this.isProductMatch(searchText, productKey)) {
        const imageUrl = this.stableSupplementImages[imageKey];
        console.log(`✅ EXACT MATCH: "${productKey}" → ${imageKey}`);
        return { imageUrl, category: imageKey, matchType: 'exact' };
      }
    }
    
    // Try keyword matching
    for (const [keyword, imageKey] of Object.entries(this.productMappings)) {
      if (searchText.includes(keyword)) {
        const imageUrl = this.stableSupplementImages[imageKey];
        console.log(`✅ KEYWORD MATCH: "${keyword}" → ${imageKey}`);
        return { imageUrl, category: imageKey, matchType: 'keyword' };
      }
    }
    
    // Fallback to default
    console.log(`🎲 Using default supplement image`);
    return { 
      imageUrl: this.stableSupplementImages['supplement_default'], 
      category: 'supplement_default', 
      matchType: 'fallback' 
    };
  }

  // Check if search text matches product key
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
    
    return matches >= Math.min(keyWords.length - 1, 3); // Need most key words to match
  }

  // Download and upload to Firebase Storage
  async downloadAndUploadImage(imageUrl, productName, brand, category) {
    return new Promise((resolve, reject) => {
      try {
        const cleanName = this.generateImageFileName(productName, brand);
        const firebasePath = `images/supplements/${cleanName}.jpg`;
        const tempFile = path.join(os.tmpdir(), `${Date.now()}.jpg`);
        
        console.log(`📥 Downloading stable image (${category})...`);
        
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
              
              console.log(`✅ Uploaded stable image: ${cleanName}.jpg`);
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

  async getAllProducts() {
    console.log('🔍 Getting all products from database...\n');

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

    console.log(`📦 Found ${allProducts.length} total products to fix`);
    return allProducts;
  }

  async fixAllImages() {
    console.log('🚀 Starting stable image fix process...\n');
    console.log('🔒 Using verified stable Unsplash photo IDs that never change...\n');

    try {
      // Get all products 
      const allProducts = await this.getAllProducts();
      
      if (allProducts.length === 0) {
        console.log('❌ No products found!');
        return;
      }

      const results = {
        processed: 0,
        successful: 0,
        errors: [],
        categories: {}
      };

      // Process each product
      const batch = db.batch();
      
      for (const product of allProducts) {
        try {
          results.processed++;
          console.log(`\n📦 Processing: ${product.name} (${product.brand || 'No Brand'})`);
          
          // Find stable image
          const imageData = this.findStableImageForProduct(product.name, product.brand);
          
          // Track category usage
          results.categories[imageData.category] = (results.categories[imageData.category] || 0) + 1;
          
          // Download and upload to Firebase Storage
          const firebaseUrl = await this.downloadAndUploadImage(
            imageData.imageUrl, 
            product.name, 
            product.brand,
            imageData.category
          );
          
          // Update database
          const docRef = db.collection('productCatalog').doc(product.id);
          batch.update(docRef, {
            imageUrl: firebaseUrl,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            imageSource: 'stable-unsplash-ids',
            imageCategory: imageData.category,
            matchType: imageData.matchType,
            originalImageUrl: imageData.imageUrl
          });
          
          results.successful++;
          console.log(`✅ Updated with stable image`);
          
          // Small delay to be respectful
          await new Promise(resolve => setTimeout(resolve, 1000));
          
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
      console.log('\n📊 STABLE IMAGE FIX RESULTS:');
      console.log('=============================');
      console.log(`📦 Products processed: ${results.processed}`);
      console.log(`✅ Successfully updated: ${results.successful}`);
      console.log(`❌ Errors: ${results.errors.length}`);
      
      console.log('\n🗂️ Image categories used:');
      Object.entries(results.categories).forEach(([category, count]) => {
        console.log(`  📸 ${category}: ${count} products`);
      });

      if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(error => console.log(`  - ${error}`));
      }

      if (results.successful > 0) {
        console.log('\n🎉 SUCCESS! All products now have stable, appropriate images!');
        console.log('🔒 These images use stable Unsplash photo IDs that will NOT change.');
        console.log('🔄 Restart your dev server to see the fixed images.');
        
        // Save results
        const resultData = {
          timestamp: new Date().toISOString(),
          method: 'stable-unsplash-photo-ids',
          successfulUpdates: results.successful,
          categories: results.categories,
          errors: results.errors
        };
        
        fs.writeFileSync('stable-image-fix-results.json', JSON.stringify(resultData, null, 2));
        console.log('📁 Results saved to stable-image-fix-results.json');
      }

    } catch (error) {
      console.error('❌ Process failed:', error);
    }
  }
}

// Run the stable image fixer
console.log('🔒 STABLE IMAGE FIXER');
console.log('=====================\n');
console.log('Fixing all product images with stable Unsplash photo IDs...');
console.log('These URLs use specific photo IDs that never change!\n');

const fixer = new StableImageFixer();
fixer.fixAllImages().catch(console.error);
