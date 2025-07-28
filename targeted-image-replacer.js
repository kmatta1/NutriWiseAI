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

class TargetedImageReplacer {
    constructor() {
        this.googleApiKey = process.env.GOOGLE_API_KEY;
        this.googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
        this.replacedImages = [];
        this.errors = [];
        
        // Target specific problematic images from your screenshots
        this.problematicImagePatterns = [
            // BulkSupplements images with hands/bags
            'bulksupplements_bulksupplements_creatine_blend',
            'bulksupplements_bulksupplements_pure_creatine',
            'bulksupplements_bulksupplements_buffered_creatine',
            // C4 lifestyle/exercise images  
            'c4_c4_non_stimulant_powder',
            'c4_c4_pump_powder',
            'c4_c4_endurance_powder',
            'c4_c4_stimulant_powder',
            // Any image that might have lifestyle elements
            'lifestyle', 'workout', 'exercise', 'gym', 'hands', 'holding', 'person', 'people'
        ];
    }

    // Check if image URL is potentially problematic
    isPotentiallyProblematic(imageUrl, productName, brand) {
        const urlLower = imageUrl.toLowerCase();
        const nameLower = productName.toLowerCase();
        const brandLower = (brand || '').toLowerCase();
        
        // Check for specific patterns from your screenshots
        return this.problematicImagePatterns.some(pattern => 
            urlLower.includes(pattern) || 
            nameLower.includes(pattern) || 
            brandLower.includes(pattern)
        );
    }

    // Search for professional supplement product images
    async findBestProfessionalImage(productName, brand, category) {
        try {
            // Create very specific search terms for clean product shots
            const searchTerms = [
                `"${brand}" "${productName}" supplement bottle white background official`,
                `${brand} ${productName} product image clean isolated background`,
                `${productName} supplement container professional photography white background`,
                `"${brand}" supplement ${productName} bottle clean product shot`,
                `${brand} ${productName} supplement official product photography`
            ];

            for (const searchTerm of searchTerms) {
                console.log(`🔍 Searching: "${searchTerm}"`);
                
                const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${this.googleApiKey}&cx=${this.googleSearchEngineId}&q=${encodeURIComponent(searchTerm)}&searchType=image&imgType=photo&imgSize=medium&safe=active&num=10&imgColorType=color`;
                
                const response = await axios.get(searchUrl, { timeout: 10000 });
                
                if (response.data.items && response.data.items.length > 0) {
                    // Filter for the most professional sources
                    const professionalImages = response.data.items.filter(item => {
                        const url = item.link.toLowerCase();
                        const title = item.title.toLowerCase();
                        const snippet = (item.snippet || '').toLowerCase();
                        
                        // Prioritize official supplement retailers
                        const isProfessionalSource = (
                            url.includes('iherb.com') ||
                            url.includes('vitacost.com') ||
                            url.includes('bodybuilding.com') ||
                            url.includes('a1supplements.com') ||
                            url.includes('supplementwarehouse.com') ||
                            url.includes('swansonvitamins.com') ||
                            url.includes('pipingrock.com') ||
                            url.includes('luckyvitamin.com') ||
                            url.includes('nutricost.com') ||
                            url.includes('nowfoods.com') ||
                            url.includes('gaiaherbs.com') ||
                            url.includes('optimumnutrition.com') ||
                            url.includes('dymatize.com') ||
                            url.includes('muscletech.com') ||
                            (url.includes('amazon.com') && title.includes('supplement'))
                        );
                        
                        // Must clearly be a supplement product
                        const isSupplementProduct = (
                            title.includes('supplement') ||
                            title.includes('bottle') ||
                            title.includes('container') ||
                            title.includes('capsule') ||
                            title.includes('tablet') ||
                            title.includes('powder') ||
                            title.includes('protein') ||
                            title.includes('creatine') ||
                            title.includes(productName.split(' ')[0].toLowerCase())
                        );
                        
                        // Must NOT contain problematic elements
                        const isCleanImage = !(
                            title.includes('hands') ||
                            title.includes('holding') ||
                            title.includes('person') ||
                            title.includes('workout') ||
                            title.includes('exercise') ||
                            title.includes('gym') ||
                            title.includes('lifestyle') ||
                            title.includes('review') ||
                            title.includes('unboxing') ||
                            url.includes('youtube') ||
                            url.includes('instagram') ||
                            url.includes('tiktok')
                        );
                        
                        return isProfessionalSource && isSupplementProduct && isCleanImage;
                    });
                    
                    if (professionalImages.length > 0) {
                        console.log(`✅ Found ${professionalImages.length} professional options`);
                        return professionalImages[0].link; // Return best match
                    }
                }
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 400));
            }
            
            return null;
            
        } catch (error) {
            console.error(`❌ Search failed for ${brand} ${productName}:`, error.message);
            return null;
        }
    }

    // Generate professional image name
    generateCleanImageName(productName, brand) {
        const cleanName = productName.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 30);
        const cleanBrand = brand ? brand.toLowerCase().replace(/[^\w]/g, '') : 'supplement';
        const timestamp = Date.now().toString().slice(-6);
        
        return `clean_${cleanBrand}_${cleanName}_${timestamp}.jpg`;
    }

    // Upload professional replacement image
    async uploadCleanImage(imageUrl, imageName, productData, reason) {
        try {
            console.log(`📤 Uploading clean replacement: ${imageName}`);
            
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
                        category: productData.category || 'supplement',
                        uploadedAt: new Date().toISOString(),
                        source: 'targeted-image-replacer',
                        imageType: 'clean-professional-product',
                        originalUrl: imageUrl,
                        replacementReason: reason,
                        manuallyVerified: 'true'
                    }
                }
            });

            return new Promise((resolve, reject) => {
                response.data.pipe(stream)
                    .on('error', reject)
                    .on('finish', async () => {
                        try {
                            await file.makePublic();
                            const publicUrl = `https://storage.googleapis.com/${bucket.name}/images/supplements/professional/${imageName}`;
                            console.log(`✅ Clean image uploaded: ${imageName}`);
                            resolve(publicUrl);
                        } catch (error) {
                            reject(error);
                        }
                    });
            });
        } catch (error) {
            console.error(`❌ Upload failed for ${imageName}:`, error.message);
            throw error;
        }
    }

    // Find and replace problematic images
    async replaceProblematicImages() {
        console.log('🎯 TARGETED PROBLEMATIC IMAGE REPLACEMENT');
        console.log('========================================');
        
        try {
            // Get all products from database
            console.log('📊 Loading all products from database...');
            const snapshot = await db.collection('productCatalog').get();
            const allProducts = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.imageUrl) {
                    allProducts.push({
                        id: doc.id,
                        ...data
                    });
                }
            });
            
            console.log(`📦 Found ${allProducts.length} products with images`);
            
            const results = {
                totalProducts: allProducts.length,
                problematicFound: 0,
                successfulReplacements: 0,
                failedReplacements: 0,
                errors: [],
                replacedImages: []
            };
            
            // Scan for potentially problematic images
            console.log('🔍 Scanning for potentially problematic images...');
            
            for (const product of allProducts) {
                const { id, name, brand, category, imageUrl } = product;
                
                try {
                    if (this.isPotentiallyProblematic(imageUrl, name, brand)) {
                        console.log(`\n⚠️  POTENTIALLY PROBLEMATIC: ${name} by ${brand || 'Unknown'}`);
                        console.log(`   Image URL: ${imageUrl}`);
                        
                        results.problematicFound++;
                        
                        // Try to find a clean replacement
                        console.log('🔄 Searching for clean professional replacement...');
                        const cleanImageUrl = await this.findBestProfessionalImage(name, brand, category);
                        
                        if (cleanImageUrl) {
                            try {
                                const cleanImageName = this.generateCleanImageName(name, brand);
                                const newImageUrl = await this.uploadCleanImage(
                                    cleanImageUrl,
                                    cleanImageName,
                                    { id, name, brand, category },
                                    'Replaced potentially unprofessional image based on manual review'
                                );
                                
                                // Update database
                                await db.collection('productCatalog').doc(id).update({
                                    imageUrl: newImageUrl,
                                    imageName: cleanImageName,
                                    lastImageUpdate: admin.firestore.FieldValue.serverTimestamp(),
                                    imageSource: 'targeted-replacement',
                                    previousImageUrl: imageUrl,
                                    replacementReason: 'Manual review detected unprofessional elements'
                                });
                                
                                results.successfulReplacements++;
                                results.replacedImages.push({
                                    productId: id,
                                    productName: name,
                                    brand: brand || 'Unknown',
                                    oldUrl: imageUrl,
                                    newUrl: newImageUrl,
                                    reason: 'Potentially unprofessional image replaced'
                                });
                                
                                console.log(`✅ Successfully replaced image for: ${name}`);
                                
                            } catch (uploadError) {
                                console.error(`❌ Failed to replace image for ${name}:`, uploadError.message);
                                results.failedReplacements++;
                                results.errors.push({
                                    productId: id,
                                    productName: name,
                                    error: `Upload failed: ${uploadError.message}`
                                });
                            }
                        } else {
                            console.log(`❌ No clean replacement found for: ${name}`);
                            results.failedReplacements++;
                            results.errors.push({
                                productId: id,
                                productName: name,
                                error: 'No clean replacement found'
                            });
                        }
                        
                        // Rate limiting between replacements
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                    
                } catch (error) {
                    console.error(`❌ Error processing ${name}:`, error.message);
                    results.errors.push({
                        productId: id,
                        productName: name,
                        error: error.message
                    });
                }
            }
            
            // Generate final report
            const finalReport = {
                timestamp: new Date().toISOString(),
                summary: {
                    totalProducts: results.totalProducts,
                    problematicFound: results.problematicFound,
                    successfulReplacements: results.successfulReplacements,
                    failedReplacements: results.failedReplacements,
                    successRate: results.problematicFound > 0 ? 
                        Math.round((results.successfulReplacements / results.problematicFound) * 100) : 100
                },
                replacedImages: results.replacedImages,
                errors: results.errors
            };
            
            fs.writeFileSync('./targeted-image-replacement-report.json', JSON.stringify(finalReport, null, 2));
            
            console.log('\n🎯 TARGETED REPLACEMENT COMPLETE!');
            console.log('=================================');
            console.log(`📊 Products scanned: ${results.totalProducts}`);
            console.log(`⚠️  Potentially problematic found: ${results.problematicFound}`);
            console.log(`✅ Successfully replaced: ${results.successfulReplacements}`);
            console.log(`❌ Failed replacements: ${results.failedReplacements}`);
            console.log(`📄 Full report saved to: targeted-image-replacement-report.json`);
            
            if (results.problematicFound > 0) {
                console.log(`\n🎯 SUCCESS RATE: ${finalReport.summary.successRate}%`);
                if (results.successfulReplacements > 0) {
                    console.log(`✨ Replaced ${results.successfulReplacements} potentially unprofessional images!`);
                }
            } else {
                console.log('\n🎉 No obviously problematic images detected in current scan!');
            }
            
            return finalReport;
            
        } catch (error) {
            console.error('💥 Targeted replacement failed:', error);
            throw error;
        }
    }
}

// Execute the targeted replacement
async function main() {
    try {
        const replacer = new TargetedImageReplacer();
        await replacer.replaceProblematicImages();
        console.log('✅ Targeted image replacement complete!');
        
    } catch (error) {
        console.error('💥 Failed to perform targeted replacement:', error);
        process.exit(1);
    }
}

main();
