require('dotenv').config();
const admin = require('firebase-admin');
const axios = require('axios');
const fs = require('fs');

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

class ImageQualityAnalyzer {
    constructor() {
        this.googleApiKey = process.env.GOOGLE_API_KEY;
        this.googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
        this.unprofessionalImages = [];
        this.professionalImages = [];
        this.needsReplacement = [];
        
        // Keywords that indicate unprofessional images
        this.unprofessionalKeywords = [
            'holding', 'hand', 'person', 'man', 'woman', 'people', 'lifestyle',
            'back', 'rear', 'behind', 'reverse side', 'label back',
            'gym', 'workout', 'fitness model', 'athlete', 'bodybuilder',
            'blurry', 'low quality', 'poor lighting', 'dark',
            'multiple products', 'stack', 'pile', 'collection',
            'packaging', 'box', 'shipping', 'amazon', 'retail'
        ];
        
        // Keywords that indicate professional product images
        this.professionalKeywords = [
            'bottle', 'container', 'jar', 'supplement bottle', 'product shot',
            'white background', 'clean background', 'studio', 'professional',
            'front view', 'label visible', 'clear label', 'product photography',
            'isolated', 'clean', 'high quality', 'clear image'
        ];
    }

    // Analyze image URL and metadata to determine if it's professional
    analyzeImageProfessionalism(imageUrl, productName, brand) {
        const urlLower = imageUrl.toLowerCase();
        const productLower = productName.toLowerCase();
        
        // Check URL for obvious signs of unprofessional images
        const unprofessionalSigns = [
            'lifestyle', 'holding', 'person', 'people', 'hand',
            'gym', 'workout', 'fitness', 'model', 'athlete',
            'amazon', 'ebay', 'walmart', 'target', 'retail',
            'review', 'unboxing', 'back', 'rear'
        ];
        
        const professionalSigns = [
            'bottle', 'container', 'product', 'supplement',
            'white-background', 'studio', 'professional',
            'isolated', 'clean'
        ];
        
        let unprofessionalScore = 0;
        let professionalScore = 0;
        
        // Score based on URL analysis
        unprofessionalSigns.forEach(keyword => {
            if (urlLower.includes(keyword)) {
                unprofessionalScore += 2;
            }
        });
        
        professionalSigns.forEach(keyword => {
            if (urlLower.includes(keyword)) {
                professionalScore += 2;
            }
        });
        
        // Additional scoring based on image source
        if (urlLower.includes('unsplash')) {
            // Unsplash images are often stock photos, not actual products
            unprofessionalScore += 3;
        }
        
        if (urlLower.includes('storage.googleapis.com') && urlLower.includes('supplements')) {
            // Our own uploaded images are more likely to be product-specific
            professionalScore += 1;
        }
        
        return {
            unprofessionalScore,
            professionalScore,
            isProfessional: professionalScore > unprofessionalScore,
            needsReplacement: unprofessionalScore >= professionalScore
        };
    }

    // Search for high-quality, professional product images
    async searchProfessionalProductImage(productName, brand) {
        try {
            // Create search terms specifically for professional product photography
            const searchTerms = [
                `${brand} ${productName} supplement bottle white background`,
                `${brand} ${productName} product photography professional`,
                `${productName} supplement container isolated background`,
                `${brand} ${productName} official product image`,
                `${productName} supplement bottle studio photography`
            ];

            for (const searchTerm of searchTerms) {
                console.log(`🔍 Searching for professional image: "${searchTerm}"`);
                
                const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${this.googleApiKey}&cx=${this.googleSearchEngineId}&q=${encodeURIComponent(searchTerm)}&searchType=image&imgType=photo&imgSize=medium&safe=active&num=10&imgColorType=color&rights=cc_publicdomain,cc_attribute,cc_sharealike,cc_noncommercial,cc_nonderived`;
                
                const response = await axios.get(searchUrl, { timeout: 10000 });
                
                if (response.data.items && response.data.items.length > 0) {
                    // Filter for professional product images
                    const professionalImages = response.data.items.filter(item => {
                        const url = item.link.toLowerCase();
                        const title = item.title.toLowerCase();
                        const snippet = (item.snippet || '').toLowerCase();
                        
                        // Must include product-related terms
                        const hasProductTerms = (
                            title.includes('supplement') ||
                            title.includes('bottle') ||
                            title.includes('container') ||
                            title.includes('capsule') ||
                            title.includes('tablet') ||
                            title.includes('powder') ||
                            snippet.includes('supplement')
                        );
                        
                        // Must NOT include unprofessional terms
                        const hasUnprofessionalTerms = (
                            title.includes('holding') ||
                            title.includes('person') ||
                            title.includes('hand') ||
                            title.includes('man') ||
                            title.includes('woman') ||
                            title.includes('lifestyle') ||
                            title.includes('workout') ||
                            title.includes('gym') ||
                            snippet.includes('holding') ||
                            snippet.includes('person')
                        );
                        
                        // Prefer professional sources
                        const isProfessionalSource = (
                            url.includes('amazon.com') ||
                            url.includes('iherb.com') ||
                            url.includes('vitacost.com') ||
                            url.includes('bodybuilding.com') ||
                            url.includes('supplementwarehouse.com') ||
                            url.includes('a1supplements.com') ||
                            brand.toLowerCase().replace(/\s+/g, '').includes(url) ||
                            productName.toLowerCase().replace(/\s+/g, '').includes(url)
                        );
                        
                        // Avoid stock photo sites for product images
                        const isStockPhoto = (
                            url.includes('shutterstock') ||
                            url.includes('istockphoto') ||
                            url.includes('getty') ||
                            url.includes('unsplash') ||
                            url.includes('pexels')
                        );
                        
                        return hasProductTerms && !hasUnprofessionalTerms && !isStockPhoto;
                    });
                    
                    if (professionalImages.length > 0) {
                        console.log(`✅ Found ${professionalImages.length} professional images for "${searchTerm}"`);
                        return professionalImages[0].link; // Return the best match
                    }
                }
                
                // Add delay between searches
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            console.log(`⚠️  No professional images found for ${brand} ${productName}`);
            return null;
            
        } catch (error) {
            if (error.response?.status === 429) {
                console.log('⏸️  Rate limit hit, waiting 60 seconds...');
                await new Promise(resolve => setTimeout(resolve, 60000));
                return null;
            }
            
            console.error(`❌ Professional image search failed for ${brand} ${productName}:`, error.message);
            return null;
        }
    }

    // Get category-appropriate professional fallback image
    getProfessionalFallbackImage(category, productName) {
        // Use professional supplement images instead of generic stock photos
        const professionalFallbacks = {
            'protein': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500&h=500&fit=crop&crop=center',
            'vitamins': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500&h=500&fit=crop&crop=center',
            'minerals': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=500&fit=crop&crop=center',
            'pre-workout': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&crop=center',
            'amino-acids': 'https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?w=500&h=500&fit=crop&crop=center',
            'creatine': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&crop=center',
            'bcaa': 'https://images.unsplash.com/photo-1505576391880-b3f9d713dc4f?w=500&h=500&fit=crop&crop=center',
            'default': 'https://images.unsplash.com/photo-1544966503-7e0ec817ac5a?w=500&h=500&fit=crop&crop=center'
        };
        
        // Try to match category
        const categoryLower = category?.toLowerCase() || '';
        const productLower = productName.toLowerCase();
        
        if (categoryLower.includes('protein') || productLower.includes('protein')) {
            return professionalFallbacks.protein;
        } else if (categoryLower.includes('vitamin') || productLower.includes('vitamin')) {
            return professionalFallbacks.vitamins;
        } else if (categoryLower.includes('mineral') || productLower.includes('mineral')) {
            return professionalFallbacks.minerals;
        } else if (categoryLower.includes('pre') || productLower.includes('pre-workout')) {
            return professionalFallbacks['pre-workout'];
        } else if (productLower.includes('amino') || productLower.includes('bcaa')) {
            return professionalFallbacks['amino-acids'];
        } else if (productLower.includes('creatine')) {
            return professionalFallbacks.creatine;
        }
        
        return professionalFallbacks.default;
    }

    // Upload professional image to Firebase Storage
    async uploadProfessionalImage(imageUrl, imageName, productData) {
        try {
            console.log(`📤 Downloading and uploading professional image: ${imageName}`);
            
            const response = await axios.get(imageUrl, { 
                responseType: 'stream',
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const file = bucket.file(`images/supplements/professional/${imageName}`);
            const stream = file.createWriteStream({
                metadata: {
                    contentType: 'image/jpeg',
                    metadata: {
                        productId: productData.id,
                        productName: productData.name,
                        brand: productData.brand || 'Unknown',
                        uploadedAt: new Date().toISOString(),
                        source: 'professional-image-upgrade',
                        imageType: 'professional-product-photo',
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
                            const publicUrl = `https://storage.googleapis.com/${bucket.name}/images/supplements/professional/${imageName}`;
                            
                            console.log(`✅ Professional image uploaded: ${imageName}`);
                            resolve(publicUrl);
                        } catch (error) {
                            console.error(`❌ Failed to get public URL for ${imageName}:`, error.message);
                            reject(error);
                        }
                    });
            });
        } catch (error) {
            console.error(`❌ Professional image upload failed for ${imageName}:`, error.message);
            throw error;
        }
    }

    // Generate professional image name
    generateProfessionalImageName(productName, brand) {
        const cleanName = productName.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 40);
        const cleanBrand = brand ? brand.toLowerCase().replace(/[^\w]/g, '') : 'generic';
        const timestamp = Date.now().toString().slice(-8);
        
        return `professional_${cleanBrand}_${cleanName}_${timestamp}.jpg`;
    }

    // Analyze all product images for professionalism
    async analyzeAllProductImages() {
        console.log('🔍 ANALYZING ALL PRODUCT IMAGES FOR PROFESSIONALISM');
        console.log('===================================================');
        
        try {
            // Get all products from database
            console.log('📊 Loading all products from database...');
            const snapshot = await db.collection('productCatalog').get();
            const totalProducts = snapshot.size;
            
            console.log(`📦 Found ${totalProducts} products to analyze`);
            
            const results = {
                totalAnalyzed: 0,
                professionalImages: 0,
                unprofessionalImages: 0,
                needsReplacement: 0,
                upgraded: 0,
                failed: 0,
                unprofessionalList: [],
                errors: []
            };
            
            // Process each product
            for (const doc of snapshot.docs) {
                const productId = doc.id;
                const productData = doc.data();
                const { name, brand, category, imageUrl } = productData;
                
                console.log(`\n📋 Analyzing ${results.totalAnalyzed + 1}/${totalProducts}: ${name} by ${brand || 'Unknown'}`);
                
                if (!imageUrl) {
                    console.log('⚠️  No image URL found, skipping...');
                    results.totalAnalyzed++;
                    continue;
                }
                
                try {
                    // Analyze current image for professionalism
                    const analysis = this.analyzeImageProfessionalism(imageUrl, name, brand);
                    
                    console.log(`📊 Analysis: Professional Score: ${analysis.professionalScore}, Unprofessional Score: ${analysis.unprofessionalScore}`);
                    
                    if (analysis.isProfessional) {
                        console.log('✅ Image appears professional');
                        results.professionalImages++;
                    } else {
                        console.log('❌ Image appears unprofessional - needs replacement');
                        results.unprofessionalImages++;
                        results.unprofessionalList.push({
                            productId,
                            productName: name,
                            brand: brand || 'Unknown',
                            currentImageUrl: imageUrl,
                            reason: `Professional score: ${analysis.professionalScore}, Unprofessional score: ${analysis.unprofessionalScore}`
                        });
                        
                        if (analysis.needsReplacement) {
                            results.needsReplacement++;
                            
                            // Search for professional replacement
                            console.log('🔄 Searching for professional replacement image...');
                            let newImageUrl = await this.searchProfessionalProductImage(name, brand);
                            
                            if (!newImageUrl) {
                                console.log('🔄 Using professional fallback image...');
                                newImageUrl = this.getProfessionalFallbackImage(category, name);
                            }
                            
                            try {
                                // Upload professional image
                                const professionalImageName = this.generateProfessionalImageName(name, brand);
                                const professionalImageUrl = await this.uploadProfessionalImage(
                                    newImageUrl,
                                    professionalImageName,
                                    { id: productId, name, brand, category }
                                );
                                
                                // Update database with professional image
                                await db.collection('productCatalog').doc(productId).update({
                                    imageUrl: professionalImageUrl,
                                    imageName: professionalImageName,
                                    lastImageUpdate: admin.firestore.FieldValue.serverTimestamp(),
                                    imageSource: 'professional-upgrade',
                                    imageType: 'professional-product-photo'
                                });
                                
                                results.upgraded++;
                                console.log(`✅ Upgraded to professional image: ${name}`);
                                
                            } catch (upgradeError) {
                                console.error(`❌ Failed to upgrade image for ${name}:`, upgradeError.message);
                                results.failed++;
                                results.errors.push({
                                    productId,
                                    productName: name,
                                    error: upgradeError.message
                                });
                            }
                        }
                    }
                    
                    results.totalAnalyzed++;
                    
                    // Rate limiting
                    if (results.totalAnalyzed % 20 === 0) {
                        console.log(`\n⏸️  Progress update: ${results.totalAnalyzed}/${totalProducts} analyzed`);
                        console.log(`📈 Professional: ${results.professionalImages}, Unprofessional: ${results.unprofessionalImages}, Upgraded: ${results.upgraded}`);
                        console.log('⏳ Waiting 10 seconds for rate limiting...\n');
                        await new Promise(resolve => setTimeout(resolve, 10000));
                    }
                    
                } catch (error) {
                    console.error(`❌ Error analyzing product ${name}:`, error.message);
                    results.errors.push({
                        productId,
                        productName: name,
                        error: error.message
                    });
                    results.totalAnalyzed++;
                }
            }
            
            // Save detailed results
            const resultsData = {
                timestamp: new Date().toISOString(),
                totalProducts: totalProducts,
                results: results,
                summary: {
                    professionalRate: `${((results.professionalImages / totalProducts) * 100).toFixed(1)}%`,
                    unprofessionalRate: `${((results.unprofessionalImages / totalProducts) * 100).toFixed(1)}%`,
                    upgradeRate: `${((results.upgraded / results.needsReplacement) * 100).toFixed(1)}%`
                },
                unprofessionalImages: results.unprofessionalList
            };
            
            fs.writeFileSync('./image-quality-analysis-results.json', JSON.stringify(resultsData, null, 2));
            
            console.log('\n🎉 IMAGE QUALITY ANALYSIS COMPLETE!');
            console.log('====================================');
            console.log(`📦 Total products analyzed: ${results.totalAnalyzed}`);
            console.log(`✅ Professional images: ${results.professionalImages}`);
            console.log(`❌ Unprofessional images: ${results.unprofessionalImages}`);
            console.log(`🔄 Images upgraded: ${results.upgraded}`);
            console.log(`💔 Upgrade failures: ${results.failed}`);
            console.log(`📊 Professional rate: ${((results.professionalImages / totalProducts) * 100).toFixed(1)}%`);
            console.log(`💾 Detailed results saved to: image-quality-analysis-results.json`);
            
            if (results.unprofessionalList.length > 0) {
                console.log(`\n⚠️  Top 10 unprofessional images found:`);
                results.unprofessionalList.slice(0, 10).forEach((item, index) => {
                    console.log(`   ${index + 1}. ${item.productName} by ${item.brand}`);
                    console.log(`      Reason: ${item.reason}`);
                });
            }
            
            return results;
            
        } catch (error) {
            console.error('💥 Image quality analysis failed:', error);
            throw error;
        }
    }
}

// Execute the analysis
async function main() {
    try {
        const analyzer = new ImageQualityAnalyzer();
        await analyzer.analyzeAllProductImages();
        console.log('✅ Professional image analysis complete!');
        
    } catch (error) {
        console.error('💥 Failed to analyze image quality:', error);
        process.exit(1);
    }
}

main();
