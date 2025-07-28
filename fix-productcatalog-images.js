// fix-productcatalog-images.js
// Simplified migration - ONLY update productCatalog with Firebase Storage URLs

const admin = require('firebase-admin');
const path = require('path');

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

class ProductCatalogImageFixer {
  constructor() {
    this.results = {
      totalProducts: 0,
      amazonUrls: 0,
      firebaseUrls: 0,
      updatedProducts: 0,
      errors: []
    };
  }

  // Main execution
  async fixProductCatalogImages() {
    console.log('🎯 Fixing productCatalog images - Primary Data Source Only\n');
    
    try {
      // Step 1: Analyze current productCatalog
      await this.analyzeProductCatalog();
      
      // Step 2: Map existing Firebase Storage images
      await this.mapFirebaseImages();
      
      // Step 3: Update productCatalog with Firebase URLs
      await this.updateProductCatalog();
      
      // Step 4: Report results
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      this.results.errors.push(error.message);
    }
  }

  // Analyze current productCatalog collection
  async analyzeProductCatalog() {
    console.log('📊 Analyzing productCatalog collection...');
    
    const snapshot = await db.collection('productCatalog').get();
    this.results.totalProducts = snapshot.size;
    
    console.log(`📦 Found ${this.results.totalProducts} products in productCatalog`);
    
    // Count current image URL types
    snapshot.forEach(doc => {
      const data = doc.data();
      const imageUrl = data.imageUrl || '';
      
      if (imageUrl.includes('amazon.com')) {
        this.results.amazonUrls++;
      } else if (imageUrl.includes('firebasestorage')) {
        this.results.firebaseUrls++;
      }
    });
    
    console.log(`🔗 Amazon URLs: ${this.results.amazonUrls}`);
    console.log(`🔥 Firebase URLs: ${this.results.firebaseUrls}\n`);
  }

  // Map existing Firebase Storage images
  async mapFirebaseImages() {
    console.log('🗄️  Mapping Firebase Storage images...');
    
    // Get all images from Firebase Storage
    const [files] = await bucket.getFiles();
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file.name)
    );
    
    console.log(`📷 Found ${imageFiles.length} images in Firebase Storage`);
    
    // Create mapping for quick lookup
    this.imageMap = new Map();
    
    for (const file of imageFiles) {
      // Get public URL
      try {
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-09-2491' // Far future date
        });
        
        // Extract filename without path
        const fileName = file.name.split('/').pop().toLowerCase();
        const baseName = fileName.replace(/\.(jpg|jpeg|png|webp)$/i, '');
        
        this.imageMap.set(baseName, {
          path: file.name,
          url: url,
          fileName: fileName
        });
        
        // Also map with variations
        const cleanName = baseName.replace(/[^a-z0-9]/g, '');
        this.imageMap.set(cleanName, {
          path: file.name,
          url: url,
          fileName: fileName
        });
        
      } catch (error) {
        console.warn(`⚠️  Could not get URL for ${file.name}`);
      }
    }
    
    console.log(`✅ Mapped ${this.imageMap.size} image variations\n`);
  }

  // Update productCatalog with Firebase Storage URLs
  async updateProductCatalog() {
    console.log('🔄 Updating productCatalog with Firebase Storage URLs...');
    
    const snapshot = await db.collection('productCatalog').get();
    const batch = db.batch();
    let updateCount = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const currentImageUrl = data.imageUrl || '';
      
      // Skip if already Firebase Storage URL
      if (currentImageUrl.includes('firebasestorage')) {
        continue;
      }
      
      // Try to find matching Firebase image
      const firebaseImageUrl = this.findMatchingFirebaseImage(data);
      
      if (firebaseImageUrl) {
        batch.update(doc.ref, {
          imageUrl: firebaseImageUrl,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        updateCount++;
        console.log(`✅ ${data.name} → Firebase Storage`);
      } else {
        console.log(`⚠️  No Firebase image found for: ${data.name}`);
      }
    }
    
    // Commit batch updates
    if (updateCount > 0) {
      await batch.commit();
      this.results.updatedProducts = updateCount;
      console.log(`\n🎉 Updated ${updateCount} products with Firebase Storage URLs`);
    } else {
      console.log('\n⚠️  No updates needed - all products already have Firebase URLs');
    }
  }

  // Find matching Firebase Storage image for a product
  findMatchingFirebaseImage(productData) {
    const productName = productData.name || '';
    const brand = productData.brand || '';
    
    // Generate possible search keys
    const searchKeys = this.generateSearchKeys(productName, brand);
    
    // Try to find match
    for (const key of searchKeys) {
      if (this.imageMap.has(key)) {
        return this.imageMap.get(key).url;
      }
    }
    
    return null;
  }

  // Generate possible search keys for matching
  generateSearchKeys(productName, brand) {
    const clean = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const keys = [];
    
    if (productName) {
      keys.push(clean(productName));
      keys.push(clean(productName.split(' ').slice(0, 3).join(''))); // First 3 words
      keys.push(clean(productName.split(' ')[0])); // First word only
    }
    
    if (brand && productName) {
      keys.push(clean(`${brand}${productName}`));
      keys.push(clean(`${productName}${brand}`));
    }
    
    // Remove duplicates and empty strings
    return [...new Set(keys)].filter(key => key.length > 2);
  }

  // Generate final report
  generateReport() {
    console.log('\n📊 PRODUCTCATALOG IMAGE FIX REPORT');
    console.log('==================================');
    console.log(`📦 Total products: ${this.results.totalProducts}`);
    console.log(`🔗 Amazon URLs found: ${this.results.amazonUrls}`);
    console.log(`🔥 Firebase URLs found: ${this.results.firebaseUrls}`);
    console.log(`✅ Products updated: ${this.results.updatedProducts}`);
    console.log(`❌ Errors: ${this.results.errors.length}`);
    
    if (this.results.errors.length > 0) {
      console.log('\nErrors:');
      this.results.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\n🎯 RESULT:');
    if (this.results.updatedProducts > 0) {
      console.log('✅ productCatalog is now the primary data source with Firebase Storage images');
      console.log('✅ Ready for AI Advisor to use optimized image URLs');
    } else {
      console.log('ℹ️  productCatalog already optimized - no changes needed');
    }
    
    // Save results
    const fs = require('fs');
    fs.writeFileSync('productcatalog-fix-results.json', JSON.stringify(this.results, null, 2));
    console.log('\n📁 Detailed results saved to productcatalog-fix-results.json');
  }
}

// Execute the fix
const fixer = new ProductCatalogImageFixer();
fixer.fixProductCatalogImages().catch(console.error);
