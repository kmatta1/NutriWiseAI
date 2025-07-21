import { NextRequest, NextResponse } from 'next/server';
import { CachedStackService } from '@/lib/cached-stack-service';

export async function GET() {
  try {
    console.log('🧪 Testing CachedStackService from API route...');
    
    // Create an instance
    const service = new CachedStackService();
    console.log('✅ Successfully created CachedStackService instance');
    
    // Test getAllCachedStacks method (should be empty initially)
    const initialStacks = service.getAllCachedStacks();
    console.log(`✅ getAllCachedStacks() returned ${initialStacks.length} stacks`);
    
    // Test generateAndCacheAllStacks method
    console.log('🔄 Generating and caching all stacks...');
    await service.generateAndCacheAllStacks();
    
    // Test getAllCachedStacks method again (should have stacks now)
    const finalStacks = service.getAllCachedStacks();
    console.log(`✅ getAllCachedStacks() now returns ${finalStacks.length} stacks`);
    
    const stackNames = finalStacks.map(stack => ({
      name: stack.name,
      supplements: stack.supplements.length,
      archetype: stack.archetypeId
    }));
    
    return NextResponse.json({
      success: true,
      message: 'CachedStackService test passed!',
      initialStackCount: initialStacks.length,
      finalStackCount: finalStacks.length,
      stacks: stackNames
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
