import { cachedStackService } from '../src/lib/cached-stack-service';

async function generateCachedStacks() {
  console.log('🎯 Generating Cached Supplement Stacks\n');
  console.log('This implements your proposed caching strategy:\n');
  console.log('✅ Pre-generate stacks for common user archetypes');
  console.log('✅ Use verified Amazon products with working links');
  console.log('✅ Cache results for instant delivery to users');
  console.log('✅ Eliminate broken images and links\n');

  try {
    // Generate all cached stacks
    await cachedStackService.generateAndCacheAllStacks();
    
    console.log('\n📊 Generated Stacks Summary:');
    console.log('==================================');
    
    const allStacks = cachedStackService.getAllCachedStacks();
    
    for (const stack of allStacks) {
      console.log(`\n📋 ${stack.name}`);
      console.log(`   💰 Cost: $${stack.totalMonthlyCost}/month`);
      console.log(`   🧬 Supplements: ${stack.supplements.length}`);
      console.log(`   ⭐ Avg Rating: ${stack.averageRating.toFixed(1)}`);
      console.log(`   🔗 All Links Valid: ${stack.allLinksValid ? '✅' : '❌'}`);
      
      // Show supplements
      for (const supplement of stack.supplements) {
        console.log(`     • ${supplement.name} (${supplement.brand}) - $${supplement.currentPrice}`);
      }
    }

    console.log('\n🎉 Success! Your cached stack system is ready.');
    console.log('\nNext steps:');
    console.log('1. ✅ Cached stacks generated with verified products');
    console.log('2. 🔄 Set up hourly verification job');
    console.log('3. 📱 Update frontend to use cached stacks');
    console.log('4. 🏪 Integrate with database (Firestore)');

    // Test the matching system
    console.log('\n🔍 Testing Stack Matching:');
    const testMatch = cachedStackService.findBestMatchingStack(
      ['muscle building', 'strength'], 
      25, 
      'male'
    );
    
    if (testMatch) {
      console.log(`✅ Found match: "${testMatch.name}" for young male with muscle building goals`);
    }

  } catch (error) {
    console.error('❌ Error generating cached stacks:', error);
  }
}

generateCachedStacks();
