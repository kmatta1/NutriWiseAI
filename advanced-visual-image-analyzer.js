require('dotenv').config();
const admin = require('firebase-admin');
const axios = require('axios');
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

class AdvancedVisualImageAnalyzer {
    constructor() {
        this.googleApiKey = process.env.GOOGLE_API_KEY;
        this.googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
        this.problemImages = [];
        this.fixedImages = [];
        this.errors = [];
        this.batchSize = 20; // Process in smaller batches
        
        // Problematic image indicators (based on your screenshots)
        this.problematicPatterns = [
            // Images with hands/people
            'hands', 'holding', 'person', 'people', 'lifestyle', 'workout', 'exercise', 'gym',
            'yoga', 'fitness', 'athlete', 'training', 'bodybuilder', 'model',
            // Back of package images
            'back', 'label', 'nutrition', 'facts', 'ingredients', 'barcode', 'upc',
            // Non-product focus
            'unboxing', 'review', 'comparison', 'before', 'after', 'testimonial',
            // Lifestyle contexts
            'kitchen', 'bedroom', 'bathroom', 'counter', 'shelf', 'cabinet',
            'breakfast', 'meal', 'smoothie', 'shake', 'mixing'
        ];
    }

    // Analyze image URL and filename for red flags
    analyzeImageMetadata(imageUrl, productName, brand) {
        const urlLower = imageUrl.toLowerCase();
        const redFlags = [];
        let suspicionScore = 0;

        // Check for problematic patterns in URL
        this.problematicPatterns.forEach(pattern => {
            if (urlLower.includes(pattern)) {
                redFlags.push(`URL contains "${pattern}"`);
                suspicionScore += 2;
            }
        });

        // Check for non-professional sources
        if (urlLower.includes('amazon.com') && !urlLower.includes('product')) {
            redFlags.push('Amazon URL without product indicator');
            suspicionScore += 1;
        }

        if (urlLower.includes('youtube') || urlLower.includes('instagram') || urlLower.includes('tiktok')) {
            redFlags.push('Social media source');
            suspicionScore += 3;
        }

        if (urlLower.includes('review') || urlLower.includes('unboxing')) {
            redFlags.push('Review/unboxing content');
            suspicionScore += 3;
        }

        // Images from our Firebase storage are more likely to be professional
        if (urlLower.includes('storage.googleapis.com') && urlLower.includes('nutriwise')) {
            suspicionScore = Math.max(0, suspicionScore - 2);
        }

        return {
            redFlags,
            suspicionScore,
            needsReplacement: suspicionScore >= 2
        };
    }

    // Search for professional supplement product images
    async findProfessionalSupplementImage(productName, brand, category) {
        try {
            // Create highly specific search terms for professional product images
            const searchTerms = [
                `${brand} ${productName} supplement bottle white background product photography`,
                `${brand} ${productName} official product image isolated clean background`,
                `${productName} supplement container professional studio photography`,
                `${brand} ${productName} bottle capsules tablets clean product shot`,
                `"${brand}" "${productName}" supplement product image white background`
            ];

            for (const searchTerm of searchTerms) {
                console.log(`🔍 Searching: "${searchTerm}"`);
                
                const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${this.googleApiKey}&cx=${this.googleSearchEngineId}&q=${encodeURIComponent(searchTerm)}&searchType=image&imgType=photo&imgSize=medium&safe=active&num=10&imgColorType=color`;
                
                const response = await axios.get(searchUrl, { timeout: 10000 });
                
                if (response.data.items && response.data.items.length > 0) {
                    // Filter for professional product images
                    const professionalImages = response.data.items.filter(item => {
                        const url = item.link.toLowerCase();
                        const title = item.title.toLowerCase();
                        const snippet = (item.snippet || '').toLowerCase();
                        
                        // Must be from reputable supplement sources
                        const isReputableSource = (
                            url.includes('iherb.com') ||
                            url.includes('vitacost.com') ||
                            url.includes('bodybuilding.com') ||
                            url.includes('supplementwarehouse.com') ||
                            url.includes('a1supplements.com') ||
                            url.includes('swansonvitamins.com') ||
                            url.includes('luckyvitamin.com') ||
                            url.includes('pipingrock.com') ||
                            url.includes('puritan.com') ||
                            (url.includes('amazon.com') && (title.includes('bottle') || title.includes('supplement'))) ||
                            url.includes(brand.toLowerCase().replace(/\s+/g, ''))
                        );
                        
                        // Must clearly be a product image
                        const isProductImage = (
                            title.includes('supplement') ||
                            title.includes('bottle') ||
                            title.includes('container') ||
                            title.includes('capsule') ||
                            title.includes('tablet') ||
                            title.includes('powder') ||
                            title.includes(productName.toLowerCase().split(' ')[0]) ||
                            snippet.includes('product')
                        );
                        
                        // Must NOT be lifestyle/problematic content
                        const isNotProblematic = !this.problematicPatterns.some(pattern => 
                            title.includes(pattern) || url.includes(pattern) || snippet.includes(pattern)
                        );
                        
                        // Additional checks for clean product shots
                        const isProfessionalShot = (
                            title.includes('white') ||
                            title.includes('clean') ||
                            title.includes('isolated') ||
                            snippet.includes('white background') ||
                            snippet.includes('product image')
                        );
                        
                        return isReputableSource && isProductImage && isNotProblematic && isProfessionalShot;
                    });
                    
                    if (professionalImages.length > 0) {
                        console.log(`✅ Found ${professionalImages.length} professional options`);
                        // Return the best match (first in filtered results)
                        return professionalImages[0].link;
                    }
                }
                
                // Rate limiting between searches
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            return null;
            
        } catch (error) {
            console.error(`❌ Search failed for ${brand} ${productName}:`, error.message);
            return null;
        }
    }

    // Generate professional image name
    generateProfessionalImageName(productName, brand) {
        const cleanName = productName.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 35);
        const cleanBrand = brand ? brand.toLowerCase().replace(/[^\w]/g, '') : 'supplement';
        const timestamp = Date.now().toString().slice(-6);
        
        return `professional_${cleanBrand}_${cleanName}_${timestamp}.jpg`;
    }

    // Upload professional image to Firebase Storage
    async uploadProfessionalImage(imageUrl, imageName, productData, reason) {
        try {
            console.log(`📤 Uploading professional replacement: ${imageName}`);
            
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
                        source: 'advanced-visual-analyzer',
                        imageType: 'professional-product-photo',
                        originalUrl: imageUrl,
                        replacementReason: reason,
                        upgradedBy: 'visual-content-analyzer'
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
                            console.log(`✅ Professional image uploaded: ${imageName}`);
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

    // Analyze and fix problematic images
    async analyzeAndFixImages() {
        console.log('🕵️  ADVANCED VISUAL IMAGE ANALYSIS STARTING');
        console.log('===========================================');
        
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
                analyzed: 0,
                problematicFound: 0,
                successfulReplacements: 0,
                failedReplacements: 0,
                errors: [],
                problemImages: [],
                fixedImages: []
            };
            
            // Process products in batches
            for (let i = 0; i < allProducts.length; i += this.batchSize) {
                const batch = allProducts.slice(i, i + this.batchSize);
                console.log(`\n📋 Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(allProducts.length / this.batchSize)} (${batch.length} products)`);
                
                for (const product of batch) {
                    const { id, name, brand, category, imageUrl } = product;
                    
                    try {
                        console.log(`\n🔍 Analyzing: ${name} by ${brand || 'Unknown'}`);
                        
                        // Analyze image metadata for red flags
                        const analysis = this.analyzeImageMetadata(imageUrl, name, brand);
                        results.analyzed++;
                        
                        if (analysis.needsReplacement) {
                            console.log(`⚠️  PROBLEMATIC IMAGE DETECTED!`);
                            console.log(`   Red flags: ${analysis.redFlags.join(', ')}`);
                            console.log(`   Suspicion score: ${analysis.suspicionScore}/10`);
                            
                            results.problematicFound++;
                            results.problemImages.push({
                                productId: id,
                                productName: name,
                                brand: brand || 'Unknown',
                                originalUrl: imageUrl,
                                redFlags: analysis.redFlags,
                                suspicionScore: analysis.suspicionScore
                            });
                            
                            // Try to find a professional replacement
                            console.log('🔄 Searching for professional replacement...');
                            const professionalImageUrl = await this.findProfessionalSupplementImage(name, brand, category);
                            
                            if (professionalImageUrl) {
                                try {
                                    const professionalImageName = this.generateProfessionalImageName(name, brand);
                                    const newImageUrl = await this.uploadProfessionalImage(
                                        professionalImageUrl,
                                        professionalImageName,
                                        { id, name, brand, category },
                                        `Replaced unprofessional image: ${analysis.redFlags.join(', ')}`
                                    );
                                    
                                    // Update database
                                    await db.collection('productCatalog').doc(id).update({
                                        imageUrl: newImageUrl,
                                        imageName: professionalImageName,
                                        lastImageUpdate: admin.firestore.FieldValue.serverTimestamp(),
                                        imageSource: 'advanced-visual-analysis',
                                        previousImageUrl: imageUrl,
                                        replacementReason: analysis.redFlags.join(', ')
                                    });
                                    
                                    results.successfulReplacements++;
                                    results.fixedImages.push({
                                        productId: id,
                                        productName: name,
                                        brand: brand || 'Unknown',
                                        oldUrl: imageUrl,
                                        newUrl: newImageUrl,
                                        reason: analysis.redFlags.join(', ')
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
                                console.log(`❌ No professional replacement found for: ${name}`);
                                results.failedReplacements++;
                                results.errors.push({
                                    productId: id,
                                    productName: name,
                                    error: 'No professional replacement found'
                                });
                            }
                        } else {
                            console.log(`✅ Image appears professional`);
                        }
                        
                    } catch (error) {
                        console.error(`❌ Error analyzing ${name}:`, error.message);
                        results.errors.push({
                            productId: id,
                            productName: name,
                            error: error.message
                        });
                    }
                    
                    // Small delay between products
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                
                // Progress update
                console.log(`\n📈 Batch Complete! Progress: ${results.analyzed}/${allProducts.length}`);
                console.log(`   Problematic: ${results.problematicFound}, Fixed: ${results.successfulReplacements}, Failed: ${results.failedReplacements}`);
                
                // Longer delay between batches
                if (i + this.batchSize < allProducts.length) {
                    console.log('⏳ Waiting 10 seconds before next batch...\n');
                    await new Promise(resolve => setTimeout(resolve, 10000));
                }
            }
            
            // Generate final report
            const finalReport = {
                timestamp: new Date().toISOString(),
                summary: {
                    totalProducts: results.totalProducts,
                    analyzed: results.analyzed,
                    problematicFound: results.problematicFound,
                    successfulReplacements: results.successfulReplacements,
                    failedReplacements: results.failedReplacements,
                    successRate: results.problematicFound > 0 ? 
                        Math.round((results.successfulReplacements / results.problematicFound) * 100) : 100
                },
                problemImages: results.problemImages,
                fixedImages: results.fixedImages,
                errors: results.errors
            };
            
            fs.writeFileSync('./advanced-visual-analysis-report.json', JSON.stringify(finalReport, null, 2));
            
            console.log('\n🕵️  ADVANCED VISUAL ANALYSIS COMPLETE!');
            console.log('====================================');
            console.log(`📊 Products analyzed: ${results.analyzed}`);
            console.log(`⚠️  Problematic images found: ${results.problematicFound}`);
            console.log(`✅ Successfully replaced: ${results.successfulReplacements}`);
            console.log(`❌ Failed replacements: ${results.failedReplacements}`);
            console.log(`📄 Full report saved to: advanced-visual-analysis-report.json`);
            
            if (results.problematicFound > 0) {
                console.log(`\n🎯 SUCCESS RATE: ${finalReport.summary.successRate}%`);
                if (results.successfulReplacements > 0) {
                    console.log(`✨ Your app now has ${results.successfulReplacements} more professional product images!`);
                }
            } else {
                console.log('\n🎉 No problematic images detected! Your catalog appears to be professional.');
            }
            
            return finalReport;
            
        } catch (error) {
            console.error('💥 Advanced visual analysis failed:', error);
            throw error;
        }
    }
}

// Execute the advanced visual analysis
async function main() {
    try {
        const analyzer = new AdvancedVisualImageAnalyzer();
        await analyzer.analyzeAndFixImages();
        console.log('✅ Advanced visual analysis complete!');
        
    } catch (error) {
        console.error('💥 Failed to perform advanced visual analysis:', error);
        process.exit(1);
    }
}

main();
