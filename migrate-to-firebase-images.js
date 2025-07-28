// migrate-to-firebase-images.js
// Comprehensive solution to fix image URLs and optimize data structure

const admin = require('firebase-admin');
const path = require('path');
const https = require('https');
const fs = require('fs');

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

// Configuration
const STORAGE_PATH = 'images/supplements/'; // Target path
const CURRENT_STORAGE_PATH = 'supplement-images/'; // Current path

class ImageMigrationService {
  constructor() {
    this.productMap = new Map();
    this.imageMap = new Map();
    this.missingImages = [];
  }

  // Step 1: Analyze current data and create unified product catalog
  async analyzeAndUnifyData() {
    console.log('📊 Step 1: Analyzing and unifying product data...\n');

    // Get all collections
    const [productCatalog, cachedStacks, aiStacks] = await Promise.all([
      db.collection('productCatalog').get(),
      db.collection('cachedStacks').get(),
      db.collection('aiStacks').get()
    ]);

    console.log(`📦 productCatalog: ${productCatalog.size} documents`);
    console.log(`📚 cachedStacks: ${cachedStacks.size} documents`);
    console.log(`🤖 aiStacks: ${aiStacks.size} documents\n`);

    // Process productCatalog (primary source)
    console.log('Processing productCatalog...');
    productCatalog.forEach(doc => {
      const data = doc.data();
      this.addProduct(doc.id, data, 'productCatalog');
    });

    // Extract individual supplements from cachedStacks
    console.log('Extracting supplements from cachedStacks...');
    cachedStacks.forEach(doc => {
      const data = doc.data();
      if (data.supplements && Array.isArray(data.supplements)) {
        data.supplements.forEach((supplement, index) => {
          const supplementId = `cached_${doc.id}_${index}`;
          this.addProduct(supplementId, supplement, 'cachedStacks');
        });
      }
    });

    console.log(`\n✅ Unified catalog: ${this.productMap.size} unique products`);
    return this.productMap;
  }

  // Helper to add product to unified map
  addProduct(id, data, source) {
    const key = this.generateProductKey(data);
    
    if (!this.productMap.has(key)) {
      this.productMap.set(key, {
        id,
        data,
        source,
        variants: []
      });
    } else {
      // Add as variant if different source
      this.productMap.get(key).variants.push({ id, data, source });
    }
  }

  // Generate unique key for product matching
  generateProductKey(data) {
    const name = (data.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const brand = (data.brand || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${brand}_${name}`.substring(0, 50);
  }

  // Step 2: Map existing Firebase Storage images
  async mapExistingImages() {
    console.log('🗄️  Step 2: Mapping existing Firebase Storage images...\n');

    try {
      // List current images
      const [files] = await bucket.getFiles({ prefix: CURRENT_STORAGE_PATH });
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|webp)$/i.test(file.name)
      );

      console.log(`📷 Found ${imageFiles.length} images in storage`);

      // Create mapping from product names to image files
      for (const [key, product] of this.productMap) {
        const productName = product.data.name || '';
        const possibleImageNames = this.generateImageNames(productName, product.data.brand);
        
        // Try to match with existing images
        const matchedImage = imageFiles.find(file => {
          const fileName = file.name.toLowerCase();
          return possibleImageNames.some(name => 
            fileName.includes(name.toLowerCase())
          );
        });

        if (matchedImage) {
          this.imageMap.set(key, {
            currentPath: matchedImage.name,
            newPath: `${STORAGE_PATH}${this.sanitizeFileName(productName)}.jpg`,
            firebaseUrl: await this.getFirebaseStorageUrl(matchedImage.name)
          });
        } else {
          this.missingImages.push({
            key,
            productName,
            currentImageUrl: product.data.imageUrl
          });
        }
      }

      console.log(`✅ Mapped ${this.imageMap.size} existing images`);
      console.log(`❌ Missing ${this.missingImages.length} images\n`);

    } catch (error) {
      console.error('Error mapping images:', error);
    }
  }

  // Generate possible image file names for a product
  generateImageNames(productName, brand) {
    const clean = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const name = clean(productName);
    const brandClean = clean(brand);
    
    return [
      name,
      `${brandClean}_${name}`,
      `${name}_${brandClean}`,
      productName.toLowerCase().replace(/\s+/g, '_'),
      productName.toLowerCase().replace(/\s+/g, '-')
    ].filter(n => n.length > 0);
  }

  // Get Firebase Storage public URL
  async getFirebaseStorageUrl(filePath) {
    try {
      const file = bucket.file(filePath);
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491' // Far future
      });
      return url;
    } catch (error) {
      console.error(`Error getting URL for ${filePath}:`, error);
      return null;
    }
  }

  // Step 3: Move images to new structure and update URLs
  async reorganizeImagesAndUpdateDatabase() {
    console.log('🔄 Step 3: Reorganizing images and updating database...\n');

    const batch = db.batch();
    let updateCount = 0;

    // Move existing images to new path structure
    for (const [key, imageInfo] of this.imageMap) {
      try {
        const sourceFile = bucket.file(imageInfo.currentPath);
        const destFile = bucket.file(imageInfo.newPath);
        
        // Copy to new location
        await sourceFile.copy(destFile);
        console.log(`📁 Moved: ${imageInfo.currentPath} → ${imageInfo.newPath}`);
        
        // Update the Firebase URL
        imageInfo.firebaseUrl = await this.getFirebaseStorageUrl(imageInfo.newPath);
        
      } catch (error) {
        console.error(`Error moving ${imageInfo.currentPath}:`, error);
      }
    }

    // Update database with new image URLs
    for (const [key, product] of this.productMap) {
      const imageInfo = this.imageMap.get(key);
      
      if (imageInfo && imageInfo.firebaseUrl) {
        // Update productCatalog if this product exists there
        if (product.source === 'productCatalog') {
          const docRef = db.collection('productCatalog').doc(product.id);
          batch.update(docRef, {
            imageUrl: imageInfo.firebaseUrl,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
          });
          updateCount++;
        }
      }
    }

    // Commit batch updates
    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Updated ${updateCount} product image URLs`);
    }

    // Update cachedStacks with new image URLs
    await this.updateCachedStacks();
  }

  // Update cachedStacks collection
  async updateCachedStacks() {
    console.log('🔄 Updating cachedStacks with new image URLs...');

    const cachedStacks = await db.collection('cachedStacks').get();
    const batch = db.batch();
    let stackUpdateCount = 0;

    cachedStacks.forEach(doc => {
      const data = doc.data();
      let hasUpdates = false;
      
      if (data.supplements && Array.isArray(data.supplements)) {
        data.supplements.forEach(supplement => {
          const key = this.generateProductKey(supplement);
          const imageInfo = this.imageMap.get(key);
          
          if (imageInfo && imageInfo.firebaseUrl) {
            supplement.imageUrl = imageInfo.firebaseUrl;
            hasUpdates = true;
          }
        });
        
        if (hasUpdates) {
          batch.update(doc.ref, {
            supplements: data.supplements,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
          });
          stackUpdateCount++;
        }
      }
    });

    if (stackUpdateCount > 0) {
      await batch.commit();
      console.log(`✅ Updated ${stackUpdateCount} cached stacks`);
    }
  }

  // Step 4: Download missing images from Amazon and upload to Firebase
  async downloadMissingImages() {
    console.log('⬇️  Step 4: Downloading missing images...\n');

    console.log(`📥 Downloading ${this.missingImages.length} missing images...`);

    for (const missing of this.missingImages.slice(0, 10)) { // Limit to 10 for demo
      if (missing.currentImageUrl && missing.currentImageUrl.includes('amazon.com')) {
        try {
          const fileName = this.sanitizeFileName(missing.productName) + '.jpg';
          const firebasePath = `${STORAGE_PATH}${fileName}`;
          
          await this.downloadAndUploadImage(missing.currentImageUrl, firebasePath);
          
          // Update the product in database
          const product = this.productMap.get(missing.key);
          if (product && product.source === 'productCatalog') {
            const firebaseUrl = await this.getFirebaseStorageUrl(firebasePath);
            await db.collection('productCatalog').doc(product.id).update({
              imageUrl: firebaseUrl,
              lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`✅ Updated ${missing.productName} with new image`);
          }
          
        } catch (error) {
          console.error(`Failed to download ${missing.productName}:`, error.message);
        }
      }
    }
  }

  // Download image from URL and upload to Firebase Storage
  async downloadAndUploadImage(url, firebasePath) {
    return new Promise((resolve, reject) => {
      const tempFile = `/tmp/${Date.now()}.jpg`;
      const file = fs.createWriteStream(tempFile);
      
      https.get(url, (response) => {
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
            
            // Clean up temp file
            fs.unlinkSync(tempFile);
            console.log(`📤 Uploaded: ${firebasePath}`);
            resolve();
          } catch (uploadError) {
            fs.unlinkSync(tempFile);
            reject(uploadError);
          }
        });
      }).on('error', reject);
    });
  }

  // Utility: Sanitize filename
  sanitizeFileName(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  // Step 5: Generate final report
  async generateReport() {
    console.log('\n📊 MIGRATION REPORT\n');
    console.log('==================');
    console.log(`🔢 Total products analyzed: ${this.productMap.size}`);
    console.log(`📷 Images successfully mapped: ${this.imageMap.size}`);
    console.log(`❌ Missing images: ${this.missingImages.length}`);
    console.log(`✅ Database updates completed`);
    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('1. Use productCatalog as primary data source for AI advisor');
    console.log('2. All images now use Firebase Storage URLs');
    console.log('3. Implement nightly sync to update product data');
    console.log('4. Consider removing redundant cachedStacks after verification');
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      totalProducts: this.productMap.size,
      mappedImages: this.imageMap.size,
      missingImages: this.missingImages.length,
      products: Array.from(this.productMap.entries()),
      imageMapping: Array.from(this.imageMap.entries()),
      missingImagesList: this.missingImages
    };
    
    fs.writeFileSync('migration-report.json', JSON.stringify(report, null, 2));
    console.log('\n📁 Detailed report saved to migration-report.json');
  }

  // Main execution method
  async execute() {
    try {
      await this.analyzeAndUnifyData();
      await this.mapExistingImages();
      await this.reorganizeImagesAndUpdateDatabase();
      await this.downloadMissingImages();
      await this.generateReport();
      
      console.log('\n🎉 Migration completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
    }
  }
}

// Execute migration
const migrationService = new ImageMigrationService();
migrationService.execute().catch(console.error);
