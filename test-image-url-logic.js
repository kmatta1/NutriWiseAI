/**
 * Test the ProductCatalogService locally to see what images it returns
 */

// Mock Firebase imports
const mockFirestore = {
  collection: () => ({
    getDocs: () => Promise.resolve({
      docs: [
        {
          id: 'test-product-1',
          data: () => ({
            name: 'Test Gaia Herbs Ginseng',
            brand: 'Gaia Herbs',
            imageUrl: 'https://storage.googleapis.com/nutriwise-ai-3fmvs.firebasestorage.app/images/supplements/galaherbs_gaia_herbs_ginseng_capsules_63702278.jpg',
            currentPrice: 29.99,
            isActive: true,
            category: 'adaptogens',
            targetGoals: ['energy'],
            activeIngredients: [],
            benefits: [],
            healthBenefits: [],
            contraindications: [],
            drugInteractions: [],
            sideEffects: [],
            citations: [],
            createdAt: { toDate: () => new Date() },
            lastUpdated: { toDate: () => new Date() },
            lastPriceUpdate: { toDate: () => new Date() },
            lastVerified: { toDate: () => new Date() }
          })
        },
        {
          id: 'test-product-2',
          data: () => ({
            name: 'Test Amazon Product',
            brand: 'Test Brand',
            imageUrl: 'https://m.media-amazon.com/images/broken-url.jpg',
            currentPrice: 19.99,
            isActive: true,
            category: 'vitamins'
          })
        }
      ]
    })
  })
};

// Simulate the getOptimizedImageUrl method
function getOptimizedImageUrl(data) {
  const imageUrl = data.imageUrl || data.image;
  
  if (!imageUrl) return null;
  
  // Check if already Firebase Storage URL
  if (imageUrl.includes('firebasestorage.googleapis.com') || 
      imageUrl.includes('firebasestorage.app')) {
    return imageUrl;
  }
  
  // Skip Amazon URLs (they're broken)
  if (imageUrl.includes('amazon.com')) {
    return null;
  }
  
  return imageUrl;
}

// Test the logic
console.log('🧪 Testing ProductCatalogService image URL logic...');
console.log('='.repeat(60));

const testData1 = {
  imageUrl: 'https://storage.googleapis.com/nutriwise-ai-3fmvs.firebasestorage.app/images/supplements/galaherbs_gaia_herbs_ginseng_capsules_63702278.jpg'
};

const testData2 = {
  imageUrl: 'https://m.media-amazon.com/images/broken-url.jpg'
};

const testData3 = {
  imageUrl: null
};

console.log('Test 1 - Firebase Storage URL:');
console.log('Input:', testData1.imageUrl);
console.log('Output:', getOptimizedImageUrl(testData1));
console.log('✅ Should return Firebase URL');

console.log('\\nTest 2 - Amazon URL:');
console.log('Input:', testData2.imageUrl);
console.log('Output:', getOptimizedImageUrl(testData2));
console.log('❌ Should return null (Amazon URLs blocked)');

console.log('\\nTest 3 - No URL:');
console.log('Input:', testData3.imageUrl);
console.log('Output:', getOptimizedImageUrl(testData3));
console.log('❌ Should return null');

// Test actual URL accessibility
console.log('\\n🌐 Testing Firebase Storage URL accessibility...');
const firebaseUrl = 'https://storage.googleapis.com/nutriwise-ai-3fmvs.firebasestorage.app/images/supplements/galaherbs_gaia_herbs_ginseng_capsules_63702278.jpg';

fetch(firebaseUrl, { method: 'HEAD' })
  .then(response => {
    console.log(`Firebase Storage URL: ${response.status} ${response.status === 200 ? '✅ WORKING' : '❌ BROKEN'}`);
    console.log('URL:', firebaseUrl);
  })
  .catch(error => {
    console.log('❌ Firebase Storage URL ERROR:', error.message);
  });
