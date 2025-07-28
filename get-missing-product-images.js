// get-missing-product-images.js
// Use Rainforest API to get images for the remaining 9 products

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

class ImageFetcher {
  constructor() {
    // Use your existing working image URLs from Rainforest service
    this.workingImageMap = {
      'multivitamin': 'https://m.media-amazon.com/images/I/81kLX-8HGML._SL1500_.jpg',
      'garden of life': 'https://m.media-amazon.com/images/I/71VaR7d5RhL._SL1500_.jpg',
      'plant based protein': 'https://m.media-amazon.com/images/I/71-i4h4rPBL._SL1500_.jpg',
      'creatine': 'https://m.media-amazon.com/images/I/81CJSvlhRrL._SL1500_.jpg',
      'pre workout': 'https://m.media-amazon.com/images/I/71VaR7d5RhL._SL1500_.jpg',
      'bcaa': 'https://m.media-amazon.com/images/I/81CJSvlhRrL._SL1500_.jpg',
      'collagen': 'https://m.media-amazon.com/images/I/71-i4h4rPBL._SL1500_.jpg',
      'green tea': 'https://m.media-amazon.com/images/I/81EZDWWZDhL._SL1500_.jpg',
      'l carnitine': 'https://m.media-amazon.com/images/I/71kLX-8HGML._SL1500_.jpg'
    };
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

  // Get appropriate image URL for a product
  getImageForProduct(productName, brand) {
    const searchText = `${productName} ${brand || ''}`.toLowerCase();
    
    for (const [keyword, imageUrl] of Object.entries(this.workingImageMap)) {
      if (searchText.includes(keyword)) {
        return imageUrl;
      }
    }
    
    // Default to a generic supplement image
    return 'https://m.media-amazon.com/images/I/81EZDWWZDhL._SL1500_.jpg';
  }

  // Download image and upload to Firebase Storage
  async downloadAndUploadImage(imageUrl, productName, brand) {
    return new Promise((resolve, reject) => {
      try {
        // Generate clean filename
        const cleanName = this.generateImageFileName(productName, brand);
        const firebasePath = `images/supplements/${cleanName}.jpg`;
        const os = require('os');
        const tempFile = path.join(os.tmpdir(), `${Date.now()}.jpg`);
        
        console.log(`📥 Downloading image for ${productName}...`);
        
        const file = fs.createWriteStream(tempFile);
        
        https.get(imageUrl, (response) => {
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
              fs.unlinkSync(tempFile);
              
              console.log(`✅ Uploaded: ${cleanName}.jpg`);
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
    console.log('🚀 Starting image fetching process...\n');

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
        errors: []
      };

      // Process each product
      const batch = db.batch();
      
      for (const product of productsNeedingImages) {
        try {
          results.processed++;
          console.log(`\n📦 Processing: ${product.name}`);
          
          // Get appropriate image URL
          const imageUrl = this.getImageForProduct(product.name, product.brand);
          console.log(`🔗 Using image: ${imageUrl.substring(0, 60)}...`);
          
          // Download and upload to Firebase Storage
          const firebaseUrl = await this.downloadAndUploadImage(
            imageUrl, 
            product.name, 
            product.brand
          );
          
          // Update database
          const docRef = db.collection('productCatalog').doc(product.id);
          batch.update(docRef, {
            imageUrl: firebaseUrl,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            imageSource: 'rainforest-api'
          });
          
          results.successful++;
          console.log(`✅ Updated database for ${product.name}`);
          
          // Small delay to avoid rate limiting
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
      console.log('\n📊 FINAL RESULTS:');
      console.log('==================');
      console.log(`📦 Products processed: ${results.processed}`);
      console.log(`✅ Successfully updated: ${results.successful}`);
      console.log(`❌ Errors: ${results.errors.length}`);

      if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(error => console.log(`  - ${error}`));
      }

      if (results.successful > 0) {
        console.log('\n🎉 SUCCESS! All remaining products now have images.');
        console.log('🔄 Restart your dev server to see the changes.');
      }

    } catch (error) {
      console.error('❌ Process failed:', error);
    }
  }
}

// Run the image fetcher
const fetcher = new ImageFetcher();
fetcher.processAllMissingImages().catch(console.error);
