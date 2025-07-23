/**
 * Browser Console Test for Enhanced AI Recommendations
 * Open browser console and paste this code to test the enhancements
 */

// Test profiles for different scenarios
const testProfiles = [
  {
    name: "Budget-Constrained User",
    profile: {
      age: 25,
      gender: 'male',
      race: 'white',
      weight: 180,
      fitnessGoals: ['weight-lifting'],
      dietaryRestrictions: [],
      currentSupplements: [],
      healthConcerns: ['low-energy', 'focus-memory'],
      budget: 40, // Low budget - should enforce strict limits
      experienceLevel: 'beginner',
      lifestyle: 'active',
      activityLevel: 'moderate',
      diet: 'balanced',
      sleepQuality: 'good',
      otherCriteria: 'Looking for maximum value within tight budget'
    }
  },
  {
    name: "Health-Focused User",
    profile: {
      age: 45,
      gender: 'female',
      race: 'hispanic',
      weight: 140,
      fitnessGoals: ['general-health'],
      dietaryRestrictions: [],
      currentSupplements: [],
      healthConcerns: ['joint-pain', 'immune-system', 'hormone-balance'],
      budget: 120, // Moderate budget - should address health concerns
      experienceLevel: 'intermediate',
      lifestyle: 'balanced',
      activityLevel: 'light',
      diet: 'mediterranean',
      sleepQuality: 'poor',
      otherCriteria: 'Focus on anti-aging and disease prevention'
    }
  },
  {
    name: "Athletic Performance User", 
    profile: {
      age: 28,
      gender: 'male',
      race: 'black',
      weight: 190,
      fitnessGoals: ['weight-lifting', 'endurance'],
      dietaryRestrictions: [],
      currentSupplements: ['whey protein'],
      healthConcerns: [],
      budget: 200, // High budget - should include advanced supplements
      experienceLevel: 'advanced',
      lifestyle: 'very active',
      activityLevel: 'very-active',
      diet: 'high-protein',
      sleepQuality: 'good',
      otherCriteria: 'Competitive athlete seeking performance edge'
    }
  }
];

// Validation functions
function validateBudgetCompliance(stack, budget) {
  const isCompliant = stack.totalMonthlyCost <= budget;
  console.log(`💰 Budget Check: $${stack.totalMonthlyCost} <= $${budget} = ${isCompliant ? '✅ PASS' : '❌ FAIL'}`);
  return isCompliant;
}

function validateHealthConcernTargeting(stack, healthConcerns) {
  if (!healthConcerns || healthConcerns.length === 0) return true;
  
  const addressedConcerns = healthConcerns.filter(concern => {
    return stack.supplements.some(supp => 
      supp.reasoning && supp.reasoning.toLowerCase().includes(concern.replace('-', ' '))
    );
  });
  
  const coverage = (addressedConcerns.length / healthConcerns.length) * 100;
  console.log(`🎯 Health Targeting: ${addressedConcerns.length}/${healthConcerns.length} concerns addressed (${coverage.toFixed(0)}%)`);
  
  return coverage >= 50; // At least 50% of concerns should be addressed
}

function validatePersonalization(stack, profile) {
  const reasoning = stack.supplements.map(s => s.reasoning || '').join(' ').toLowerCase();
  
  // Check for demographic mentions
  const mentionsAge = reasoning.includes(profile.age.toString()) || 
                     reasoning.includes('age') || 
                     reasoning.includes('young') || 
                     reasoning.includes('mature');
  
  const mentionsGender = reasoning.includes(profile.gender) || 
                        reasoning.includes('male') || 
                        reasoning.includes('female');
  
  const mentionsActivity = reasoning.includes(profile.activityLevel) ||
                          reasoning.includes('active') ||
                          reasoning.includes('exercise');
  
  console.log(`👤 Personalization Check:`);
  console.log(`   Age consideration: ${mentionsAge ? '✅' : '❌'}`);
  console.log(`   Gender consideration: ${mentionsGender ? '✅' : '❌'}`);
  console.log(`   Activity consideration: ${mentionsActivity ? '✅' : '❌'}`);
  
  return mentionsAge || mentionsGender || mentionsActivity;
}

// Main test function
async function testEnhancedAI() {
  console.log('🧪 STARTING ENHANCED AI RECOMMENDATION TESTS\n');
  console.log('Testing budget enforcement, health concern targeting, and personalization...\n');
  
  for (let i = 0; i < testProfiles.length; i++) {
    const testCase = testProfiles[i];
    const profile = testCase.profile;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 TEST CASE ${i + 1}: ${testCase.name}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Profile: ${profile.age}yo ${profile.gender}, ${profile.race}`);
    console.log(`Budget: $${profile.budget}/month`);
    console.log(`Goals: ${profile.fitnessGoals.join(', ')}`);
    console.log(`Health Concerns: ${profile.healthConcerns?.join(', ') || 'None'}`);
    
    try {
      // This would need to be called from the actual app context
      // For demonstration, we'll show what should be tested
      console.log('\n⏳ Generating recommendations...');
      
      // In actual testing, you would call:
      // const result = await suggestSupplementsAction(profile);
      
      console.log('📝 TO TEST THIS CASE:');
      console.log('1. Fill out the advisor form with the above profile data');
      console.log('2. Submit the form and wait for recommendations');
      console.log('3. Check that:');
      console.log('   - Total cost ≤ budget');
      console.log('   - Health concerns are addressed in supplement reasoning');
      console.log('   - Age/gender/race factors mentioned in explanations');
      console.log('   - Supplement selection matches activity level and goals');
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
  }
  
  console.log('\n🎉 TEST CASES READY!');
  console.log('\nTo test manually:');
  console.log('1. Open the advisor page');
  console.log('2. Use the test data above to fill forms');
  console.log('3. Verify budget compliance and health targeting');
  console.log('4. Check for personalized explanations');
}

// Browser console instructions
console.log('🔬 Enhanced AI Testing Suite Loaded!');
console.log('Run testEnhancedAI() to see test cases');
console.log('Or copy individual profile data to test manually');

// Export test data for manual testing
window.testProfiles = testProfiles;
window.testEnhancedAI = testEnhancedAI;
