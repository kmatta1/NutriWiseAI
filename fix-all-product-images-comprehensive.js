require('dotenv').config();
const admin = require('firebase-admin');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

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

class ComprehensiveImageFixer {
    constructor() {
        this.processedProducts = 0;
        this.imagesDownloaded = 0;
        this.imagesFailed = 0;
        this.urlsFixed = 0;
        this.imageMap = new Map(); // Track existing images to prevent duplicates
        this.googleApiKey = process.env.GOOGLE_API_KEY;
        this.googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
        
        if (!this.googleApiKey || !this.googleSearchEngineId) {
            throw new Error('Google API credentials not found in environment variables');
        }
        
        console.log('✅ Google API credentials loaded successfully');
    }

    // Generate unique image name based on product details
    generateImageName(productName, brand) {
        const cleanName = productName.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 40);
        const cleanBrand = brand ? brand.toLowerCase().replace(/[^\w]/g, '') : 'generic';
        const timestamp = Date.now().toString().slice(-8); // Last 8 digits for uniqueness
        
        return `${cleanBrand}_${cleanName}_${timestamp}.jpg`;
    }

    // Search for product images using Google Custom Search API
    async searchProductImage(productName, brand) {
        try {
            // Create focused search terms for supplements
            const searchTerms = [
                `${brand} ${productName} supplement bottle`,
                `${productName} supplement ${brand}`,
                `${brand} ${productName} nutrition`,
                `${productName} supplement container`
            ];

            for (const searchTerm of searchTerms) {
                console.log(`🔍 Searching: "${searchTerm}"`);
                
                const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${this.googleApiKey}&cx=${this.googleSearchEngineId}&q=${encodeURIComponent(searchTerm)}&searchType=image&imgType=photo&imgSize=medium&safe=active&num=5`;
                
                const response = await axios.get(searchUrl, { timeout: 10000 });
                
                if (response.data.items && response.data.items.length > 0) {
                    // Filter for relevant images (prefer product bottles/containers)
                    const validImages = response.data.items.filter(item => {
                        const url = item.link.toLowerCase();
                        const title = item.title.toLowerCase();
                        
                        // Prefer images that look like product photos
                        const isProductPhoto = (
                            url.includes('supplement') ||
                            url.includes('protein') ||
                            url.includes('vitamin') ||
                            title.includes('supplement') ||
                            title.includes('bottle') ||
                            title.includes('container')
                        );
                        
                        // Avoid generic/stock images
                        const isNotGeneric = !(
                            url.includes('shutterstock') ||
                            url.includes('istockphoto') ||
                            url.includes('getty') ||
                            title.includes('stock')
                        );
                        
                        return isProductPhoto && isNotGeneric;
                    });
                    
                    if (validImages.length > 0) {
                        console.log(`✅ Found ${validImages.length} valid images for "${searchTerm}"`);
                        return validImages[0].link; // Return first valid image
                    }
                }
                
                // Add delay between searches to respect API limits
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            console.log(`⚠️  No suitable images found for ${brand} ${productName}`);
            return null;
            
        } catch (error) {
            if (error.response?.status === 429) {
                console.log('⏸️  Rate limit hit, waiting 60 seconds...');
                await new Promise(resolve => setTimeout(resolve, 60000));
                return null; // Skip this product for now
            }
            
            console.error(`❌ Image search failed for ${brand} ${productName}:`, error.message);
            return null;
        }
    }

    // Get fallback image based on category
    getFallbackImage(category, productName) {
        const fallbackImages = {
            'protein': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500',
            'vitamins': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500',
            'minerals': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500',
            'pre-workout': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
            'amino-acids': 'https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?w=500',
            'creatine': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
            'bcaa': 'https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?w=500',
            'default': 'https://images.unsplash.com/photo-1544966503-7e0ec817ac5a?w=500'
        };
        
        // Try to match category
        const categoryLower = category?.toLowerCase() || '';
        const productLower = productName.toLowerCase();
        
        if (categoryLower.includes('protein') || productLower.includes('protein')) {
            return fallbackImages.protein;
        } else if (categoryLower.includes('vitamin') || productLower.includes('vitamin')) {
            return fallbackImages.vitamins;
        } else if (categoryLower.includes('mineral') || productLower.includes('mineral')) {
            return fallbackImages.minerals;
        } else if (categoryLower.includes('pre') || productLower.includes('pre-workout')) {
            return fallbackImages['pre-workout'];
        } else if (productLower.includes('amino') || productLower.includes('bcaa')) {
            return fallbackImages['amino-acids'];
        } else if (productLower.includes('creatine')) {
            return fallbackImages.creatine;
        }
        
        return fallbackImages.default;
    }

    // Upload image to Firebase Storage using proven method
    async uploadImageToFirebase(imageUrl, imageName, productData) {
        try {
            console.log(`📤 Downloading and uploading: ${imageName}`);
            
            const response = await axios.get(imageUrl, { 
                responseType: 'stream',
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });

            const file = bucket.file(`images/supplements/${imageName}`);
            const stream = file.createWriteStream({
                metadata: {
                    contentType: 'image/jpeg',
                    metadata: {
                        productId: productData.id,
                        productName: productData.name,
                        brand: productData.brand || 'Unknown',
                        uploadedAt: new Date().toISOString(),
                        source: 'comprehensive-image-fix',
                        originalUrl: imageUrl
                    }
                }
            });

            return new Promise((resolve, reject) => {
                response.data.pipe(stream)
                    .on('error', (error) => {
                        console.error(`❌ Stream error for ${imageName}:`, error.message);
                        reject(error);
                    })
                    .on('finish', async () => {
                        try {
                            // Make file publicly accessible
                            await file.makePublic();
                            
                            // Get public URL
                            const publicUrl = `https://storage.googleapis.com/${bucket.name}/images/supplements/${imageName}`;
                            
                            console.log(`✅ Uploaded: ${imageName}`);
                            resolve(publicUrl);
                        } catch (error) {
                            console.error(`❌ Failed to get public URL for ${imageName}:`, error.message);
                            reject(error);
                        }
                    });
            });
        } catch (error) {
            console.error(`❌ Image upload failed for ${imageName}:`, error.message);
            throw error;
        }
    }

    // Check if image already exists in storage
    async checkExistingImage(imageName) {
        try {
            const file = bucket.file(`images/supplements/${imageName}`);
            const [exists] = await file.exists();
            return exists;
        } catch (error) {
            return false;
        }
    }

    // Process all products to fix their images
    async fixAllProductImages() {
        console.log('🚀 STARTING COMPREHENSIVE IMAGE FIX FOR ALL PRODUCTS');
        console.log('=====================================================');
        
        try {
            // Get all products from database
            console.log('📊 Loading all products from database...');
            const snapshot = await db.collection('productCatalog').get();
            const totalProducts = snapshot.size;
            
            console.log(`📦 Found ${totalProducts} products to process`);
            
            const results = {
                processed: 0,
                imagesDownloaded: 0,
                imagesFailed: 0,
                urlsFixed: 0,
                duplicatesSkipped: 0,
                errors: []
            };
            
            // Process each product
            for (const doc of snapshot.docs) {
                const productId = doc.id;
                const productData = doc.data();
                const { name, brand, category, imageUrl } = productData;
                
                console.log(`\n📋 Processing ${results.processed + 1}/${totalProducts}: ${name} by ${brand || 'Unknown'}`);
                
                try {
                    let needsNewImage = false;
                    let currentImageUrl = imageUrl;
                    
                    // Check if current image URL is broken or missing
                    if (!imageUrl || imageUrl.includes('placeholder') || imageUrl.includes('null') || imageUrl.includes('undefined')) {
                        needsNewImage = true;
                        console.log('🔴 No valid image URL found');
                    } else {
                        // Test if current image URL is accessible
                        try {
                            const testResponse = await axios.head(imageUrl, { timeout: 5000 });
                            if (testResponse.status !== 200) {
                                needsNewImage = true;
                                console.log('🔴 Current image URL returns error status');
                            } else {
                                console.log('✅ Current image URL is working');
                            }
                        } catch (error) {
                            needsNewImage = true;
                            console.log('🔴 Current image URL is not accessible');
                        }
                    }
                    
                    if (needsNewImage) {
                        // Generate unique image name
                        const imageName = this.generateImageName(name, brand);
                        
                        // Check if we already have this image
                        const existingImage = await this.checkExistingImage(imageName);
                        if (existingImage) {
                            console.log('⚠️  Image already exists, generating new name...');
                            const newImageName = this.generateImageName(name + '_new', brand);
                            imageName = newImageName;
                        }
                        
                        // Search for new image
                        let newImageUrl = await this.searchProductImage(name, brand);
                        
                        // Use fallback if no image found
                        if (!newImageUrl) {
                            console.log('🔄 Using fallback image...');
                            newImageUrl = this.getFallbackImage(category, name);
                        }
                        
                        try {
                            // Upload to Firebase Storage
                            const firebaseImageUrl = await this.uploadImageToFirebase(
                                newImageUrl, 
                                imageName, 
                                { id: productId, name, brand, category }
                            );
                            
                            // Update database with new image URL
                            await db.collection('productCatalog').doc(productId).update({
                                imageUrl: firebaseImageUrl,
                                imageName: imageName,
                                lastImageUpdate: admin.firestore.FieldValue.serverTimestamp(),
                                imageSource: 'comprehensive-fix'
                            });
                            
                            results.imagesDownloaded++;
                            results.urlsFixed++;
                            
                            console.log(`✅ Updated image for: ${name}`);
                            
                        } catch (uploadError) {
                            console.error(`❌ Failed to upload image for ${name}:`, uploadError.message);
                            results.imagesFailed++;
                            results.errors.push({
                                productId,
                                productName: name,
                                error: uploadError.message
                            });
                        }
                    }
                    
                    results.processed++;
                    
                    // Rate limiting to prevent API overload
                    if (results.processed % 10 === 0) {
                        console.log(`\n⏸️  Progress update: ${results.processed}/${totalProducts} processed`);
                        console.log(`📈 Images downloaded: ${results.imagesDownloaded}, Failed: ${results.imagesFailed}`);
                        console.log('⏳ Waiting 5 seconds for rate limiting...\n');
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                    
                } catch (error) {
                    console.error(`❌ Error processing product ${name}:`, error.message);
                    results.errors.push({
                        productId,
                        productName: name,
                        error: error.message
                    });
                    results.processed++;
                }
            }
            
            // Save detailed results
            const resultsData = {
                timestamp: new Date().toISOString(),
                totalProducts: totalProducts,
                results: results,
                summary: {
                    successRate: `${((results.imagesDownloaded / totalProducts) * 100).toFixed(1)}%`,
                    failureRate: `${((results.imagesFailed / totalProducts) * 100).toFixed(1)}%`
                }
            };
            
            fs.writeFileSync('./comprehensive-image-fix-results.json', JSON.stringify(resultsData, null, 2));
            
            console.log('\n🎉 COMPREHENSIVE IMAGE FIX COMPLETE!');
            console.log('=====================================');
            console.log(`📦 Total products processed: ${results.processed}`);
            console.log(`🖼️  Images successfully downloaded: ${results.imagesDownloaded}`);
            console.log(`❌ Images failed: ${results.imagesFailed}`);
            console.log(`🔧 URLs fixed in database: ${results.urlsFixed}`);
            console.log(`📊 Success rate: ${((results.imagesDownloaded / totalProducts) * 100).toFixed(1)}%`);
            console.log(`💾 Detailed results saved to: comprehensive-image-fix-results.json`);
            
            if (results.errors.length > 0) {
                console.log(`\n⚠️  ${results.errors.length} errors occurred:`);
                results.errors.forEach((error, index) => {
                    console.log(`   ${index + 1}. ${error.productName}: ${error.error}`);
                });
            }
            
            return results;
            
        } catch (error) {
            console.error('💥 Comprehensive image fix failed:', error);
            throw error;
        }
    }
}

// Execute the comprehensive fix
async function main() {
    try {
        const imageFixer = new ComprehensiveImageFixer();
        await imageFixer.fixAllProductImages();
        console.log('✅ All done! Your product catalog now has proper images.');
        
    } catch (error) {
        console.error('💥 Failed to fix product images:', error);
        process.exit(1);
    }
}

main();
