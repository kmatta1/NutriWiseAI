/**
 * Simplified test script to verify basic functionality
 */

console.log('Starting simplified test script...');

try {
  // Test 1: Basic logging
  console.log('✅ Basic logging works');

  // Test 2: Import utilities
  const { getAllAdvisorInputPermutations } = require('./utils/advisor-permutations.ts');
  console.log('✅ Imported advisor permutations utility');

  // Test 3: Generate small subset of permutations
  const permutations = getAllAdvisorInputPermutations();
  console.log(`✅ Generated ${permutations.length} permutations`);
  console.log('First permutation:', JSON.stringify(permutations[0], null, 2));

  console.log('✅ Test script completed successfully');
} catch (error) {
  console.error('❌ Test script failed:', error);
  process.exit(1);
}
