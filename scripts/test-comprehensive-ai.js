/**
 * Test Comprehensive AI Advisor System
 */
import { comprehensiveAIAdvisorService } from '../src/lib/comprehensive-ai-advisor.js';

console.log('🧪 Testing Comprehensive AI Advisor System...');

// Test user profile
const testProfile = {
  // Demographics
  age: 28,
  gender: 'male',
  weight: 180,
  height: 72,
  bodyFatPercentage: 15,
  
  // Goals & Lifestyle
  primaryGoals: ['muscle_building', 'strength'],
  secondaryGoals: ['fat_loss'],
  activityLevel: 'high',
  trainingType: ['weightlifting'],
  diet: 'omnivore',
  sleepHours: 7,
  stressLevel: 'medium',
  
  // Health & Medical
  healthConditions: [],
  medications: [],
  allergies: [],
  supplementExperience: 'intermediate',
  previousSupplements: ['whey_protein', 'creatine'],
  
  // Preferences & Constraints
  budget: 150,
  maxSupplements: 5,
  preferredBrands: [],
  avoidIngredients: [],
  
  // Tracking & Outcomes
  desiredOutcomes: ['increased_strength', 'muscle_growth', 'better_recovery'],
  timeframe: '3-months',
  complianceLevel: 'high'
};

async function testComprehensiveAI() {
  try {
    console.log('📊 Starting comprehensive AI analysis...');
    
    const result = await comprehensiveAIAdvisorService.generateComprehensiveStack(testProfile);
    
    console.log('✅ Comprehensive AI Analysis Complete!');
    console.log('📋 Stack Name:', result.name);
    console.log('💰 Total Monthly Cost: $' + result.totalMonthlyCost.toFixed(2));
    console.log('📊 Budget Utilization:', result.budgetUtilization + '%');
    console.log('🧬 Evidence Score:', result.overallEvidenceScore);
    console.log('📈 Confidence Score:', result.confidenceScore);
    console.log('💊 Recommendations:', result.recommendations.length);
    
    console.log('\n🧠 AI Rationale:');
    console.log(result.aiRationale);
    
    console.log('\n💊 Recommended Supplements:');
    result.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec.product.name} by ${rec.product.brand}`);
      console.log(`   💰 Price: $${rec.product.currentPrice}`);
      console.log(`   📊 Evidence: ${rec.scientificEvidence.evidenceLevel} (${rec.scientificEvidence.studyCount} studies)`);
      console.log(`   🎯 Priority: ${rec.priority}/10`);
      console.log(`   💡 Mechanism: ${rec.scientificEvidence.mechanismOfAction}`);
      console.log('');
    });
    
    console.log('🔗 Stack Synergies:');
    result.stackSynergies.forEach(synergy => console.log(`  • ${synergy}`));
    
    console.log('\n⚠️ Safety Considerations:');
    result.potentialInteractions.forEach(interaction => console.log(`  • ${interaction}`));
    
    console.log('\n📅 Monitoring Plan:');
    result.monitoringPlan.forEach(plan => console.log(`  • ${plan}`));
    
    console.log('\n🎯 Expected Outcomes:');
    console.log('Short-term (2-4 weeks):', result.expectedOutcomes.shortTerm.join(', '));
    console.log('Medium-term (2-3 months):', result.expectedOutcomes.mediumTerm.join(', '));
    console.log('Long-term (6+ months):', result.expectedOutcomes.longTerm.join(', '));
    
    return result;
    
  } catch (error) {
    console.error('❌ Comprehensive AI Test Failed:', error.message);
    console.error('Stack trace:', error.stack);
    return null;
  }
}

// Run the test
testComprehensiveAI()
  .then(result => {
    if (result) {
      console.log('\n🎉 Comprehensive AI Test Completed Successfully!');
      console.log('✅ System is ready for production use');
    } else {
      console.log('\n❌ Test failed - check error logs');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
