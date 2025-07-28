require('dotenv').config();
const admin = require('firebase-admin');
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

// Smart Catalog Expander with duplicate prevention and image reference tracking
class SmartCatalogExpander {
    constructor() {
        this.existingProducts = new Map(); // ID -> product data
        this.productKeys = new Set(); // Normalized name+brand combinations
        this.imageReferences = new Map(); // Image name -> products using it
        this.expandedCount = 0;
        this.duplicatesPrevensted = 0;
        this.imageReuseCount = 0;
    }

    // Create unique key for duplicate detection
    createProductKey(name, brand) {
        return `${brand.toLowerCase().replace(/[^\w]/g, '')}_${name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '_')}`;
    }

    // Generate unique image name with proper tracking
    generateImageName(productName, brand, variant = '') {
        const cleanName = productName.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 40);
        const cleanBrand = brand.toLowerCase().replace(/[^\w]/g, '').substring(0, 15);
        const cleanVariant = variant ? `_${variant.toLowerCase().replace(/[^\w]/g, '')}` : '';
        const timestamp = Date.now().toString().slice(-4);
        
        return `${cleanBrand}_${cleanName}${cleanVariant}_${timestamp}.jpg`;
    }

    // Load existing products and create reference mappings
    async loadExistingProducts() {
        console.log('🔍 Loading existing products for duplicate prevention...');
        const snapshot = await db.collection('productCatalog').get();
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const key = this.createProductKey(data.name, data.brand);
            
            this.existingProducts.set(doc.id, data);
            this.productKeys.add(key);
            
            // Track image usage
            if (data.imageName || data.imageUrl) {
                const imageName = data.imageName || this.extractImageNameFromUrl(data.imageUrl);
                if (imageName) {
                    if (!this.imageReferences.has(imageName)) {
                        this.imageReferences.set(imageName, []);
                    }
                    this.imageReferences.get(imageName).push({
                        productId: doc.id,
                        productName: data.name,
                        brand: data.brand
                    });
                }
            }
        });
        
        console.log(`📊 Loaded ${this.existingProducts.size} existing products`);
        console.log(`🖼️  Tracking ${this.imageReferences.size} unique images`);
    }

    // Extract image name from Firebase URL
    extractImageNameFromUrl(url) {
        if (!url) return null;
        const match = url.match(/images%2Fsupplements%2F([^?&]+)/);
        return match ? decodeURIComponent(match[1]) : null;
    }

    // Find existing image that can be reused for similar products
    findReusableImage(productName, brand, category) {
        const searchTerms = [
            brand.toLowerCase(),
            category.toLowerCase(),
            ...productName.toLowerCase().split(' ')
        ];

        for (const [imageName, usageData] of this.imageReferences) {
            const imageNameLower = imageName.toLowerCase();
            const matchCount = searchTerms.filter(term => imageNameLower.includes(term)).length;
            
            if (matchCount >= 2) { // Good match found
                this.imageReuseCount++;
                console.log(`🔄 Reusing image: ${imageName} for ${productName}`);
                return usageData[0]; // Return first usage data for URL reference
            }
        }
        
        return null;
    }

    // Generate intelligent product variations based on existing successful patterns
    generateIntelligentVariations() {
        console.log('🧠 Generating intelligent product variations...');
        const newProducts = [];
        
        // Analyze existing products to find expansion opportunities
        const brandCategories = new Map();
        const formVariations = new Map();
        const flavorVariations = new Map();
        
        for (const [id, product] of this.existingProducts) {
            const brandKey = `${product.brand}_${product.category}`;
            if (!brandCategories.has(brandKey)) {
                brandCategories.set(brandKey, []);
            }
            brandCategories.get(brandKey).push(product);
            
            // Track forms and flavors
            if (product.name.includes('Powder') || product.name.includes('Capsules')) {
                const baseKey = product.name.replace(/(Powder|Capsules|Tablets)/g, '').trim();
                if (!formVariations.has(baseKey)) {
                    formVariations.set(baseKey, new Set());
                }
                formVariations.get(baseKey).add(product.name.match(/(Powder|Capsules|Tablets)/)?.[0] || 'Unknown');
            }
            
            if (product.name.includes(' - ')) {
                const [baseName, flavor] = product.name.split(' - ');
                if (!flavorVariations.has(baseName.trim())) {
                    flavorVariations.set(baseName.trim(), new Set());
                }
                flavorVariations.get(baseName.trim()).add(flavor.trim());
            }
        }

        // Generate missing form variations
        console.log('📦 Generating missing form variations...');
        for (const [baseName, existingForms] of formVariations) {
            const targetForms = ['Powder', 'Capsules', 'Tablets'];
            const brand = this.findBrandForProduct(baseName);
            
            if (brand) {
                for (const form of targetForms) {
                    if (!existingForms.has(form)) {
                        const newName = `${baseName} ${form}`;
                        const productKey = this.createProductKey(newName, brand);
                        
                        if (!this.productKeys.has(productKey)) {
                            const baseProduct = this.findSimilarProduct(baseName, brand);
                            if (baseProduct) {
                                newProducts.push(this.createVariationProduct(baseProduct, newName, form));
                            }
                        }
                    }
                }
            }
        }

        // Generate missing flavor variations
        console.log('🍓 Generating missing flavor variations...');
        for (const [baseName, existingFlavors] of flavorVariations) {
            const targetFlavors = ['Vanilla', 'Chocolate', 'Strawberry', 'Unflavored'];
            const brand = this.findBrandForProduct(baseName);
            
            if (brand && (baseName.includes('Protein') || baseName.includes('Pre-Workout'))) {
                for (const flavor of targetFlavors) {
                    if (!existingFlavors.has(flavor)) {
                        const newName = `${baseName} - ${flavor}`;
                        const productKey = this.createProductKey(newName, brand);
                        
                        if (!this.productKeys.has(productKey)) {
                            const baseProduct = this.findSimilarProduct(baseName, brand);
                            if (baseProduct) {
                                newProducts.push(this.createVariationProduct(baseProduct, newName, flavor));
                            }
                        }
                    }
                }
            }
        }

        // Generate cross-brand variations for popular products
        console.log('🏢 Generating cross-brand variations...');
        const popularProducts = ['Whey Protein Isolate', 'Creatine Monohydrate', 'Pre-Workout Formula'];
        const targetBrands = ['BSN', 'MuscleTech', 'Universal Nutrition', 'MusclePharm'];
        
        for (const productName of popularProducts) {
            for (const brand of targetBrands) {
                const productKey = this.createProductKey(productName, brand);
                if (!this.productKeys.has(productKey)) {
                    const templateProduct = this.findBestTemplate(productName);
                    if (templateProduct) {
                        newProducts.push(this.createBrandVariation(templateProduct, productName, brand));
                    }
                }
            }
        }

        console.log(`🎯 Generated ${newProducts.length} intelligent variations`);
        return newProducts.slice(0, 50); // Limit to 50 new products
    }

    // Helper methods
    findBrandForProduct(productName) {
        for (const [id, product] of this.existingProducts) {
            if (product.name.includes(productName)) {
                return product.brand;
            }
        }
        return null;
    }

    findSimilarProduct(searchName, brand) {
        for (const [id, product] of this.existingProducts) {
            if (product.brand === brand && product.name.includes(searchName.split(' ')[0])) {
                return product;
            }
        }
        return null;
    }

    findBestTemplate(productName) {
        for (const [id, product] of this.existingProducts) {
            if (product.name.toLowerCase().includes(productName.toLowerCase().split(' ')[0])) {
                return product;
            }
        }
        return null;
    }

    // Create variation product with proper image handling
    createVariationProduct(baseProduct, newName, variation) {
        const newId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const category = baseProduct.category || 'supplement';
        
        // Try to reuse existing image
        const existingImageData = this.findReusableImage(newName, baseProduct.brand, category);
        let imageUrl = baseProduct.imageUrl;
        let imageName = baseProduct.imageName;
        
        if (existingImageData && existingImageData.imageUrl) {
            imageUrl = existingImageData.imageUrl;
            imageName = existingImageData.imageName;
        } else {
            // Generate new image name but keep URL pattern
            imageName = this.generateImageName(newName, baseProduct.brand, variation);
        }

        return {
            id: newId,
            name: newName,
            brand: baseProduct.brand,
            category: category,
            price: baseProduct.price || 29.99,
            rating: baseProduct.rating || 4.3,
            evidenceScore: baseProduct.evidenceScore || 85,
            ingredients: baseProduct.ingredients || [],
            imageUrl: imageUrl,
            imageName: imageName,
            form: variation.includes('Powder') ? 'powder' : variation.includes('Capsules') ? 'capsules' : 'other',
            flavor: variation.includes(' - ') ? variation.split(' - ')[1] : null,
            source: 'ai-smart-expansion',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            metadata: {
                baseProductId: this.findBaseProductId(baseProduct),
                variationType: this.determineVariationType(variation),
                imageReused: !!existingImageData
            }
        };
    }

    createBrandVariation(templateProduct, productName, newBrand) {
        const newId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const existingImageData = this.findReusableImage(productName, newBrand, templateProduct.category);
        
        return {
            id: newId,
            name: productName,
            brand: newBrand,
            category: templateProduct.category,
            price: templateProduct.price + Math.random() * 10 - 5, // Slight price variation
            rating: Math.max(3.5, templateProduct.rating + (Math.random() * 0.6 - 0.3)),
            evidenceScore: Math.max(70, templateProduct.evidenceScore + Math.floor(Math.random() * 10 - 5)),
            ingredients: templateProduct.ingredients,
            imageUrl: existingImageData?.imageUrl || templateProduct.imageUrl,
            imageName: existingImageData?.imageName || this.generateImageName(productName, newBrand),
            source: 'ai-brand-expansion',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: {
                templateProductId: this.findBaseProductId(templateProduct),
                variationType: 'brand-variation',
                imageReused: !!existingImageData
            }
        };
    }

    findBaseProductId(product) {
        for (const [id, existingProduct] of this.existingProducts) {
            if (existingProduct.name === product.name && existingProduct.brand === product.brand) {
                return id;
            }
        }
        return null;
    }

    determineVariationType(variation) {
        if (variation.includes('Powder') || variation.includes('Capsules')) return 'form-variation';
        if (variation.includes(' - ')) return 'flavor-variation';
        return 'other-variation';
    }

    // Add products to database with duplicate checking
    async addProductsToDatabase(newProducts) {
        console.log(`\n📝 Adding ${newProducts.length} new products to database...`);
        const results = { added: 0, duplicates: 0, errors: 0 };
        
        for (const product of newProducts) {
            try {
                const productKey = this.createProductKey(product.name, product.brand);
                
                if (this.productKeys.has(productKey)) {
                    results.duplicates++;
                    this.duplicatesPrevensted++;
                    console.log(`⚠️  Skipping duplicate: ${product.name} by ${product.brand}`);
                    continue;
                }
                
                // Add to database
                const docRef = await db.collection('productCatalog').add(product);
                this.productKeys.add(productKey);
                results.added++;
                this.expandedCount++;
                
                // Update image references
                if (product.imageName) {
                    if (!this.imageReferences.has(product.imageName)) {
                        this.imageReferences.set(product.imageName, []);
                    }
                    this.imageReferences.get(product.imageName).push({
                        productId: docRef.id,
                        productName: product.name,
                        brand: product.brand
                    });
                }
                
                console.log(`✅ Added: ${product.name} by ${product.brand}`);
                
                // Rate limiting
                if (results.added % 20 === 0) {
                    console.log(`⏸️  Processed ${results.added} products, brief pause...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
            } catch (error) {
                results.errors++;
                console.error(`❌ Failed to add ${product.name}:`, error.message);
            }
        }
        
        return results;
    }

    // Main expansion process
    async expandCatalog() {
        console.log('🚀 STARTING SMART CATALOG EXPANSION');
        console.log('===================================');
        
        await this.loadExistingProducts();
        
        const newProducts = this.generateIntelligentVariations();
        const results = await this.addProductsToDatabase(newProducts);
        
        // Generate final report
        const report = {
            timestamp: new Date().toISOString(),
            initialProducts: this.existingProducts.size,
            newProductsGenerated: newProducts.length,
            productsAdded: results.added,
            duplicatesPrevented: results.duplicates,
            errors: results.errors,
            imageReuses: this.imageReuseCount,
            totalImagesTracked: this.imageReferences.size,
            imageProductMappings: Array.from(this.imageReferences.entries()).map(([imageName, products]) => ({
                imageName,
                usedBy: products.length,
                products: products.map(p => `${p.productName} by ${p.brand}`)
            }))
        };
        
        // Save detailed report
        fs.writeFileSync('./smart-catalog-expansion-report.json', JSON.stringify(report, null, 2));
        
        console.log('\n🎉 SMART CATALOG EXPANSION COMPLETE!');
        console.log('====================================');
        console.log(`📦 Products added: ${results.added}`);
        console.log(`🛡️  Duplicates prevented: ${results.duplicates}`);
        console.log(`🔄 Images reused: ${this.imageReuseCount}`);
        console.log(`🖼️  Total images tracked: ${this.imageReferences.size}`);
        console.log(`❌ Errors: ${results.errors}`);
        console.log('💾 Detailed report saved to smart-catalog-expansion-report.json');
        
        return report;
    }
}

// Execute the smart expansion
async function main() {
    try {
        const expander = new SmartCatalogExpander();
        const report = await expander.expandCatalog();
        
        console.log('\n📊 EXPANSION SUMMARY:');
        console.log('=====================');
        console.log(`Initial catalog size: ${report.initialProducts}`);
        console.log(`New products added: ${report.productsAdded}`);
        console.log(`Final catalog size: ${report.initialProducts + report.productsAdded}`);
        console.log(`Image reuse efficiency: ${report.imageReuses} reuses across ${report.totalImagesTracked} images`);
        
    } catch (error) {
        console.error('💥 Smart expansion failed:', error);
        process.exit(1);
    }
}

main();
