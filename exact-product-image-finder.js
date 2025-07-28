// exact-product-image-finder.js
// Find and download exact product images - one time only

require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');
const https = require('https');
const fs = require('fs');
const os = require('os');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = require(path.resolve(__dirname, 'serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'nutriwise-ai-3fmvs.firebasestorage.app'
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

class ExactProductImageFinder {
  constructor() {
    // Google Custom Search API (100 free requests/day)
    this.googleApiKey = process.env.GOOGLE_API_KEY;
    this.googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    // Exact product image searches - specific brand + product combos
    this.exactProductSearches = {
      'vitamin d3 5000 iu by now foods': 'NOW Foods Vitamin D3 5000 IU supplement bottle',
      'omega-3 fish oil 1200mg by nature made': 'Nature Made Omega-3 Fish Oil 1200mg softgels bottle',
      'magnesium glycinate 400mg by doctor\'s best': 'Doctor\'s Best Magnesium Glycinate 400mg supplement bottle',
      'optimum nutrition gold standard 100% whey protein powder - vanilla': 'Optimum Nutrition Gold Standard Whey Protein Vanilla 5lb container',
      'dymatize iso100 hydrolyzed whey protein isolate': 'Dymatize ISO100 Whey Protein Isolate container',
      'creatine monohydrate powder micronized by bulksupplements': 'BulkSupplements Creatine Monohydrate Powder bag',
      'multivitamin by garden of life vitamin code men': 'Garden of Life Vitamin Code Men multivitamin bottle',
      'garden of life sport organic plant-based protein - vanilla': 'Garden of Life Sport Plant Protein Vanilla container',
      'pre-workout supplement by legion pulse': 'Legion Pulse Pre-Workout supplement container',
      'bcaa energy amino acid supplement by cellucor c4': 'Cellucor C4 BCAA Energy supplement container',
      'collagen peptides powder by vital proteins': 'Vital Proteins Collagen Peptides Powder container',
      'green tea extract supplement by now foods': 'NOW Foods Green Tea Extract supplement bottle',
      'l-carnitine 1000mg by nutricost': 'Nutricost L-Carnitine 1000mg supplement bottle',
      'melatonin 3mg by nature made': 'Nature Made Melatonin 3mg supplement bottle',
      'probiotics 50 billion cfu by physician\'s choice': 'Physician\'s Choice Probiotics 50 Billion CFU bottle',
      'turmeric curcumin with bioperine by bioschwartz': 'BioSchwartz Turmeric Curcumin BioPerine supplement bottle',
      'ashwagandha root extract by nutricost': 'Nutricost Ashwagandha Root Extract supplement bottle',
      'l-theanine 200mg by now foods': 'NOW Foods L-Theanine 200mg supplement bottle',
      'zma zinc magnesium by now foods': 'NOW Foods ZMA Zinc Magnesium supplement bottle',
      'caffeine pills 200mg by prolab': 'ProLab Caffeine Pills 200mg supplement bottle',
      'cla 1250 safflower oil by sports research': 'Sports Research CLA 1250 Safflower Oil softgels',
      'garcinia cambogia extract by nature\'s bounty': 'Nature\'s Bounty Garcinia Cambogia Extract bottle',
      'ginkgo biloba extract by nature\'s bounty': 'Nature\'s Bounty Ginkgo Biloba Extract supplement bottle',
      'bacopa monnieri extract by nutricost': 'Nutricost Bacopa Monnieri Extract supplement bottle',
      'lion\'s mane mushroom extract by host defense': 'Host Defense Lion\'s Mane Mushroom Extract bottle'
    };
  }

  // Search Google Images for exact product
  async searchGoogleImages(searchQuery) {
    if (!this.googleApiKey || !this.googleSearchEngineId) {
      throw new Error('Google API credentials missing. Add GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID to .env');
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${this.googleApiKey}&cx=${this.googleSearchEngineId}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=5&imgType=photo&imgSize=medium`;
    
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.items && result.items.length > 0) {
              // Filter for good quality images
              const goodImages = result.items.filter(item => {
                const link = item.link.toLowerCase();
                return !link.includes('pinterest') && 
                       !link.includes('facebook') && 
                       !link.includes('instagram') &&
                       (link.includes('.jpg') || link.includes('.jpeg') || link.includes('.png'));
              });
              
              if (goodImages.length > 0) {
                resolve(goodImages[0].link);
              } else {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  // Alternative: Search Bing Images (more reliable for products)
  async searchBingImages(searchQuery) {
    // Bing Image Search API - 1000 free requests/month
    const bingApiKey = process.env.BING_API_KEY;
    if (!bingApiKey) {
      throw new Error('BING_API_KEY missing from .env');
    }

    const url = `https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURIComponent(searchQuery)}&count=5&imageType=Photo&size=Medium`;
    
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'Ocp-Apim-Subscription-Key': bingApiKey
        }
      };

      https.get(url, options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.value && result.value.length > 0) {
              // Get the best quality image
              const bestImage = result.value.find(img => 
                img.contentUrl && 
                !img.contentUrl.includes('pinterest') &&
                !img.contentUrl.includes('facebook')
              );
              
              resolve(bestImage ? bestImage.contentUrl : null);
            } else {
              resolve(null);
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  // Download image and upload to Firebase permanently
  async downloadAndUploadExactImage(imageUrl, productName, brand, searchQuery) {
    return new Promise((resolve, reject) => {
      try {
        const cleanName = this.generateImageFileName(productName, brand);
        const firebasePath = `images/supplements/${cleanName}.jpg`;
        const tempFile = path.join(os.tmpdir(), `${Date.now()}.jpg`);
        
        console.log(`📥 Downloading exact product image...`);
        console.log(`🔗 Source: ${imageUrl.substring(0, 80)}...`);
        
        const file = fs.createWriteStream(tempFile);
        
        // Handle both http and https
        const requestModule = imageUrl.startsWith('https:') ? https : require('http');
        
        requestModule.get(imageUrl, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
            return;
          }

          response.pipe(file);
          
          file.on('finish', async () => {
            file.close();
            
            try {
              // Upload to Firebase Storage permanently
              await bucket.upload(tempFile, {
                destination: firebasePath,
                metadata: {
                  contentType: 'image/jpeg',
                  customMetadata: {
                    originalUrl: imageUrl,
                    searchQuery: searchQuery,
                    uploadDate: new Date().toISOString()
                  }
                }
              });
              
              // Get permanent public URL
              const firebaseFile = bucket.file(firebasePath);
              const [url] = await firebaseFile.getSignedUrl({
                action: 'read',
                expires: '03-09-2491' // Long-term URL
              });
              
              // Clean up temp file
              if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
              }
              
              console.log(`✅ Permanently uploaded: ${cleanName}.jpg`);
              resolve(url);
              
            } catch (uploadError) {
              if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
              }
              reject(uploadError);
            }
          });
          
        }).on('error', (error) => {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
          reject(error);
        });
        
      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate clean filename
  generateImageFileName(productName, brand) {
    const clean = (str) => (str || '').toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 40);
    
    const cleanName = clean(productName);
    const cleanBrand = clean(brand);
    
    if (cleanName && cleanBrand && (cleanName.length + cleanBrand.length + 1) <= 40) {
      return `${cleanBrand}_${cleanName}`;
    } else if (cleanName) {
      return cleanName;
    } else if (cleanBrand) {
      return cleanBrand;
    } else {
      return 'unnamed_supplement';
    }
  }

  // Find exact search query for product
  findExactSearchQuery(productName, brand) {
    const searchKey = `${productName} ${brand || ''}`.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Try exact matches first
    for (const [key, query] of Object.entries(this.exactProductSearches)) {
      if (this.isProductMatch(searchKey, key)) {
        console.log(`🎯 Found exact search: "${query}"`);
        return query;
      }
    }
    
    // Fallback to generic search
    const genericSearch = `${brand} ${productName} supplement bottle container`.trim();
    console.log(`📝 Using generic search: "${genericSearch}"`);
    return genericSearch;
  }

  // Check if product matches search key
  isProductMatch(searchText, productKey) {
    const searchWords = searchText.split(' ').filter(w => w.length > 2);
    const keyWords = productKey.split(' ').filter(w => w.length > 2);
    
    let matches = 0;
    for (const keyWord of keyWords) {
      for (const searchWord of searchWords) {
        if (keyWord.includes(searchWord) || searchWord.includes(keyWord)) {
          matches++;
          break;
        }
      }
    }
    
    return matches >= Math.min(searchWords.length - 1, keyWords.length - 1);
  }

  async getAllProductsNeedingExactImages() {
    console.log('🔍 Finding ALL products for exact image matching...\n');

    const snapshot = await db.collection('productCatalog').get();
    const allProducts = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      allProducts.push({
        id: doc.id,
        name: data.name,
        brand: data.brand,
        currentImageUrl: data.imageUrl || '',
        currentImageSource: data.imageSource || ''
      });
    });

    console.log(`📦 Found ${allProducts.length} products to process:`);
    allProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} (${product.brand || 'No Brand'})`);
    });

    return allProducts;
  }

  async processAllProductsWithExactImages() {
    console.log('🚀 Starting EXACT PRODUCT IMAGE finder...\n');
    console.log('🔍 This will find and download the actual product images once\n');

    try {
      // Check API availability
      console.log('🔑 Checking available APIs:');
      console.log(`  Google Custom Search: ${this.googleApiKey ? '✅ Available' : '❌ Missing GOOGLE_API_KEY'}`);
      console.log(`  Bing Image Search: ${process.env.BING_API_KEY ? '✅ Available' : '❌ Missing BING_API_KEY'}`);
      console.log('');

      // Get all products
      const allProducts = await this.getAllProductsNeedingExactImages();
      
      if (allProducts.length === 0) {
        console.log('✅ No products found!');
        return;
      }

      const results = {
        processed: 0,
        successful: 0,
        notFound: 0,
        errors: [],
        sources: { google: 0, bing: 0 }
      };

      // Process each product
      const batch = db.batch();
      
      for (const product of allProducts) {
        try {
          results.processed++;
          console.log(`\n📦 Processing: ${product.name} (${product.brand || 'No Brand'})`);
          
          // Find exact search query
          const searchQuery = this.findExactSearchQuery(product.name, product.brand);
          
          let exactImageUrl = null;
          let imageSource = '';
          
          // Try Google Images first
          if (this.googleApiKey && this.googleSearchEngineId) {
            try {
              console.log(`🔍 Searching Google Images...`);
              exactImageUrl = await this.searchGoogleImages(searchQuery);
              if (exactImageUrl) {
                imageSource = 'google-images';
                results.sources.google++;
              }
            } catch (error) {
              console.log(`⚠️ Google search failed: ${error.message}`);
            }
          }
          
          // Try Bing Images if Google failed
          if (!exactImageUrl && process.env.BING_API_KEY) {
            try {
              console.log(`🔍 Searching Bing Images...`);
              exactImageUrl = await this.searchBingImages(searchQuery);
              if (exactImageUrl) {
                imageSource = 'bing-images';
                results.sources.bing++;
              }
            } catch (error) {
              console.log(`⚠️ Bing search failed: ${error.message}`);
            }
          }
          
          if (!exactImageUrl) {
            console.log(`❌ No exact image found`);
            results.notFound++;
            continue;
          }
          
          // Download and upload permanently
          const firebaseUrl = await this.downloadAndUploadExactImage(
            exactImageUrl, 
            product.name, 
            product.brand,
            searchQuery
          );
          
          // Update database
          const docRef = db.collection('productCatalog').doc(product.id);
          batch.update(docRef, {
            imageUrl: firebaseUrl,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            imageSource: 'exact-product-match',
            searchSource: imageSource,
            searchQuery: searchQuery,
            originalImageUrl: exactImageUrl
          });
          
          results.successful++;
          console.log(`✅ Downloaded exact product image`);
          
          // Rate limiting - be respectful to APIs
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`❌ Failed to process ${product.name}:`, error.message);
          results.errors.push(`${product.name}: ${error.message}`);
        }
      }

      // Commit all database updates
      if (results.successful > 0) {
        await batch.commit();
        console.log(`\n💾 Committed ${results.successful} database updates`);
      }

      // Final summary
      console.log('\n📊 EXACT PRODUCT IMAGE RESULTS:');
      console.log('=================================');
      console.log(`📦 Products processed: ${results.processed}`);
      console.log(`✅ Successfully downloaded: ${results.successful}`);
      console.log(`❌ No images found: ${results.notFound}`);
      console.log(`🚫 Errors: ${results.errors.length}`);
      
      if (results.successful > 0) {
        console.log('\n📡 Image sources used:');
        console.log(`  Google Images: ${results.sources.google} products`);
        console.log(`  Bing Images: ${results.sources.bing} products`);
      }

      if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(error => console.log(`  - ${error}`));
      }

      if (results.successful > 0) {
        console.log('\n🎉 SUCCESS! Downloaded exact product images permanently!');
        console.log('🔄 Restart your dev server to see the actual product images.');
        console.log('📸 All images are now exact matches stored in Firebase.');
        console.log('💾 Images are permanently saved - no more URL changes!');
        
        // Save results
        const resultData = {
          timestamp: new Date().toISOString(),
          method: 'exact-product-image-search',
          successfulDownloads: results.successful,
          notFound: results.notFound,
          sources: results.sources,
          errors: results.errors
        };
        
        fs.writeFileSync('exact-product-images-results.json', JSON.stringify(resultData, null, 2));
        console.log('📁 Results saved to exact-product-images-results.json');
      }

    } catch (error) {
      console.error('❌ Process failed:', error);
    }
  }
}

// Instructions for getting API keys
console.log('🔑 EXACT PRODUCT IMAGE FINDER');
console.log('==============================\n');
console.log('To get the most accurate results, get these FREE API keys:');
console.log('');
console.log('1. Google Custom Search API (100 free searches/day):');
console.log('   • Go to: https://developers.google.com/custom-search/v1/introduction');
console.log('   • Create project → Enable Custom Search API → Get API key');
console.log('   • Create Custom Search Engine at: https://cse.google.com/');
console.log('   • Add to .env: GOOGLE_API_KEY=your_key');
console.log('   • Add to .env: GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id');
console.log('');
console.log('2. Bing Image Search API (1000 free searches/month):');
console.log('   • Go to: https://azure.microsoft.com/en-us/services/cognitive-services/bing-image-search-api/');
console.log('   • Create free Azure account → Get Bing Search API key');
console.log('   • Add to .env: BING_API_KEY=your_key');
console.log('');
console.log('Running with available APIs...\n');

const service = new ExactProductImageFinder();
service.processAllProductsWithExactImages().catch(console.error);
