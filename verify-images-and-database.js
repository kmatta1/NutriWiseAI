const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'nutriwise-ai-3fmvs.firebasestorage.app'
    });
}

async function verifyImagesAndDatabase() {
    try {
        console.log('🔍 COMPREHENSIVE VERIFICATION: Images & Database');
        console.log('===============================================');
        
        const db = admin.firestore();
        const bucket = admin.storage().bucket();
        
        // 1. Check Firebase Storage
        console.log('📁 FIREBASE STORAGE CHECK');
        console.log('-------------------------');
        const [files] = await bucket.getFiles();
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name));
        
        console.log(`✅ Total images in storage: ${imageFiles.length}`);
        console.log(`   Storage bucket: nutriwise-ai-3fmvs.firebasestorage.app`);
        console.log(`   Images location: images/supplements/`);
        
        if (imageFiles.length > 0) {
            console.log('\n📸 Sample images in storage:');
            imageFiles.slice(0, 5).forEach((file, index) => {
                console.log(`   ${index + 1}. ${file.name}`);
            });
        }
        
        // 2. Check ProductCatalog Collection
        console.log('\n📊 FIRESTORE DATABASE CHECK');
        console.log('----------------------------');
        const productCatalogRef = db.collection('productCatalog');
        const allProducts = await productCatalogRef.get();
        
        console.log(`✅ Total products in productCatalog: ${allProducts.size}`);
        
        // 3. Analyze Image References
        let productsWithImages = 0;
        let productsWithStorageImages = 0;
        let productsWithAmazonImages = 0;
        let productsWithoutImages = 0;
        
        const sampleProducts = [];
        
        allProducts.forEach(doc => {
            const data = doc.data();
            
            if (data.imageUrl) {
                productsWithImages++;
                
                if (data.imageUrl.includes('firebasestorage.googleapis.com') || 
                    data.imageUrl.includes('storage.googleapis.com')) {
                    productsWithStorageImages++;
                } else if (data.imageUrl.includes('amazon.com') || 
                           data.imageUrl.includes('media-amazon.com')) {
                    productsWithAmazonImages++;
                }
            } else {
                productsWithoutImages++;
            }
            
            // Collect samples
            if (sampleProducts.length < 10) {
                sampleProducts.push({
                    id: doc.id,
                    name: data.name || 'Unknown',
                    brand: data.brand || 'Unknown',
                    imageUrl: data.imageUrl || 'No image',
                    storageRef: data.storageImagePath || 'No storage path'
                });
            }
        });
        
        console.log('\n📈 IMAGE REFERENCE ANALYSIS');
        console.log('----------------------------');
        console.log(`✅ Products with images: ${productsWithImages}/${allProducts.size}`);
        console.log(`🔥 Products using Firebase Storage: ${productsWithStorageImages}`);
        console.log(`🛒 Products using Amazon images: ${productsWithAmazonImages}`);
        console.log(`❌ Products without images: ${productsWithoutImages}`);
        
        // 4. Sample Product Details
        console.log('\n📋 SAMPLE PRODUCT DETAILS');
        console.log('-------------------------');
        sampleProducts.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} by ${product.brand}`);
            console.log(`   Image: ${product.imageUrl.substring(0, 80)}${product.imageUrl.length > 80 ? '...' : ''}`);
            console.log(`   Storage: ${product.storageRef}`);
            console.log('');
        });
        
        // 5. Test Image Access
        console.log('🧪 TESTING IMAGE ACCESS');
        console.log('-----------------------');
        
        if (imageFiles.length > 0) {
            try {
                const testFile = imageFiles[1]; // Skip the empty .jpg file
                const [signedUrl] = await testFile.getSignedUrl({
                    action: 'read',
                    expires: Date.now() + 1000 * 60 * 60 // 1 hour
                });
                
                console.log(`✅ Successfully generated signed URL for: ${testFile.name}`);
                console.log(`   URL: ${signedUrl.substring(0, 100)}...`);
                
                // Test if we can get file metadata
                const [metadata] = await testFile.getMetadata();
                console.log(`   File size: ${metadata.size} bytes`);
                console.log(`   Content type: ${metadata.contentType}`);
                console.log(`   Created: ${metadata.timeCreated}`);
                
            } catch (error) {
                console.log(`❌ Error accessing storage file: ${error.message}`);
            }
        }
        
        // 6. Summary
        console.log('\n🎯 VERIFICATION SUMMARY');
        console.log('======================');
        console.log(`✅ Firebase Storage: ${imageFiles.length} images uploaded`);
        console.log(`✅ Firestore Database: ${allProducts.size} products stored`);
        console.log(`✅ Image Integration: ${productsWithImages} products have image URLs`);
        console.log(`✅ Storage Integration: ${productsWithStorageImages} products use Firebase Storage`);
        
        if (productsWithStorageImages > 0) {
            console.log('\n🎉 SUCCESS: Images are properly stored and referenced!');
        } else {
            console.log('\n⚠️  WARNING: Products exist but may not be using Firebase Storage images');
        }
        
    } catch (error) {
        console.error('❌ Error during verification:', error);
    }
}

async function main() {
    await verifyImagesAndDatabase();
    process.exit(0);
}

main();
