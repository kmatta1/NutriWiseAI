import { NextResponse } from 'next/server';
import { enhancedAdvisorService } from '@/lib/enhanced-advisor-service';

export async function GET() {
  try {
    console.log('🧪 Testing advisor with sample user profile...');
    
    const testProfile = {
      age: 25,
      gender: 'male',
      activityLevel: 'active',
      goals: ['muscle_building', 'performance'],
      dietaryRestrictions: [],
      currentSupplements: []
    };
    
    const result = await enhancedAdvisorService.getRecommendations(testProfile);
    
    if (result.success) {
      const supplements = result.stack.supplements || [];
      console.log(`✅ Generated stack with ${supplements.length} supplements`);
      
      // Log image URLs to check them
      supplements.forEach((supp: any, index: number) => {
        console.log(`${index + 1}. ${supp.name} - Image: ${supp.imageUrl}`);
      });
      
      return NextResponse.json({
        success: true,
        stackName: result.stack.name,
        supplementCount: supplements.length,
        supplements: supplements.map((supp: any) => ({
          name: supp.name,
          brand: supp.brand,
          imageUrl: supp.imageUrl,
          price: supp.currentPrice || supp.price
        }))
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
