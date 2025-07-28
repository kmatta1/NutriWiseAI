/**
 * Test Database Image Loading
 * 
 * Simple Next.js API route to test database image loading
 */

import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    console.log('🔍 Testing database image loading...');
    
    const catalogRef = collection(db, 'productCatalog');
    const snapshot = await getDocs(catalogRef);
    
    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        brand: data.brand,
        category: data.category,
        imageUrl: data.imageUrl,
        hasImage: !!(data.imageUrl && data.imageUrl.trim() !== '')
      };
    });
    
    const totalProducts = products.length;
    const productsWithImages = products.filter(p => p.hasImage).length;
    const productsWithoutImages = totalProducts - productsWithImages;
    
    const summary = {
      totalProducts,
      productsWithImages,
      productsWithoutImages,
      products: products.slice(0, 10), // First 10 products for testing
      allProductsHaveImages: productsWithoutImages === 0
    };
    
    return NextResponse.json({
      success: true,
      message: 'Database image loading test complete',
      data: summary
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to load products from database'
    }, { status: 500 });
  }
}
