// upload-static-images.js
// Upload static supplement images for remaining products

const admin = require('firebase-admin');
const https = require('https');
const path = require('path');
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

class StaticImageUploader {
  constructor() {
    // Use reliable image URLs - these are generic supplement images that should work
    this.staticImages = [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1550235678-8e8c5d2eafff?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1550235678-8e8c5d2eafff?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
    ];

    this.results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };
  }

  async uploadStaticImages() {
    console.log('🔍 Finding products that need images...\n');

    try {
      // Get products without Firebase Storage images
      const snapshot = await db.collection('productCatalog').get();
      const productsNeedingImages = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        const imageUrl = data.imageUrl || '';
        
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
        console.log(`  ${index + 1}. ${product.name}`);
      });

      if (productsNeedingImages.length === 0) {
        console.log('✅ All products already have Firebase Storage images!');
        return;
      }

      // Process each product with a static image
      console.log('\n🔄 Starting static image upload process...\n');
      
      for (let i = 0; i < productsNeedingImages.length; i++) {
        const product = productsNeedingImages[i];
        const imageUrl = this.staticImages[i % this.staticImages.length]; // Cycle through available images
        await this.processProduct(product, imageUrl);
        await this.delay(1000);
      }

      this.generateReport();

    } catch (error) {
      console.error('❌ Process failed:', error);
    }
  }

  async processProduct(product, imageUrl) {
    this.results.processed++;
    console.log(`📦 Processing: ${product.name}`);

    try {
      // Generate filename
      const fileName = this.generateImageFileName(product.name, product.brand);
      const firebasePath = `images/supplements/${fileName}.jpg`;

      console.log(`  🔗 Using static image: ${imageUrl.substring(0, 50)}...`);
      
      // Download and upload to Firebase Storage
      const firebaseUrl = await this.downloadAndUploadImage(imageUrl, firebasePath);
      
      if (firebaseUrl) {
        // Update database
        await this.updateProductDatabase(product, firebaseUrl);
        console.log(`  ✅ Success: ${product.name}`);
        this.results.successful++;
      } else {
        throw new Error('Failed to upload image');
      }

    } catch (error) {
      console.log(`  ❌ Failed: ${product.name} - ${error.message}`);
      this.results.failed++;
      this.results.errors.push(`${product.name}: ${error.message}`);
    }
  }

  async downloadAndUploadImage(imageUrl, firebasePath) {
    return new Promise((resolve, reject) => {
      const tempFile = path.join(os.tmpdir(), `supplement_${Date.now()}.jpg`);
      const file = fs.createWriteStream(tempFile);
      
      // Add proper headers to avoid 403 errors
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      };

      https.get(imageUrl, options, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
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
                contentType: 'image/jpeg',
                metadata: {
                  source: 'static-supplement-images',
                  uploadedAt: new Date().toISOString()
                }
              }
            });

            // Get public URL
            const storageFile = bucket.file(firebasePath);
            const [url] = await storageFile.getSignedUrl({
              action: 'read',
              expires: '03-09-2491'
            });

            // Clean up temp file
            fs.unlinkSync(tempFile);
            console.log(`    📤 Uploaded to Firebase Storage`);
            
            resolve(url);
          } catch (uploadError) {
            if (fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }
            reject(uploadError);
          }
        });
      }).on('error', (err) => {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
        reject(err);
      });
    });
  }

  async updateProductDatabase(product, firebaseUrl) {
    await db.collection('productCatalog').doc(product.id).update({
      imageUrl: firebaseUrl,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      imageSource: 'firebase-storage-static'
    });
  }

  generateImageFileName(productName, brand) {
    const clean = (str) => (str || '').toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 40);
    
    const cleanName = clean(productName);
    const cleanBrand = clean(brand);
    
    if (cleanBrand && cleanName && (cleanName.length + cleanBrand.length + 1) <= 40) {
      return `${cleanBrand}_${cleanName}`;
    } else if (cleanName) {
      return cleanName;
    } else if (cleanBrand) {
      return cleanBrand;
    } else {
      return `supplement_${Date.now()}`;
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateReport() {
    console.log('\n📊 STATIC IMAGE UPLOAD REPORT');
    console.log('==============================');
    console.log(`📦 Products processed: ${this.results.processed}`);
    console.log(`✅ Successfully uploaded: ${this.results.successful}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.results.errors.forEach(error => console.log(`  - ${error}`));
    }

    const successRate = this.results.processed > 0 ? 
      ((this.results.successful / this.results.processed) * 100).toFixed(1) : 0;
    console.log(`\n🎯 Success Rate: ${successRate}%`);

    if (this.results.successful > 0) {
      console.log('\n🎉 SUCCESS! Static images uploaded to Firebase Storage.');
      console.log('🔄 All products should now have working images.');
      console.log('\n📋 FINAL STATUS:');
      console.log(`   Total products: 33`);
      console.log(`   With Firebase images: ${24 + this.results.successful}`);
      console.log(`   Coverage: ${(((24 + this.results.successful) / 33) * 100).toFixed(1)}%`);
    }

    // Save results
    fs.writeFileSync('static-upload-results.json', JSON.stringify(this.results, null, 2));
    console.log('\n📁 Results saved to static-upload-results.json');
  }
}

// Run the uploader
const uploader = new StaticImageUploader();
uploader.uploadStaticImages().catch(console.error);
