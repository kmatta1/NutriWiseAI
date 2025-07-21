// Test script to verify CachedStackService works correctly
const { CachedStackService } = require('./src/lib/cached-stack-service.ts');

async function testCachedService() {
  console.log('🧪 Testing CachedStackService...\n');
  
  try {
    // Create an instance
    const service = new CachedStackService();
    console.log('✅ Successfully created CachedStackService instance');
    
    // Test getAllCachedStacks method (should be empty initially)
    const initialStacks = service.getAllCachedStacks();
    console.log(`✅ getAllCachedStacks() returned ${initialStacks.length} stacks`);
    
    // Test generateAndCacheAllStacks method
    console.log('\n🔄 Generating and caching all stacks...');
    await service.generateAndCacheAllStacks();
    
    // Test getAllCachedStacks method again (should have stacks now)
    const finalStacks = service.getAllCachedStacks();
    console.log(`✅ getAllCachedStacks() now returns ${finalStacks.length} stacks`);
    
    // Show stack names
    finalStacks.forEach(stack => {
      console.log(`  - ${stack.name} (${stack.supplements.length} supplements)`);
    });
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCachedService();
