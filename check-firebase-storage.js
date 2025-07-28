const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'nutriwise-ai-3fmvs.firebasestorage.app'
    });
}

const bucket = admin.storage().bucket();

async function checkStorageBucket() {
    try {
        console.log('🔍 Checking Firebase Storage bucket: nutriwise-ai-3fmvs.firebasestorage.app');
        console.log('===============================================');
        
        // Get all files in the bucket
        const [files] = await bucket.getFiles();
        
        console.log(`📁 Total files in storage bucket: ${files.length}`);
        console.log('');
        
        if (files.length === 0) {
            console.log('❌ No files found in the storage bucket!');
            console.log('');
            console.log('💡 This could mean:');
            console.log('   1. Images were never uploaded');
            console.log('   2. Wrong storage bucket is being used');
            console.log('   3. Images were uploaded to a different location');
            return;
        }
        
        // Categorize files
        const imageFiles = [];
        const otherFiles = [];
        
        files.forEach(file => {
            const fileName = file.name;
            const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
            
            if (isImage) {
                imageFiles.push(fileName);
            } else {
                otherFiles.push(fileName);
            }
        });
        
        console.log(`🖼️  Image files found: ${imageFiles.length}`);
        console.log(`📄 Other files found: ${otherFiles.length}`);
        console.log('');
        
        // Show first 20 image files
        if (imageFiles.length > 0) {
            console.log('🖼️  Sample image files:');
            imageFiles.slice(0, 20).forEach((fileName, index) => {
                console.log(`   ${index + 1}. ${fileName}`);
            });
            
            if (imageFiles.length > 20) {
                console.log(`   ... and ${imageFiles.length - 20} more image files`);
            }
            console.log('');
        }
        
        // Check for supplement-related images
        const supplementImages = imageFiles.filter(name => 
            name.toLowerCase().includes('supplement') || 
            name.toLowerCase().includes('protein') ||
            name.toLowerCase().includes('creatine') ||
            name.toLowerCase().includes('vitamin') ||
            name.toLowerCase().includes('ashwagandha') ||
            name.toLowerCase().includes('whey') ||
            name.toLowerCase().includes('bcaa')
        );
        
        console.log(`🏋️  Supplement-related images: ${supplementImages.length}`);
        if (supplementImages.length > 0) {
            supplementImages.slice(0, 10).forEach((fileName, index) => {
                console.log(`   ${index + 1}. ${fileName}`);
            });
        }
        console.log('');
        
        // Check other files
        if (otherFiles.length > 0) {
            console.log('📄 Other files in bucket:');
            otherFiles.slice(0, 10).forEach((fileName, index) => {
                console.log(`   ${index + 1}. ${fileName}`);
            });
            if (otherFiles.length > 10) {
                console.log(`   ... and ${otherFiles.length - 10} more files`);
            }
        }
        
        // Test getting a signed URL for the first image
        if (imageFiles.length > 0) {
            try {
                const firstImageFile = bucket.file(imageFiles[0]);
                const [url] = await firstImageFile.getSignedUrl({
                    action: 'read',
                    expires: Date.now() + 1000 * 60 * 60 // 1 hour
                });
                
                console.log('');
                console.log('✅ Test signed URL generated successfully:');
                console.log(`   File: ${imageFiles[0]}`);
                console.log(`   URL: ${url.substring(0, 100)}...`);
            } catch (error) {
                console.log('❌ Error generating signed URL:');
                console.log(`   ${error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking storage bucket:', error);
        
        if (error.code === 'storage/bucket-not-found') {
            console.log('');
            console.log('💡 Bucket not found. Check these possibilities:');
            console.log('   1. Verify the bucket name in firebaseConfig.json');
            console.log('   2. Ensure the service account has storage access');
            console.log('   3. Check if the bucket exists in Firebase Console');
        }
    }
}

// Also check what's in Firestore for comparison
async function checkFirestoreProducts() {
    try {
        console.log('');
        console.log('🔍 Checking Firestore products with image references...');
        console.log('===============================================');
        
        const db = admin.firestore();
        const productsSnapshot = await db.collection('products').limit(5).get();
        
        console.log(`📊 Sample of ${productsSnapshot.size} products from Firestore:`);
        
        productsSnapshot.forEach((doc, index) => {
            const data = doc.data();
            console.log(`\n${index + 1}. Product: ${data.name || 'Unknown'}`);
            console.log(`   Brand: ${data.brand || 'Unknown'}`);
            console.log(`   Image URL: ${data.imageUrl ? data.imageUrl.substring(0, 80) + '...' : 'No image URL'}`);
            console.log(`   Has storage ref: ${data.storageImagePath ? 'Yes (' + data.storageImagePath + ')' : 'No'}`);
        });
        
    } catch (error) {
        console.error('❌ Error checking Firestore:', error);
    }
}

async function main() {
    await checkStorageBucket();
    await checkFirestoreProducts();
    process.exit(0);
}

main();
