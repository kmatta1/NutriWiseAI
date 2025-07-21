import { CachedStackService } from '../src/lib/cached-stack-service-updated.ts';

import * as fs from 'fs';

function generateStackObjects() {
  const archetypes = CachedStackService.getAllArchetypes();
  const stacks = archetypes.map(archetype => {
    const supplements = CachedStackService.getRecommendations(archetype);
    return {
      archetype,
      name: `${archetype} Stack`,
      supplements: supplements.map(s => s.id),
      supplementDetails: supplements,
      averageRating: supplements.length > 0 ? (supplements.reduce((sum, s) => sum + s.rating, 0) / supplements.length) : 0,
      totalReviewCount: supplements.reduce((sum, s) => sum + s.reviewCount, 0),
      lastUpdated: new Date().toISOString(),
    };
  });
  return stacks;
}

function main() {
  console.log('🎯 Generating Cached Supplement Stacks for Firestore\n');
  try {
    const stacks = generateStackObjects();
    fs.writeFileSync('cached-stacks.json', JSON.stringify(stacks, null, 2));
    console.log('✅ cached-stacks.json written for Firestore upload.');
    stacks.forEach(stack => {
      console.log(`\n📋 ${stack.name}`);
      console.log(`   🧬 Supplements: ${stack.supplements.length}`);
      console.log(`   ⭐ Avg Rating: ${stack.averageRating.toFixed(1)}`);
    });
    console.log('\n🎉 Success! Your cached stack system is ready.');
  } catch (error) {
    console.error('❌ Error generating cached stacks:', error);
  }
}

main();
