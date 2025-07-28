/**
 * Test Health Concerns Functionality
 * Run: node test-health-concerns.mjs
 */

// Test health concerns checkbox functionality
function testHealthConcernsLogic() {
  console.log('🧪 Testing Health Concerns Logic...\n');
  
  // Simulate form state like React Hook Form
  let healthConcerns = [];
  
  // Test checkbox state changes
  console.log('1️⃣ Testing checkbox state changes:');
  
  const concernOptions = [
    { id: "joint-pain", label: "Joint Pain/Arthritis" },
    { id: "low-energy", label: "Low Energy/Fatigue" },
    { id: "stress-anxiety", label: "Stress/Anxiety" },
    { id: "poor-digestion", label: "Poor Digestion" },
    { id: "focus-memory", label: "Focus/Memory Issues" },
    { id: "sleep-issues", label: "Sleep Issues" },
    { id: "immune-system", label: "Weak Immune System" },
    { id: "inflammation", label: "Chronic Inflammation" },
    { id: "heart-health", label: "Heart Health Concerns" },
    { id: "bone-health", label: "Bone Health/Osteoporosis" },
    { id: "hormone-balance", label: "Hormonal Imbalances" },
    { id: "skin-hair", label: "Skin/Hair Issues" }
  ];
  
  // Simulate checking boxes
  function handleConcernChange(concernId, checked) {
    console.log(`   ${checked ? '✅' : '❌'} ${concernId}: ${checked ? 'CHECKED' : 'UNCHECKED'}`);
    
    if (checked) {
      if (!healthConcerns.includes(concernId)) {
        healthConcerns.push(concernId);
      }
    } else {
      healthConcerns = healthConcerns.filter(id => id !== concernId);
    }
    
    console.log(`      Current concerns: [${healthConcerns.join(', ')}]`);
    return healthConcerns;
  }
  
  // Test checking some boxes
  handleConcernChange("joint-pain", true);
  handleConcernChange("low-energy", true);
  handleConcernChange("stress-anxiety", true);
  
  // Test unchecking
  handleConcernChange("low-energy", false);
  
  console.log(`\n✅ Final health concerns: [${healthConcerns.join(', ')}]`);
  console.log(`✅ Total selected: ${healthConcerns.length}\n`);
  
  return healthConcerns;
}

// Test Amazon cart integration
function testAmazonCartLogic() {
  console.log('🛒 Testing Amazon Cart Logic...\n');
  
  // Mock cart items
  const cartItems = [
    { 
      supplementName: "Omega-3 Fish Oil", 
      quantity: 1,
      asin: "B00CAZAU62" // Example ASIN
    },
    { 
      supplementName: "Magnesium Glycinate", 
      quantity: 2,
      asin: "B00YQZQH32" // Example ASIN
    }
  ];
  
  console.log('1️⃣ Cart Items:');
  cartItems.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.supplementName} (ASIN: ${item.asin}) x${item.quantity}`);
  });
  
  console.log('\n2️⃣ Generating Amazon Cart URL:');
  
  // Test the cart URL generation logic
  function generateAmazonCartUrl(items) {
    const baseUrl = 'https://www.amazon.com/gp/aws/cart/add.html';
    const params = new URLSearchParams();
    
    // Add associate tag
    params.append('tag', 'nutri0ad-20');
    
    // Add each item
    items.forEach((item, index) => {
      const itemNumber = index + 1;
      params.append(`ASIN.${itemNumber}`, item.asin);
      params.append(`Quantity.${itemNumber}`, item.quantity.toString());
    });
    
    return `${baseUrl}?${params.toString()}`;
  }
  
  const cartUrl = generateAmazonCartUrl(cartItems);
  console.log(`   Generated URL: ${cartUrl}`);
  
  // Validate URL structure
  const isValidUrl = cartUrl.includes('amazon.com') && 
                    cartUrl.includes('ASIN.1=') && 
                    cartUrl.includes('Quantity.1=') &&
                    cartUrl.includes('tag=nutri0ad-20');
  
  console.log(`   URL Validation: ${isValidUrl ? '✅ VALID' : '❌ INVALID'}`);
  
  return { cartUrl, isValid: isValidUrl };
}

// Run tests
function runAllTests() {
  console.log('🎯 NutriWiseAI - Component Testing\n');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Health Concerns
    const healthConcerns = testHealthConcernsLogic();
    
    // Test 2: Amazon Cart
    const cartResult = testAmazonCartLogic();
    
    console.log('📊 TEST SUMMARY:');
    console.log('=' .repeat(50));
    console.log(`✅ Health Concerns: ${healthConcerns.length} selected`);
    console.log(`✅ Amazon Cart URL: ${cartResult.isValid ? 'Valid format' : 'Invalid format'}`);
    console.log(`✅ Cart URL: ${cartResult.cartUrl}`);
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Test the actual frontend functionality in browser');
    console.log('2. Check browser console for health concern changes');
    console.log('3. Test Amazon cart redirect with real products');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
runAllTests();
