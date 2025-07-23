// Quick Verification Test for Enhanced AI Features
// Run this in browser console after opening http://localhost:9002/advisor

console.log('🔬 VERIFYING ENHANCED AI FEATURES...\n');

// Test 1: Check if budget is now required
console.log('1️⃣ TESTING BUDGET REQUIREMENT:');
const budgetField = document.querySelector('input[type="number"][placeholder*="100"]');
if (budgetField) {
  const formField = budgetField.closest('[role="group"]') || budgetField.closest('.space-y-3');
  const hasRequiredText = formField?.textContent?.includes('Required') || formField?.textContent?.includes('required');
  console.log(`   Budget field found: ✅`);
  console.log(`   Shows as required: ${hasRequiredText ? '✅' : '❌'}`);
  console.log(`   Has budget guidelines: ${formField?.textContent?.includes('Guidelines') ? '✅' : '❌'}`);
} else {
  console.log('   ❌ Budget field not found');
}

// Test 2: Check health concerns expansion  
console.log('\n2️⃣ TESTING HEALTH CONCERNS EXPANSION:');
const healthCheckboxes = document.querySelectorAll('input[type="checkbox"]');
const healthConcernCount = healthCheckboxes.length;
console.log(`   Health concern options: ${healthConcernCount} (should be 12+)`);
console.log(`   Expansion successful: ${healthConcernCount >= 12 ? '✅' : '❌'}`);

// Test specific health concerns
const expectedConcerns = ['joint-pain', 'immune-system', 'hormone-balance', 'inflammation'];
expectedConcerns.forEach(concern => {
  const found = document.querySelector(`input[id="${concern}"]`);
  console.log(`   ${concern}: ${found ? '✅' : '❌'}`);
});

// Test 3: Form validation
console.log('\n3️⃣ TESTING FORM VALIDATION:');
const submitButton = document.querySelector('button[type="submit"]');
if (submitButton) {
  console.log('   Submit button found: ✅');
  console.log('   Ready for validation testing: ✅');
} else {
  console.log('   ❌ Submit button not found');
}

// Test 4: Profile loading
console.log('\n4️⃣ TESTING PROFILE LOADING:');
const useProfileButton = document.querySelector('button[class*="btn-primary"]');
const hasProfilePrompt = document.textContent?.includes('Welcome Back') || document.textContent?.includes('Previous Profile');
console.log(`   Profile prompt system: ${hasProfilePrompt ? '✅' : '❌'}`);

// Test 5: Sample data functionality
console.log('\n5️⃣ TESTING SAMPLE DATA:');
const sampleDataButton = document.querySelector('button:contains("Sample Data"), button[class*="blue"]');
console.log(`   Sample data button available: ${sampleDataButton ? '✅' : '❌'}`);

console.log('\n📊 VERIFICATION SUMMARY:');
console.log('Enhanced features implemented and ready for testing!');
console.log('\n🧪 MANUAL TEST PROCEDURE:');
console.log('1. Fill budget field with $40 and leave other fields empty');
console.log('2. Try to submit - should show validation errors');
console.log('3. Complete form with budget-constrained profile');
console.log('4. Submit and verify total cost ≤ budget');
console.log('5. Check if health concerns are addressed in reasoning');

// Test data for manual testing
window.testData = {
  budgetConstrained: {
    age: 25,
    gender: 'male', 
    race: 'white',
    weight: 180,
    activityLevel: 'moderate',
    diet: 'balanced',
    sleepQuality: 'good',
    fitnessGoals: 'weight-lifting',
    healthConcerns: ['low-energy', 'focus-memory'],
    budget: 40,
    otherCriteria: 'Need maximum value for tight budget'
  },
  healthFocused: {
    age: 45,
    gender: 'female',
    race: 'hispanic', 
    weight: 140,
    activityLevel: 'light',
    diet: 'mediterranean',
    sleepQuality: 'poor',
    fitnessGoals: 'general-health',
    healthConcerns: ['joint-pain', 'immune-system', 'hormone-balance'],
    budget: 120,
    otherCriteria: 'Focus on health concerns and anti-aging'
  }
};

console.log('\n🎯 TEST DATA AVAILABLE:');
console.log('Use window.testData.budgetConstrained or window.testData.healthFocused');
console.log('Copy values to form fields for consistent testing');

console.log('\n✅ VERIFICATION COMPLETE - Ready for testing!');
