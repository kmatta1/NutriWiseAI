import { NextResponse } from 'next/server';
import { enhancedAdvisorService } from '@/lib/enhanced-advisor-service';

export async function POST() {
  try {
    console.log('🔄 Clearing cached stacks and regenerating with updated data...');
    
    // Force regeneration of all stacks with updated image URLs
    await enhancedAdvisorService.clearAndRegenerateStacks();
    
    return NextResponse.json({
      success: true,
      message: 'Successfully cleared cache and regenerated stacks with updated image URLs'
    });
    
  } catch (error) {
    console.error('❌ Failed to clear cache:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
