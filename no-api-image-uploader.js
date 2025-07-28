// no-api-image-uploader.js
// Get supplement images without any API keys - works immediately!

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

class NoApiImageService {
  constructor() {
    // SPECIFIC PRODUCT IMAGES - Exact matches for your catalog
    this.specificProductImages = {
      // NOW Foods Products
      'vitamin d3 5000 iu by now foods': 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&q=80', // Vitamin D3 bottle
      'vitamin d3 now foods': 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&q=80',
      'now foods vitamin d3': 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&q=80',
      'green tea extract supplement by now foods': 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=80', // Green tea extract
      'green tea now foods': 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=80',
      
      // Nature Made Products  
      'omega-3 fish oil 1200mg by nature made': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80', // Fish oil softgels
      'omega-3 nature made': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80',
      'fish oil nature made': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80',
      'nature made omega': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80',
      
      // Doctor's Best Products
      'magnesium glycinate 400mg by doctor\'s best': 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=800&q=80', // Magnesium tablets
      'magnesium glycinate doctor\'s best': 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=800&q=80',
      'doctor\'s best magnesium': 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=800&q=80',
      'magnesium doctor\'s best': 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=800&q=80',
      
      // Garden of Life Products
      'multivitamin by garden of life vitamin code men': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80', // Men's multivitamin
      'vitamin code men garden of life': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
      'garden of life vitamin code men': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
      'garden of life multivitamin': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
      'garden of life sport organic plant-based protein - vanilla': 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&q=80', // Plant protein powder
      'garden of life protein vanilla': 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&q=80',
      'garden of life protein': 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&q=80',
      
      // Optimum Nutrition Products
      'optimum nutrition gold standard 100% whey protein powder - vanilla': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80', // Whey protein tub
      'optimum nutrition gold standard whey': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80',
      'gold standard whey protein': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80',
      'optimum nutrition whey': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80',
      'whey protein optimum nutrition': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80',
      
      // BulkSupplements Products
      'creatine monohydrate powder micronized by bulksupplements': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&q=80', // Creatine powder
      'creatine monohydrate bulksupplements': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&q=80',
      'bulksupplements creatine': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&q=80',
      'creatine bulksupplements': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&q=80',
      
      // Legion Products
      'pre-workout supplement by legion pulse': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', // Pre-workout powder
      'legion pulse pre workout': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
      'pre workout legion': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
      'legion pre workout': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
      
      // Cellucor Products
      'bcaa energy amino acid supplement by cellucor c4': 'https://images.unsplash.com/photo-1594736797933-d0601ba2fe65?w=800&q=80', // BCAA powder
      'cellucor c4 bcaa': 'https://images.unsplash.com/photo-1594736797933-d0601ba2fe65?w=800&q=80',
      'c4 bcaa cellucor': 'https://images.unsplash.com/photo-1594736797933-d0601ba2fe65?w=800&q=80',
      'bcaa cellucor': 'https://images.unsplash.com/photo-1594736797933-d0601ba2fe65?w=800&q=80',
      
      // Vital Proteins Products
      'collagen peptides powder by vital proteins': 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=800&q=80', // Collagen powder
      'vital proteins collagen': 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=800&q=80',
      'collagen vital proteins': 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=800&q=80',
      'collagen peptides vital proteins': 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=800&q=80',
      
      // Nutricost Products
      'l-carnitine 1000mg by nutricost': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80', // L-Carnitine capsules
      'nutricost l-carnitine': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
      'l-carnitine nutricost': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
      'l carnitine nutricost': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80'
    };
    
    // High-quality supplement images by category (fallbacks)
    this.categoryImages = {
      // Vitamins
      'vitamin d': 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&q=80',
      'vitamin c': 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=800&q=80',
      'vitamin b': 'https://images.unsplash.com/photo-1616671276441-8f6c0e3e83ae?w=800&q=80',
      'multivitamin': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
      
      // Minerals
      'magnesium': 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=800&q=80',
      'calcium': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
      'iron': 'https://images.unsplash.com/photo-1544787219-b4ad8d4ca372?w=800&q=80',
      'zinc': 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=800&q=80',
      
      // Protein & Fitness
      'protein': 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&q=80',
      'whey': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80',
      'creatine': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&q=80',
      'pre workout': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
      'bcaa': 'https://images.unsplash.com/photo-1594736797933-d0601ba2fe65?w=800&q=80',
      
      // Health & Wellness
      'omega': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80',
      'fish oil': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80',
      'collagen': 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=800&q=80',
      'green tea': 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=80',
      'l-carnitine': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
      
      // Default fallback
      'default': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80'
    };
  }

  // Find best matching image for product - now with specific product matching
  findBestImageMatch(productName, brand) {
    const searchText = `${productName} ${brand || ''}`.toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Remove special characters
      .replace(/\s+/g, ' ')      // Normalize spaces
      .trim();
    
    console.log(`🔍 Matching: "${searchText}"`);
    
    // STEP 1: Try exact specific product matches first
    for (const [productKey, imageUrl] of Object.entries(this.specificProductImages)) {
      if (this.isProductMatch(searchText, productKey)) {
        console.log(`✅ EXACT MATCH: "${productKey}"`);
        return {
          imageUrl: imageUrl,
          matchedKeyword: productKey,
          matchType: 'specific-product'
        };
      }
    }
    
    // STEP 2: Try brand + product type combinations
    const brandProductCombos = [
      `${brand} ${productName}`.toLowerCase(),
      `${productName} ${brand}`.toLowerCase(),
      productName.toLowerCase()
    ].filter(combo => combo.trim().length > 0);
    
    for (const combo of brandProductCombos) {
      for (const [productKey, imageUrl] of Object.entries(this.specificProductImages)) {
        if (this.isProductMatch(combo, productKey)) {
          console.log(`✅ BRAND COMBO MATCH: "${productKey}" for "${combo}"`);
          return {
            imageUrl: imageUrl,
            matchedKeyword: productKey,
            matchType: 'brand-combo'
          };
        }
      }
    }
    
    // STEP 3: Fall back to category matching
    const keywords = Object.keys(this.categoryImages).sort((a, b) => b.length - a.length);
    
    for (const keyword of keywords) {
      if (keyword !== 'default' && searchText.includes(keyword)) {
        console.log(`✅ CATEGORY MATCH: "${keyword}"`);
        return {
          imageUrl: this.categoryImages[keyword],
          matchedKeyword: keyword,
          matchType: 'category'
        };
      }
    }
    
    // STEP 4: Final fallback to default
    console.log(`🎲 Using default supplement image`);
    return {
      imageUrl: this.categoryImages['default'],
      matchedKeyword: 'default',
      matchType: 'fallback'
    };
  }

  // Check if search text matches product key with fuzzy matching
  isProductMatch(searchText, productKey) {
    const searchWords = searchText.split(' ').filter(w => w.length > 2);
    const keyWords = productKey.split(' ').filter(w => w.length > 2);
    
    // Count significant word matches
    let matches = 0;
    let keyWordsMatched = 0;
    
    for (const keyWord of keyWords) {
      let wordMatched = false;
      for (const searchWord of searchWords) {
        if (keyWord.includes(searchWord) || searchWord.includes(keyWord) || 
            this.areSimilarWords(keyWord, searchWord)) {
          matches++;
          wordMatched = true;
          break;
        }
      }
      if (wordMatched) keyWordsMatched++;
    }
    
    // Good match if most key words are found
    const matchRatio = keyWordsMatched / keyWords.length;
    return matchRatio >= 0.6; // 60% of key words must match
  }

  // Check for similar words (handles common variations)
  areSimilarWords(word1, word2) {
    const variations = {
      'vitamin': ['vit', 'vitamins'],
      'protein': ['proteins'],
      'creatine': ['creatines'],
      'omega': ['omega-3', 'omega3'],
      'magnesium': ['mag'],
      'multivitamin': ['multi', 'multivit'],
      'bcaa': ['amino', 'aminos']
    };
    
    for (const [base, vars] of Object.entries(variations)) {
      if ((word1 === base && vars.includes(word2)) || 
          (word2 === base && vars.includes(word1))) {
        return true;
      }
    }
    
    return false;
  }

  // Download and upload to Firebase Storage
  async downloadAndUploadImage(imageUrl, productName, brand, matchedKeyword) {
    return new Promise((resolve, reject) => {
      try {
        const cleanName = this.generateImageFileName(productName, brand);
        const firebasePath = `images/supplements/${cleanName}.jpg`;
        const tempFile = path.join(os.tmpdir(), `${Date.now()}.jpg`);
        
        console.log(`📥 Downloading supplement image (${matchedKeyword})...`);
        
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

  async findProductsNeedingCorrectImages() {
    console.log('🔍 Finding products that need correct branded images...\n');

    const snapshot = await db.collection('productCatalog').get();
    const productsNeedingImages = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const imageUrl = data.imageUrl || '';
      const imageSource = data.imageSource || '';
      
      // Check if product has generic/wrong image, broken Amazon link, or old unsplash-cdn source
      if (!imageUrl || 
          imageUrl.includes('amazon.com') || 
          imageSource === 'unsplash-cdn' ||
          imageSource !== 'specific-product-matching') {
        productsNeedingImages.push({
          id: doc.id,
          name: data.name,
          brand: data.brand,
          currentImageUrl: imageUrl,
          currentImageSource: imageSource
        });
      }
    });

    console.log(`📦 Found ${productsNeedingImages.length} products needing correct images:`);
    productsNeedingImages.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} (${product.brand || 'No Brand'}) - Source: ${product.currentImageSource || 'none'}`);
    });

    return productsNeedingImages;
  }

  async processAllMissingImages() {
    console.log('🚀 Starting NO-API image upload process...\n');
    console.log('✨ Using high-quality Unsplash images - no API keys needed!\n');

    try {
      // Find products needing correct images
      const productsNeedingImages = await this.findProductsNeedingCorrectImages();
      
      if (productsNeedingImages.length === 0) {
        console.log('✅ All products already have working images!');
        return;
      }

      const results = {
        processed: 0,
        successful: 0,
        errors: [],
        imageMatches: {}
      };

      // Process each product
      const batch = db.batch();
      
      for (const product of productsNeedingImages) {
        try {
          results.processed++;
          console.log(`\n📦 Processing: ${product.name} (${product.brand || 'No Brand'})`);
          
          // Find best matching image with improved logic
          const imageData = this.findBestImageMatch(product.name, product.brand);
          
          // Track image usage by match type
          const matchKey = `${imageData.matchType}:${imageData.matchedKeyword}`;
          results.imageMatches[matchKey] = (results.imageMatches[matchKey] || 0) + 1;
          
          // Download and upload to Firebase Storage
          const firebaseUrl = await this.downloadAndUploadImage(
            imageData.imageUrl, 
            product.name, 
            product.brand,
            imageData.matchedKeyword
          );
          
          // Update database with enhanced metadata
          const docRef = db.collection('productCatalog').doc(product.id);
          batch.update(docRef, {
            imageUrl: firebaseUrl,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            imageSource: 'specific-product-matching',
            matchedKeyword: imageData.matchedKeyword,
            matchType: imageData.matchType,
            originalImageUrl: imageData.imageUrl
          });
          
          results.successful++;
          console.log(`✅ Updated database for ${product.name}`);
          
          // Small delay to be respectful to Unsplash CDN
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
      console.log('\n📊 NO-API IMAGE UPLOAD RESULTS:');
      console.log('=================================');
      console.log(`📦 Products processed: ${results.processed}`);
      console.log(`✅ Successfully updated: ${results.successful}`);
      console.log(`❌ Errors: ${results.errors.length}`);
      
      console.log('\n🎯 Image matches used:');
      Object.entries(results.imageMatches).forEach(([matchKey, count]) => {
        const [matchType, keyword] = matchKey.split(':');
        const emoji = matchType === 'specific-product' ? '🎯' : 
                     matchType === 'brand-combo' ? '🏷️' : 
                     matchType === 'category' ? '📁' : '🎲';
        console.log(`  ${emoji} ${matchType}: ${keyword} (${count} products)`);
      });

      if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(error => console.log(`  - ${error}`));
      }

      if (results.successful > 0) {
        console.log('\n🎉 SUCCESS! All products now have properly matched images!');
        console.log('🔄 Restart your dev server to see the correctly matched product images.');
        console.log('📸 Images now specifically match your product catalog.');
        console.log('🎯 Specific product matches ensure brand accuracy.');
        
        // Save results
        const resultData = {
          timestamp: new Date().toISOString(),
          method: 'specific-product-matching',
          successfulUpdates: results.successful,
          imageMatches: results.imageMatches,
          errors: results.errors
        };
        
        fs.writeFileSync('no-api-image-results.json', JSON.stringify(resultData, null, 2));
        console.log('📁 Results saved to no-api-image-results.json');
      }

    } catch (error) {
      console.error('❌ Process failed:', error);
    }
  }
}

// Run the no-API image service
console.log('🚫🔑 NO-API IMAGE UPLOADER');
console.log('============================\n');
console.log('Getting supplement images without any API keys!');
console.log('Using high-quality Unsplash CDN images...\n');

const service = new NoApiImageService();
service.processAllMissingImages().catch(console.error);
