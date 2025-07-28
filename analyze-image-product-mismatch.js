const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'nutriwise-ai-3fmvs.firebasestorage.app'
    });
}

async function analyzeImageProductMismatch() {
    try {
        console.log('🔍 ANALYZING IMAGE-PRODUCT MISMATCH');
        console.log('==================================');
        
        const db = admin.firestore();
        const bucket = admin.storage().bucket();
        
        // 1. Get all images in storage
        console.log('📁 Getting all images from Firebase Storage...');
        const [files] = await bucket.getFiles();
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name));
        
        console.log(`📸 Total images in storage: ${imageFiles.length}`);
        
        // List all actual image files
        console.log('\n📋 All images in storage:');
        imageFiles.forEach((file, index) => {
            console.log(`   ${index + 1}. ${file.name}`);
        });
        
        // 2. Get all products from database
        console.log('\n📊 Getting all products from productCatalog...');
        const allProducts = await db.collection('productCatalog').get();
        console.log(`📦 Total products in database: ${allProducts.size}`);
        
        // 3. Analyze image URL patterns
        console.log('\n🔍 Analyzing image URL patterns...');
        const imageUrlCounts = {};
        const productsWithSameImage = {};
        const uniqueImageUrls = new Set();
        
        allProducts.forEach(doc => {
            const data = doc.data();
            if (data.imageUrl) {
                uniqueImageUrls.add(data.imageUrl);
                
                if (!imageUrlCounts[data.imageUrl]) {
                    imageUrlCounts[data.imageUrl] = [];
                }
                imageUrlCounts[data.imageUrl].push({
                    id: doc.id,
                    name: data.name,
                    brand: data.brand
                });
            }
        });
        
        console.log(`🎯 Unique image URLs in database: ${uniqueImageUrls.size}`);
        console.log(`📸 Physical images in storage: ${imageFiles.length}`);
        console.log(`📦 Total products: ${allProducts.size}`);
        
        // 4. Find products sharing the same image
        console.log('\n⚠️  PRODUCTS SHARING THE SAME IMAGE:');
        console.log('=====================================');
        
        let sharedImageCount = 0;
        for (const [imageUrl, products] of Object.entries(imageUrlCounts)) {
            if (products.length > 1) {
                sharedImageCount++;
                console.log(`\n${sharedImageCount}. Image shared by ${products.length} products:`);
                console.log(`   URL: ${imageUrl.substring(0, 80)}...`);
                products.forEach((product, index) => {
                    console.log(`   ${index + 1}. ${product.name} by ${product.brand}`);
                });
            }
        }
        
        // 5. Check for missing images
        console.log('\n❌ CHECKING FOR MISSING IMAGES:');
        console.log('===============================');
        
        const storageImageNames = new Set(imageFiles.map(file => file.name));
        const missingImages = [];
        
        for (const imageUrl of uniqueImageUrls) {
            // Extract filename from URL
            const urlParts = imageUrl.split('/');
            const filename = urlParts[urlParts.length - 1];
            
            if (filename && !storageImageNames.has(`images/supplements/${filename}`)) {
                missingImages.push({
                    url: imageUrl,
                    expectedFile: `images/supplements/${filename}`
                });
            }
        }
        
        console.log(`🔍 Missing images: ${missingImages.length}`);
        if (missingImages.length > 0) {
            missingImages.slice(0, 10).forEach((missing, index) => {
                console.log(`   ${index + 1}. Expected: ${missing.expectedFile}`);
                console.log(`      URL: ${missing.url.substring(0, 80)}...`);
            });
        }
        
        // 6. Check if products are using placeholder/default images
        console.log('\n🎯 CHECKING FOR PLACEHOLDER IMAGES:');
        console.log('===================================');
        
        const placeholderPatterns = ['placeholder', 'default', 'generic', 'no-image'];
        const placeholderImages = [];
        
        for (const [imageUrl, products] of Object.entries(imageUrlCounts)) {
            const lowerUrl = imageUrl.toLowerCase();
            if (placeholderPatterns.some(pattern => lowerUrl.includes(pattern)) || 
                products.length > 10) { // If more than 10 products share same image, likely a placeholder
                placeholderImages.push({
                    url: imageUrl,
                    productCount: products.length,
                    products: products.slice(0, 5) // Show first 5 products
                });
            }
        }
        
        if (placeholderImages.length > 0) {
            console.log(`⚠️  Found ${placeholderImages.length} potential placeholder images:`);
            placeholderImages.forEach((placeholder, index) => {
                console.log(`\n   ${index + 1}. ${placeholder.productCount} products using:`);
                console.log(`      URL: ${placeholder.url.substring(0, 80)}...`);
                placeholder.products.forEach(product => {
                    console.log(`         - ${product.name} by ${product.brand}`);
                });
            });
        }
        
        // 7. Summary and recommendations
        console.log('\n📊 ANALYSIS SUMMARY:');
        console.log('===================');
        console.log(`📦 Total products: ${allProducts.size}`);
        console.log(`📸 Physical images in storage: ${imageFiles.length}`);
        console.log(`🎯 Unique image URLs: ${uniqueImageUrls.size}`);
        console.log(`⚠️  Images shared by multiple products: ${sharedImageCount}`);
        console.log(`❌ Missing image files: ${missingImages.length}`);
        
        // Calculate the real situation
        const avgProductsPerImage = allProducts.size / imageFiles.length;
        console.log(`📈 Average products per image: ${avgProductsPerImage.toFixed(1)}`);
        
        console.log('\n💡 RECOMMENDATIONS:');
        console.log('===================');
        
        if (imageFiles.length < allProducts.size) {
            console.log('❌ CRITICAL: You need more images!');
            console.log(`   - Need approximately ${allProducts.size - imageFiles.length} more images`);
            console.log('   - Each product should have its own unique image');
            console.log('   - Current setup has multiple products sharing images');
        }
        
        if (sharedImageCount > 0) {
            console.log('⚠️  WARNING: Multiple products sharing images');
            console.log('   - This creates confusion for customers');
            console.log('   - Need to source unique images for each product');
        }
        
        if (missingImages.length > 0) {
            console.log('🔧 FIX NEEDED: Some image URLs point to non-existent files');
            console.log('   - Database has references to images not in storage');
            console.log('   - Need to upload missing images or fix URLs');
        }
        
    } catch (error) {
        console.error('❌ Error analyzing image-product mismatch:', error);
    }
}

async function main() {
    await analyzeImageProductMismatch();
    process.exit(0);
}

main();
