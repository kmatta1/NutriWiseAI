import { NextRequest, NextResponse } from 'next/server';
import { comprehensiveAIAdvisor } from '@/lib/comprehensive-ai-advisor';

// Remove Edge runtime to fix compilation issues
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const userProfile = await request.json();
    
    // Removed console.log to prevent browser Copilot errors
    
    const result = await comprehensiveAIAdvisor.generateComprehensiveRecommendation(userProfile);
    
    return NextResponse.json({
      success: true,
      recommendationStack: result,
      processingTime: 0, // Would track actual time in production
      aiInsights: result.aiRationale?.slice(0, 200) + '...'
    });
    
  } catch (error) {
    // Fallback to dynamic AI advisor
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'AI advisor temporarily unavailable',
      fallback: true
    }, { status: 500 });
  }
}
