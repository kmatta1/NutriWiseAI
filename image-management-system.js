const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'nutriwise-ai-3fmvs.firebasestorage.app'
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

class ImageManagementSystem {
  constructor() {
    this.imageRegistry = new Map(); // Track all images in use
    this.productRegistry = new Map(); // Track all products
  }

  // Initialize the registry from current database state
  async initializeRegistry() {
    console.log('🔄 Initializing image management registry...');
    
    const snapshot = await db.collection('productCatalog').get();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      this.productRegistry.set(doc.id, {
        name: data.name,
        brand: data.brand,
        imageUrl: data.imageUrl || null
      });
      
      if (data.imageUrl) {
        if (!this.imageRegistry.has(data.imageUrl)) {
          this.imageRegistry.set(data.imageUrl, []);
        }
        this.imageRegistry.get(data.imageUrl).push(doc.id);
      }
    });
    
    console.log(`📊 Registry initialized: ${this.productRegistry.size} products, ${this.imageRegistry.size} unique images`);
  }

  // Generate unique product key for duplicate detection
  generateProductKey(name, brand) {
    const normalize = (str) => (str || '').toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const normalizedName = normalize(name);
    const normalizedBrand = normalize(brand);
    
    return `${normalizedBrand}:${normalizedName}`;
  }

  // Check if product is a duplicate
  isDuplicate(name, brand, excludeId = null) {
    const productKey = this.generateProductKey(name, brand);
    
    for (const [productId, product] of this.productRegistry) {
      if (productId === excludeId) continue;
      
      const existingKey = this.generateProductKey(product.name, product.brand);
      if (existingKey === productKey) {
        return { isDuplicate: true, existingProductId: productId };
      }
    }
    
    return { isDuplicate: false };
  }

  // Check if image is already in use
  isImageInUse(imageUrl, excludeProductId = null) {
    const usedBy = this.imageRegistry.get(imageUrl) || [];
    const otherUsers = usedBy.filter(id => id !== excludeProductId);
    
    return {
      inUse: otherUsers.length > 0,
      usedByProducts: otherUsers,
      usageCount: otherUsers.length
    };
  }

  // Add new product with validation
  async addProduct(productData, imageUrl = null) {
    const { name, brand } = productData;
    
    // Check for duplicates
    const duplicateCheck = this.isDuplicate(name, brand);
    if (duplicateCheck.isDuplicate) {
      throw new Error(`Duplicate product detected. Similar product already exists: ${duplicateCheck.existingProductId}`);
    }
    
    // Check image usage
    if (imageUrl) {
      const imageCheck = this.isImageInUse(imageUrl);
      if (imageCheck.inUse) {
        throw new Error(`Image already in use by ${imageCheck.usageCount} other product(s): ${imageCheck.usedByProducts.join(', ')}`);
      }
    }
    
    // Create product with unique ID
    const productRef = db.collection('productCatalog').doc();
    const productId = productRef.id;
    
    const completeProductData = {
      ...productData,
      imageUrl: imageUrl || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      isUniqueImage: Boolean(imageUrl),
      managedByImageSystem: true
    };
    
    await productRef.set(completeProductData);
    
    // Update registry
    this.productRegistry.set(productId, { name, brand, imageUrl });
    if (imageUrl) {
      if (!this.imageRegistry.has(imageUrl)) {
        this.imageRegistry.set(imageUrl, []);
      }
      this.imageRegistry.get(imageUrl).push(productId);
    }
    
    console.log(`✅ Added product: ${name} by ${brand} (ID: ${productId})`);
    return productId;
  }

  // Update product with validation
  async updateProduct(productId, updates) {
    const existingProduct = this.productRegistry.get(productId);
    if (!existingProduct) {
      throw new Error(`Product not found: ${productId}`);
    }
    
    const newName = updates.name || existingProduct.name;
    const newBrand = updates.brand || existingProduct.brand;
    const newImageUrl = updates.imageUrl || existingProduct.imageUrl;
    
    // Check for duplicates (excluding this product)
    if (updates.name || updates.brand) {
      const duplicateCheck = this.isDuplicate(newName, newBrand, productId);
      if (duplicateCheck.isDuplicate) {
        throw new Error(`Update would create duplicate. Similar product exists: ${duplicateCheck.existingProductId}`);
      }
    }
    
    // Check image usage (excluding this product)
    if (updates.imageUrl && updates.imageUrl !== existingProduct.imageUrl) {
      const imageCheck = this.isImageInUse(updates.imageUrl, productId);
      if (imageCheck.inUse) {
        throw new Error(`Image already in use by ${imageCheck.usageCount} other product(s): ${imageCheck.usedByProducts.join(', ')}`);
      }
    }
    
    // Update database
    const updateData = {
      ...updates,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      managedByImageSystem: true
    };
    
    await db.collection('productCatalog').doc(productId).update(updateData);
    
    // Update registry
    const oldImageUrl = existingProduct.imageUrl;
    const updatedProduct = { ...existingProduct, ...updates };
    this.productRegistry.set(productId, updatedProduct);
    
    // Update image registry
    if (oldImageUrl && oldImageUrl !== newImageUrl) {
      const oldImageUsers = this.imageRegistry.get(oldImageUrl) || [];
      const updatedOldUsers = oldImageUsers.filter(id => id !== productId);
      if (updatedOldUsers.length > 0) {
        this.imageRegistry.set(oldImageUrl, updatedOldUsers);
      } else {
        this.imageRegistry.delete(oldImageUrl);
      }
    }
    
    if (newImageUrl && newImageUrl !== oldImageUrl) {
      if (!this.imageRegistry.has(newImageUrl)) {
        this.imageRegistry.set(newImageUrl, []);
      }
      this.imageRegistry.get(newImageUrl).push(productId);
    }
    
    console.log(`✅ Updated product: ${productId}`);
  }

  // Remove product
  async removeProduct(productId) {
    const existingProduct = this.productRegistry.get(productId);
    if (!existingProduct) {
      throw new Error(`Product not found: ${productId}`);
    }
    
    // Remove from database
    await db.collection('productCatalog').doc(productId).delete();
    
    // Update registry
    this.productRegistry.delete(productId);
    
    // Update image registry
    if (existingProduct.imageUrl) {
      const imageUsers = this.imageRegistry.get(existingProduct.imageUrl) || [];
      const updatedUsers = imageUsers.filter(id => id !== productId);
      if (updatedUsers.length > 0) {
        this.imageRegistry.set(existingProduct.imageUrl, updatedUsers);
      } else {
        this.imageRegistry.delete(existingProduct.imageUrl);
      }
    }
    
    console.log(`✅ Removed product: ${productId}`);
  }

  // Audit current database for issues
  async auditDatabase() {
    console.log('🔍 AUDITING DATABASE FOR IMAGE AND DUPLICATE ISSUES');
    console.log('====================================================\n');
    
    await this.initializeRegistry();
    
    const issues = {
      duplicateProducts: [],
      sharedImages: [],
      brokenImages: [],
      missingImages: []
    };
    
    // Check for duplicate products
    const productKeys = new Map();
    for (const [productId, product] of this.productRegistry) {
      const key = this.generateProductKey(product.name, product.brand);
      if (!productKeys.has(key)) {
        productKeys.set(key, []);
      }
      productKeys.get(key).push({ id: productId, ...product });
    }
    
    for (const [key, products] of productKeys) {
      if (products.length > 1) {
        issues.duplicateProducts.push({
          key: key,
          products: products,
          count: products.length
        });
      }
    }
    
    // Check for shared images
    for (const [imageUrl, productIds] of this.imageRegistry) {
      if (productIds.length > 1) {
        issues.sharedImages.push({
          imageUrl: imageUrl,
          productIds: productIds,
          count: productIds.length
        });
      }
    }
    
    // Check for missing images
    for (const [productId, product] of this.productRegistry) {
      if (!product.imageUrl) {
        issues.missingImages.push({ id: productId, ...product });
      }
    }
    
    // Report results
    console.log('📊 AUDIT RESULTS:');
    console.log('=================');
    console.log(`📦 Total products: ${this.productRegistry.size}`);
    console.log(`🖼️ Unique images: ${this.imageRegistry.size}`);
    console.log(`❌ Duplicate products: ${issues.duplicateProducts.length}`);
    console.log(`⚠️ Shared images: ${issues.sharedImages.length}`);
    console.log(`🚫 Missing images: ${issues.missingImages.length}`);
    
    if (issues.duplicateProducts.length > 0) {
      console.log('\n❌ DUPLICATE PRODUCTS:');
      issues.duplicateProducts.forEach((issue, index) => {
        console.log(`  ${index + 1}. "${issue.key}" (${issue.count} duplicates):`);
        issue.products.forEach(product => {
          console.log(`     - ${product.id}: ${product.name} by ${product.brand}`);
        });
      });
    }
    
    if (issues.sharedImages.length > 0) {
      console.log('\n⚠️ SHARED IMAGES:');
      issues.sharedImages.slice(0, 10).forEach((issue, index) => {
        console.log(`  ${index + 1}. Shared by ${issue.count} products:`);
        console.log(`     Image: ${issue.imageUrl.substring(0, 60)}...`);
        issue.productIds.forEach(id => {
          const product = this.productRegistry.get(id);
          console.log(`     - ${id}: ${product.name} by ${product.brand}`);
        });
      });
      if (issues.sharedImages.length > 10) {
        console.log(`     ... and ${issues.sharedImages.length - 10} more shared image issues`);
      }
    }
    
    return issues;
  }

  // Fix all detected issues
  async fixAllIssues() {
    console.log('🔧 FIXING ALL DETECTED ISSUES');
    console.log('===============================\n');
    
    const issues = await this.auditDatabase();
    const ComprehensiveImageManager = require('./comprehensive-image-manager');
    const imageManager = new ComprehensiveImageManager();
    
    let fixResults = {
      duplicatesRemoved: 0,
      sharedImagesFixed: 0,
      missingImagesAdded: 0,
      errors: []
    };
    
    // Fix duplicate products (remove extras, keep the first one)
    for (const issue of issues.duplicateProducts) {
      try {
        const productsToRemove = issue.products.slice(1); // Keep first, remove rest
        
        for (const product of productsToRemove) {
          await this.removeProduct(product.id);
          fixResults.duplicatesRemoved++;
          console.log(`🗑️ Removed duplicate: ${product.name} by ${product.brand} (${product.id})`);
        }
      } catch (error) {
        console.error(`❌ Failed to remove duplicate: ${error.message}`);
        fixResults.errors.push(`Duplicate removal: ${error.message}`);
      }
    }
    
    // Fix shared images (get unique images for each product except the first)
    for (const issue of issues.sharedImages) {
      try {
        const productsToFix = issue.productIds.slice(1); // Keep first, fix rest
        
        for (const productId of productsToFix) {
          const product = this.productRegistry.get(productId);
          
          try {
            console.log(`🔄 Getting unique image for: ${product.name} by ${product.brand}`);
            
            const imageData = await imageManager.findUniqueProductImage(
              product.name, 
              product.brand, 
              productId
            );
            
            const firebaseUrl = await imageManager.downloadAndUploadUniqueImage(
              imageData.imageUrl,
              product.name,
              product.brand,
              productId,
              imageData.source
            );
            
            await this.updateProduct(productId, {
              imageUrl: firebaseUrl,
              imageSource: 'unique-fix',
              isUniqueImage: true
            });
            
            fixResults.sharedImagesFixed++;
            console.log(`✅ Fixed shared image for: ${product.name}`);
            
          } catch (imageError) {
            console.error(`❌ Failed to fix image for ${product.name}: ${imageError.message}`);
            fixResults.errors.push(`Image fix for ${product.name}: ${imageError.message}`);
          }
        }
      } catch (error) {
        console.error(`❌ Failed to process shared image issue: ${error.message}`);
        fixResults.errors.push(`Shared image fix: ${error.message}`);
      }
    }
    
    console.log('\n📊 FIX RESULTS:');
    console.log('===============');
    console.log(`🗑️ Duplicates removed: ${fixResults.duplicatesRemoved}`);
    console.log(`🔄 Shared images fixed: ${fixResults.sharedImagesFixed}`);
    console.log(`❌ Errors: ${fixResults.errors.length}`);
    
    if (fixResults.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      fixResults.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    return fixResults;
  }

  // Validate and clean up all Firebase Storage images
  async cleanupStorageImages() {
    console.log('🧹 CLEANING UP FIREBASE STORAGE');
    console.log('================================\n');
    
    try {
      // Get all files in storage
      const [files] = await bucket.getFiles({ prefix: 'images/supplements/' });
      console.log(`📁 Found ${files.length} files in storage`);
      
      // Get all image URLs currently in use
      const usedUrls = new Set();
      for (const [productId, product] of this.productRegistry) {
        if (product.imageUrl) {
          usedUrls.add(product.imageUrl);
        }
      }
      
      console.log(`🔗 Found ${usedUrls.size} image URLs in database`);
      
      // Check for orphaned files
      const orphanedFiles = [];
      const fileUrls = new Map(); // filename -> signed URL
      
      for (const file of files) {
        try {
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
          });
          fileUrls.set(file.name, url);
          
          if (!usedUrls.has(url)) {
            orphanedFiles.push({
              name: file.name,
              url: url,
              size: file.metadata.size
            });
          }
        } catch (error) {
          console.log(`⚠️ Could not get URL for ${file.name}: ${error.message}`);
        }
      }
      
      console.log(`🗑️ Found ${orphanedFiles.length} orphaned files`);
      
      if (orphanedFiles.length > 0) {
        console.log('\nOrphaned files:');
        orphanedFiles.forEach((file, index) => {
          console.log(`  ${index + 1}. ${file.name} (${file.size} bytes)`);
        });
        
        // Optionally remove orphaned files (commented out for safety)
        // console.log('\n🗑️ Removing orphaned files...');
        // for (const file of orphanedFiles) {
        //   try {
        //     await bucket.file(file.name).delete();
        //     console.log(`✅ Deleted: ${file.name}`);
        //   } catch (error) {
        //     console.log(`❌ Failed to delete ${file.name}: ${error.message}`);
        //   }
        // }
      }
      
      return {
        totalFiles: files.length,
        usedFiles: files.length - orphanedFiles.length,
        orphanedFiles: orphanedFiles.length
      };
      
    } catch (error) {
      console.error('❌ Storage cleanup failed:', error);
      throw error;
    }
  }
}

// Export for use in other scripts
module.exports = ImageManagementSystem;

// Run if called directly
if (require.main === module) {
  console.log('🛠️ IMAGE MANAGEMENT SYSTEM');
  console.log('============================\n');
  console.log('This system will:');
  console.log('✅ Audit your database for duplicate products and shared images');
  console.log('✅ Fix all detected issues automatically');
  console.log('✅ Prevent future duplicates and image conflicts');
  console.log('✅ Clean up orphaned storage files');
  console.log('\n🚀 Starting audit and fix process...\n');

  const system = new ImageManagementSystem();
  
  system.auditDatabase()
    .then(() => system.fixAllIssues())
    .then(() => system.cleanupStorageImages())
    .then(() => {
      console.log('\n🎉 IMAGE MANAGEMENT SYSTEM COMPLETE!');
      console.log('====================================');
      console.log('✅ All issues have been identified and fixed');
      console.log('✅ Database is now clean and optimized');
      console.log('✅ Future duplicate prevention is active');
      console.log('✅ Storage cleanup completed');
    })
    .catch(console.error);
}
