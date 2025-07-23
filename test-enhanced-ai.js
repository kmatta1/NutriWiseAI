/**
 * Comprehensive Test Suite for Enhanced AI Recommendations
 * Tests budget enforcement, health concern integration, and personalization
 */

import { fallbackAI } from '../src/lib/fallback-ai';
import type { UserProfile } from '../src/lib/fallback-ai';

const testProfiles: UserProfile[] = [
  {
    // Test Case 1: Budget-Constrained User
    age: 25,
    gender: 'male',
    race: 'white',
    weight: 180,
    fitnessGoals: ['weight-lifting'],
    dietaryRestrictions: [],
    currentSupplements: [],
    healthConcerns: ['low-energy', 'focus-memory'],
    budget: 40, // Low budget
    experienceLevel: 'beginner',
    lifestyle: 'active',
    activityLevel: 'moderate',
    diet: 'balanced',
    sleepQuality: 'good',
    otherCriteria: 'Looking for maximum value within tight budget'
  },
  {
    // Test Case 2: Health-Focused User
    age: 45,
    gender: 'female',
    race: 'hispanic',
    weight: 140,
    fitnessGoals: ['general-health'],
    dietaryRestrictions: [],
    currentSupplements: [],
    healthConcerns: ['joint-pain', 'immune-system', 'hormone-balance'],
    budget: 120, // Moderate budget
    experienceLevel: 'intermediate',
    lifestyle: 'balanced',
    activityLevel: 'light',
    diet: 'mediterranean',
    sleepQuality: 'poor',
    otherCriteria: 'Focus on anti-aging and disease prevention'
  },
  {
    // Test Case 3: Athletic Performance User
    age: 28,
    gender: 'male',
    race: 'black',
    weight: 190,
    fitnessGoals: ['weight-lifting', 'endurance'],
    dietaryRestrictions: [],
    currentSupplements: ['whey protein'],
    healthConcerns: [],
    budget: 200, // High budget
    experienceLevel: 'advanced',
    lifestyle: 'very active',
    activityLevel: 'very-active',
    diet: 'high-protein',
    sleepQuality: 'good',
    otherCriteria: 'Competitive athlete seeking performance edge'
  },
  {
    // Test Case 4: Budget Validation Test
    age: 35,
    gender: 'female',
    race: 'asian',
    weight: 125,
    fitnessGoals: ['weight-loss'],
    dietaryRestrictions: ['vegetarian'],
    currentSupplements: [],
    healthConcerns: ['stress-anxiety', 'sleep-issues'],
    budget: 30, // Very tight budget
    experienceLevel: 'beginner',
    lifestyle: 'sedentary',
    activityLevel: 'sedentary',
    diet: 'vegetarian',
    sleepQuality: 'very-poor',
    otherCriteria: 'New to supplements, need beginner-friendly options'
  }
];

async function runTestSuite() {
  console.log('🧪 STARTING ENHANCED AI RECOMMENDATION TEST SUITE\n');
  
  for (let i = 0; i < testProfiles.length; i++) {
    const profile = testProfiles[i];
    console.log(`\n=== TEST CASE ${i + 1}: ${getTestCaseName(i)} ===`);
    console.log(`User: ${profile.age}yo ${profile.gender}, ${profile.race}, $${profile.budget} budget`);
    console.log(`Goals: ${profile.fitnessGoals.join(', ')}`);
    console.log(`Health Concerns: ${profile.healthConcerns?.join(', ') || 'None'}`);
    
    try {
      const startTime = Date.now();
      const result = await fallbackAI.generateEvidenceBasedStack(profile, true);
      const endTime = Date.now();
      
      console.log(`\n✅ RESULTS (${endTime - startTime}ms):`);
      console.log(`Stack Name: ${result.name}`);
      console.log(`Total Cost: $${result.totalMonthlyCost} (Budget: $${profile.budget})`);
      console.log(`Supplements Count: ${result.supplements.length}`);
      
      // Validate budget compliance
      const budgetCompliant = result.totalMonthlyCost <= profile.budget;
      console.log(`Budget Compliant: ${budgetCompliant ? '✅' : '❌'}`);
      
      // Show supplements
      console.log('\nSUPPLEMENTS:');
      result.supplements.forEach((supp, idx) => {
        console.log(`  ${idx + 1}. ${supp.name} - $${supp.price}`);
        console.log(`     Dosage: ${supp.dosage}`);
        console.log(`     Timing: ${supp.timing}`);
        console.log(`     Reason: ${supp.reasoning.substring(0, 100)}...`);
      });
      
      // Validate health concern targeting
      if (profile.healthConcerns && profile.healthConcerns.length > 0) {
        const addressedConcerns = profile.healthConcerns.filter(concern => {
          return result.supplements.some(supp => 
            supp.reasoning.toLowerCase().includes(concern.replace('-', ' '))
          );
        });
        console.log(`\nHealth Concerns Addressed: ${addressedConcerns.length}/${profile.healthConcerns.length}`);
      }
      
      // Show timeline and additional info
      console.log(`\nTimeline: ${result.timeline}`);
      console.log(`Evidence Score: ${result.evidenceScore}/100`);
      console.log(`Success Rate: ${result.userSuccessRate}%`);
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(80));
  }
  
  console.log('\n🎉 TEST SUITE COMPLETED!');
}

function getTestCaseName(index: number): string {
  const names = [
    'Budget-Constrained User',
    'Health-Focused User', 
    'Athletic Performance User',
    'Budget Validation Test'
  ];
  return names[index] || `Test Case ${index + 1}`;
}

// Export for use in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTestSuite, testProfiles };
}

// Run tests if called directly
if (typeof window === 'undefined' && require.main === module) {
  runTestSuite().catch(console.error);
}
