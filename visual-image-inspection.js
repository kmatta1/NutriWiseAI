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

class VisualImageInspector {
    constructor() {
        this.googleApiKey = process.env.GOOGLE_API_KEY;
        this.googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
        this.sampleSize = 50; // Check 50 random images for manual inspection
        this.inspectedImages = [];
        this.suspiciousImages = [];
        this.downloadFolder = './image-samples/';
        
        // Ensure download folder exists
        if (!fs.existsSync(this.downloadFolder)) {
            fs.mkdirSync(this.downloadFolder, { recursive: true });
        }
    }

    // Download and save an image for manual inspection
    async downloadImageSample(imageUrl, imageName, productInfo) {
        try {
            console.log(`📥 Downloading sample: ${imageName}`);
            
            const response = await axios.get(imageUrl, {
                responseType: 'stream',
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const filename = `${imageName.replace(/[^\w\-_\.]/g, '_')}.jpg`;
            const filepath = path.join(this.downloadFolder, filename);
            
            const writer = fs.createWriteStream(filepath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`✅ Downloaded: ${filename}`);
                    resolve({
                        filename,
                        filepath,
                        productInfo,
                        imageUrl
                    });
                });
                writer.on('error', reject);
            });

        } catch (error) {
            console.error(`❌ Failed to download ${imageName}:`, error.message);
            return null;
        }
    }

    // Analyze image URL for potential red flags
    analyzeImageUrl(imageUrl, productName, brand) {
        const urlLower = imageUrl.toLowerCase();
        const suspiciousIndicators = [];
        const positiveIndicators = [];
        
        // Check for suspicious patterns
        if (urlLower.includes('lifestyle') || urlLower.includes('holding') || urlLower.includes('person')) {
            suspiciousIndicators.push('URL contains lifestyle/person keywords');
        }
        
        if (urlLower.includes('amazon') || urlLower.includes('ebay') || urlLower.includes('walmart')) {
            suspiciousIndicators.push('Retail site URL - may be lifestyle shots');
        }
        
        if (urlLower.includes('unsplash') || urlLower.includes('pexels') || urlLower.includes('shutterstock')) {
            suspiciousIndicators.push('Stock photo site - may not be actual product');
        }
        
        if (urlLower.includes('review') || urlLower.includes('unboxing') || urlLower.includes('youtube')) {
            suspiciousIndicators.push('Review/unboxing content - likely unprofessional');
        }
        
        // Check for positive indicators
        if (urlLower.includes('supplement') || urlLower.includes('bottle') || urlLower.includes('container')) {
            positiveIndicators.push('URL indicates supplement product');
        }
        
        if (urlLower.includes('storage.googleapis.com') && urlLower.includes('supplements')) {
            positiveIndicators.push('Our Firebase storage - likely professional');
        }
        
        if (urlLower.includes('professional') || urlLower.includes('studio') || urlLower.includes('white-background')) {
            positiveIndicators.push('Professional photography indicators');
        }
        
        const suspicionScore = suspiciousIndicators.length;
        const professionalScore = positiveIndicators.length;
        
        return {
            suspiciousIndicators,
            positiveIndicators,
            suspicionScore,
            professionalScore,
            needsManualReview: suspicionScore > 0 || professionalScore === 0
        };
    }

    // Search for better professional images if needed
    async findBetterProductImage(productName, brand) {
        try {
            const searchTerms = [
                `${brand} ${productName} supplement bottle product photography white background`,
                `${brand} ${productName} official product image isolated`,
                `${productName} supplement container professional photography`,
                `${brand} ${productName} product shot studio lighting`
            ];

            for (const searchTerm of searchTerms) {
                console.log(`🔍 Searching for better image: "${searchTerm}"`);
                
                const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${this.googleApiKey}&cx=${this.googleSearchEngineId}&q=${encodeURIComponent(searchTerm)}&searchType=image&imgType=photo&imgSize=medium&safe=active&num=5&imgColorType=color`;
                
                const response = await axios.get(searchUrl, { timeout: 10000 });
                
                if (response.data.items && response.data.items.length > 0) {
                    // Look for professional product images
                    const professionalImages = response.data.items.filter(item => {
                        const url = item.link.toLowerCase();
                        const title = item.title.toLowerCase();
                        
                        // Must be from reputable supplement retailers or manufacturers
                        const isReputableSource = (
                            url.includes('iherb.com') ||
                            url.includes('vitacost.com') ||
                            url.includes('bodybuilding.com') ||
                            url.includes('supplementwarehouse.com') ||
                            url.includes('a1supplements.com') ||
                            url.includes('amazon.com') && title.includes('bottle') ||
                            url.includes(brand.toLowerCase().replace(/\s+/g, ''))
                        );
                        
                        // Must indicate it's a product image
                        const isProductImage = (
                            title.includes('supplement') ||
                            title.includes('bottle') ||
                            title.includes('container') ||
                            title.includes('capsule') ||
                            title.includes('tablet') ||
                            title.includes(productName.toLowerCase())
                        );
                        
                        // Should not be lifestyle/review content
                        const isNotLifestyle = !(
                            title.includes('holding') ||
                            title.includes('review') ||
                            title.includes('unboxing') ||
                            title.includes('workout') ||
                            title.includes('gym') ||
                            url.includes('youtube') ||
                            url.includes('instagram')
                        );
                        
                        return isReputableSource && isProductImage && isNotLifestyle;
                    });
                    
                    if (professionalImages.length > 0) {
                        console.log(`✅ Found professional replacement for "${searchTerm}"`);
                        return professionalImages[0].link;
                    }
                }
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
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
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 40);
        const cleanBrand = brand ? brand.toLowerCase().replace(/[^\w]/g, '') : 'generic';
        const timestamp = Date.now().toString().slice(-8);
        
        return `professional_${cleanBrand}_${cleanName}_${timestamp}.jpg`;
    }

    // Upload professional image to Firebase Storage
    async uploadProfessionalImage(imageUrl, imageName, productData) {
        try {
            console.log(`📤 Uploading professional replacement: ${imageName}`);
            
            const response = await axios.get(imageUrl, { 
                responseType: 'stream',
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
                        source: 'visual-inspection-upgrade',
                        imageType: 'professional-product-photo',
                        originalUrl: imageUrl,
                        upgradedBy: 'visual-quality-inspector'
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
                            console.log(`✅ Professional replacement uploaded: ${imageName}`);
                            resolve(publicUrl);
                        } catch (error) {
                            reject(error);
                        }
                    });
            });
        } catch (error) {
            console.error(`❌ Professional upload failed for ${imageName}:`, error.message);
            throw error;
        }
    }

    // Perform visual inspection on a sample of images
    async performVisualInspection() {
        console.log('👁️  PERFORMING VISUAL INSPECTION OF PRODUCT IMAGES');
        console.log('==================================================');
        
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
            
            // Select random sample for inspection
            const shuffled = allProducts.sort(() => 0.5 - Math.random());
            const sampleProducts = shuffled.slice(0, this.sampleSize);
            
            console.log(`🎯 Selected ${sampleProducts.length} products for visual inspection`);
            
            const results = {
                totalSampled: sampleProducts.length,
                downloaded: 0,
                suspicious: 0,
                needsReplacement: 0,
                upgraded: 0,
                failed: 0,
                suspiciousList: [],
                downloadedSamples: [],
                errors: []
            };
            
            // Analyze each sample
            for (let i = 0; i < sampleProducts.length; i++) {
                const product = sampleProducts[i];
                const { id, name, brand, category, imageUrl } = product;
                
                console.log(`\n📋 Inspecting ${i + 1}/${sampleProducts.length}: ${name} by ${brand || 'Unknown'}`);
                
                try {
                    // Analyze URL for red flags
                    const urlAnalysis = this.analyzeImageUrl(imageUrl, name, brand);
                    
                    console.log(`📊 URL Analysis: ${urlAnalysis.suspiciousIndicators.length} suspicious, ${urlAnalysis.positiveIndicators.length} positive indicators`);
                    
                    if (urlAnalysis.suspiciousIndicators.length > 0) {
                        console.log(`⚠️  Suspicious indicators: ${urlAnalysis.suspiciousIndicators.join(', ')}`);
                        results.suspicious++;
                        results.suspiciousList.push({
                            productId: id,
                            productName: name,
                            brand: brand || 'Unknown',
                            imageUrl,
                            suspiciousIndicators: urlAnalysis.suspiciousIndicators,
                            positiveIndicators: urlAnalysis.positiveIndicators
                        });
                    }
                    
                    // Download sample for manual inspection
                    const imageName = `sample_${i + 1}_${name.replace(/[^\w]/g, '_')}_${brand?.replace(/[^\w]/g, '_') || 'unknown'}`;
                    const downloadResult = await this.downloadImageSample(imageUrl, imageName, {
                        id, name, brand, category
                    });
                    
                    if (downloadResult) {
                        results.downloaded++;
                        results.downloadedSamples.push(downloadResult);
                    }
                    
                    // If suspicious, try to find better image
                    if (urlAnalysis.needsManualReview && urlAnalysis.suspiciousIndicators.length >= 2) {
                        console.log('🔄 Searching for professional replacement...');
                        results.needsReplacement++;
                        
                        const betterImageUrl = await this.findBetterProductImage(name, brand);
                        
                        if (betterImageUrl) {
                            try {
                                const professionalImageName = this.generateProfessionalImageName(name, brand);
                                const professionalImageUrl = await this.uploadProfessionalImage(
                                    betterImageUrl,
                                    professionalImageName,
                                    { id, name, brand, category }
                                );
                                
                                // Update database
                                await db.collection('productCatalog').doc(id).update({
                                    imageUrl: professionalImageUrl,
                                    imageName: professionalImageName,
                                    lastImageUpdate: admin.firestore.FieldValue.serverTimestamp(),
                                    imageSource: 'visual-inspection-upgrade',
                                    previousImageUrl: imageUrl
                                });
                                
                                results.upgraded++;
                                console.log(`✅ Upgraded image for: ${name}`);
                                
                            } catch (upgradeError) {
                                console.error(`❌ Failed to upgrade image for ${name}:`, upgradeError.message);
                                results.failed++;
                            }
                        }
                    }
                    
                    // Rate limiting
                    if ((i + 1) % 10 === 0) {
                        console.log(`\n⏸️  Progress: ${i + 1}/${sampleProducts.length} inspected`);
                        console.log(`📈 Downloaded: ${results.downloaded}, Suspicious: ${results.suspicious}, Upgraded: ${results.upgraded}`);
                        console.log('⏳ Waiting 5 seconds...\n');
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                    
                } catch (error) {
                    console.error(`❌ Error inspecting ${name}:`, error.message);
                    results.errors.push({
                        productId: id,
                        productName: name,
                        error: error.message
                    });
                }
            }
            
            // Generate inspection report
            const inspectionReport = {
                timestamp: new Date().toISOString(),
                sampleSize: this.sampleSize,
                results: results,
                downloadFolder: this.downloadFolder,
                instructions: {
                    manualReview: `Please manually review the downloaded images in ${this.downloadFolder}`,
                    criteria: [
                        'Image shows ONLY the supplement bottle/container',
                        'Clean, white or neutral background',
                        'No hands, people, or lifestyle elements',
                        'Product label is clearly visible and readable',
                        'Professional lighting and composition',
                        'High resolution and sharp focus'
                    ],
                    action: 'If any images don\'t meet criteria, run the replacement script for those specific products'
                }
            };
            
            fs.writeFileSync('./visual-inspection-report.json', JSON.stringify(inspectionReport, null, 2));
            
            console.log('\n👁️  VISUAL INSPECTION COMPLETE!');
            console.log('===============================');
            console.log(`🎯 Products sampled: ${results.totalSampled}`);
            console.log(`📥 Images downloaded for review: ${results.downloaded}`);
            console.log(`⚠️  Suspicious images found: ${results.suspicious}`);
            console.log(`🔄 Images automatically upgraded: ${results.upgraded}`);
            console.log(`❌ Upgrade failures: ${results.failed}`);
            console.log(`📁 Sample images saved to: ${this.downloadFolder}`);
            console.log(`📄 Full report saved to: visual-inspection-report.json`);
            
            if (results.suspicious > 0) {
                console.log(`\n⚠️  ATTENTION: ${results.suspicious} potentially unprofessional images detected!`);
                console.log('📋 Please manually review the downloaded samples and check:');
                console.log('   • Are there any hands holding products?');
                console.log('   • Are there any lifestyle/gym shots?');
                console.log('   • Are there any back-of-package images?');
                console.log('   • Are backgrounds clean and professional?');
                console.log('   • Are product labels clearly visible?');
            } else {
                console.log('\n✅ No obviously suspicious images detected in sample!');
                console.log('📋 Still recommend manual review of downloaded samples');
            }
            
            return inspectionReport;
            
        } catch (error) {
            console.error('💥 Visual inspection failed:', error);
            throw error;
        }
    }
}

// Execute the visual inspection
async function main() {
    try {
        const inspector = new VisualImageInspector();
        await inspector.performVisualInspection();
        console.log('✅ Visual inspection complete! Please review the downloaded samples.');
        
    } catch (error) {
        console.error('💥 Failed to perform visual inspection:', error);
        process.exit(1);
    }
}

main();
