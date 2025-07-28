// nightly-sync-service.js
// Service for nightly product data updates and image maintenance

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

class NightlySyncService {
  constructor() {
    this.logFile = `sync-log-${new Date().toISOString().split('T')[0]}.json`;
    this.syncResults = {
      timestamp: new Date().toISOString(),
      productsUpdated: 0,
      imagesFixed: 0,
      errors: [],
      warnings: []
    };
  }

  // Main sync process
  async runNightlySync() {
    console.log('🌙 Starting nightly sync process...\n');
    
    try {
      await this.validateImageUrls();
      await this.syncPrices();
      await this.cleanupDuplicates();
      await this.generateReport();
      
      console.log('✅ Nightly sync completed successfully!');
    } catch (error) {
      console.error('❌ Nightly sync failed:', error);
      this.syncResults.errors.push(error.message);
    } finally {
      await this.saveLog();
    }
  }

  // Validate and fix image URLs
  async validateImageUrls() {
    console.log('🔍 Validating image URLs...');
    
    const snapshot = await db.collection('productCatalog').get();
    const batch = db.batch();
    let fixCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const currentImageUrl = data.imageUrl;
      
      // Skip if already Firebase Storage URL
      if (currentImageUrl && 
          (currentImageUrl.includes('firebasestorage.googleapis.com') || 
           currentImageUrl.includes('firebasestorage.app'))) {
        continue;
      }

      // Try to find corresponding Firebase Storage image
      const firebaseImageUrl = await this.findFirebaseImage(data);
      
      if (firebaseImageUrl) {
        batch.update(doc.ref, {
          imageUrl: firebaseImageUrl,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        fixCount++;
        console.log(`🔧 Fixed image for: ${data.name}`);
      } else {
        this.syncResults.warnings.push(`No Firebase image found for: ${data.name}`);
      }
    }

    if (fixCount > 0) {
      await batch.commit();
      this.syncResults.imagesFixed = fixCount;
      console.log(`✅ Fixed ${fixCount} image URLs`);
    }
  }

  // Find corresponding Firebase Storage image
  async findFirebaseImage(productData) {
    try {
      const productName = productData.name || '';
      const sanitizedName = this.sanitizeFileName(productName);
      
      // Possible image paths
      const possiblePaths = [
        `images/supplements/${sanitizedName}.jpg`,
        `images/supplements/${sanitizedName}.png`,
        `supplement-images/${sanitizedName}.jpg`,
        `supplement-images/supplement_${productData.id}.jpg`
      ];

      for (const path of possiblePaths) {
        const file = bucket.file(path);
        const [exists] = await file.exists();
        
        if (exists) {
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
          });
          return url;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error finding image for ${productData.name}:`, error);
      return null;
    }
  }

  // Sync product prices (placeholder for external API integration)
  async syncPrices() {
    console.log('💰 Syncing product prices...');
    
    // This would integrate with Amazon API, but for now we'll just update timestamps
    const snapshot = await db.collection('productCatalog').get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        lastPriceUpdate: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log('✅ Price sync timestamps updated');
  }

  // Remove duplicate products
  async cleanupDuplicates() {
    console.log('🧹 Cleaning up duplicates...');
    
    const snapshot = await db.collection('productCatalog').get();
    const productMap = new Map();
    const duplicates = [];

    // Find duplicates by name and brand
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const key = `${data.brand || ''}_${data.name || ''}`.toLowerCase();
      
      if (productMap.has(key)) {
        duplicates.push(doc.id);
      } else {
        productMap.set(key, doc.id);
      }
    });

    if (duplicates.length > 0) {
      console.log(`⚠️  Found ${duplicates.length} potential duplicates`);
      this.syncResults.warnings.push(`${duplicates.length} potential duplicates found`);
      // Add duplicate IDs to log for manual review
      this.syncResults.duplicateIds = duplicates;
    }
  }

  // Generate sync report
  async generateReport() {
    console.log('\n📊 NIGHTLY SYNC REPORT');
    console.log('======================');
    console.log(`🕐 Timestamp: ${this.syncResults.timestamp}`);
    console.log(`📦 Products updated: ${this.syncResults.productsUpdated}`);
    console.log(`🖼️  Images fixed: ${this.syncResults.imagesFixed}`);
    console.log(`⚠️  Warnings: ${this.syncResults.warnings.length}`);
    console.log(`❌ Errors: ${this.syncResults.errors.length}`);
    
    if (this.syncResults.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.syncResults.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (this.syncResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.syncResults.errors.forEach(error => console.log(`  - ${error}`));
    }
  }

  // Save sync log
  async saveLog() {
    const fs = require('fs');
    fs.writeFileSync(this.logFile, JSON.stringify(this.syncResults, null, 2));
    console.log(`\n📁 Sync log saved to ${this.logFile}`);
  }

  // Utility: Sanitize filename
  sanitizeFileName(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }
}

// Run if called directly
if (require.main === module) {
  const syncService = new NightlySyncService();
  syncService.runNightlySync().catch(console.error);
}

module.exports = NightlySyncService;
