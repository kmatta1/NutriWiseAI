/**
 * Amazon Product Advertising API 5.0 Implementation
 * 
 * This script fetches real Amazon product data including images, pricing, and affiliate links
 * for supplement products across various customer archetypes and combinations.
 * 
 * Based on research of Amazon PAAPI5 best practices and implementation patterns.
 */

import crypto from 'crypto';

// Types for Amazon Product API
interface AmazonCredentials {
  accessKey: string;
  secretKey: string;
  associateTag: string;
  region: string;
  host: string;
}

interface ProductSearchRequest {
  keywords: string;
  searchIndex: string;
  itemCount?: number;
  browseNodeId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface AmazonProduct {
  asin: string;
  title: string;
  brand: string;
  price: {
    amount: number;
    currency: string;
    displayAmount: string;
  };
  images: {
    primary: string;
    variants: string[];
  };
  affiliateUrl: string;
  category: string;
  rating: number;
  reviewCount: number;
  availability: string;
  features: string[];
}

interface SupplementCombination {
  archetype: string;
  goals: string[];
  preferences: string[];
  restrictions: string[];
  searchTerms: string[];
  categories: string[];
}

// Amazon Product Advertising API 5.0 Configuration
const AMAZON_CONFIG: AmazonCredentials = {
  accessKey: process.env.AMAZON_ACCESS_KEY || '',
  secretKey: process.env.AMAZON_SECRET_KEY || '',
  associateTag: process.env.AMAZON_ASSOCIATE_TAG || '',
  region: 'us-east-1',
  host: 'webservices.amazon.com'
};

// Supplement search combinations based on customer archetypes
const SUPPLEMENT_COMBINATIONS: SupplementCombination[] = [
  // Athletic Performance Archetype
  {
    archetype: 'Athletic Performance',
    goals: ['muscle building', 'performance enhancement', 'recovery'],
    preferences: ['natural', 'third-party tested'],
    restrictions: ['gluten-free'],
    searchTerms: [
      'whey protein powder muscle building',
      'creatine monohydrate performance',
      'BCAA recovery athletic',
      'pre workout natural',
      'glutamine recovery',
      'beta alanine endurance'
    ],
    categories: ['Health & Personal Care', 'Sports & Outdoors']
  },
  
  // Weight Management Archetype
  {
    archetype: 'Weight Management',
    goals: ['fat loss', 'appetite control', 'metabolism boost'],
    preferences: ['natural', 'stimulant-free'],
    restrictions: ['vegan', 'non-GMO'],
    searchTerms: [
      'green tea extract weight loss',
      'garcinia cambogia natural',
      'CLA fat burner',
      'L-carnitine metabolism',
      'fiber supplement appetite',
      'thermogenic natural'
    ],
    categories: ['Health & Personal Care']
  },
  
  // General Wellness Archetype
  {
    archetype: 'General Wellness',
    goals: ['immune support', 'energy', 'overall health'],
    preferences: ['organic', 'whole food based'],
    restrictions: ['vegetarian'],
    searchTerms: [
      'multivitamin organic whole food',
      'vitamin D3 immune support',
      'omega 3 fish oil',
      'probiotics digestive health',
      'vitamin C immune',
      'magnesium energy'
    ],
    categories: ['Health & Personal Care']
  },
  
  // Cognitive Enhancement Archetype
  {
    archetype: 'Cognitive Enhancement',
    goals: ['focus', 'memory', 'brain health'],
    preferences: ['nootropic', 'research-backed'],
    restrictions: ['caffeine-free'],
    searchTerms: [
      'lion\'s mane mushroom cognitive',
      'bacopa monnieri memory',
      'rhodiola rosea focus',
      'phosphatidylserine brain health',
      'ginkgo biloba cognitive',
      'acetyl l-carnitine brain'
    ],
    categories: ['Health & Personal Care']
  },
  
  // Recovery & Sleep Archetype
  {
    archetype: 'Recovery & Sleep',
    goals: ['better sleep', 'stress relief', 'recovery'],
    preferences: ['natural', 'non-habit forming'],
    restrictions: ['melatonin-free'],
    searchTerms: [
      'magnesium glycinate sleep',
      'ashwagandha stress relief',
      'valerian root natural sleep',
      'l-theanine relaxation',
      'chamomile tea sleep',
      'GABA supplement calm'
    ],
    categories: ['Health & Personal Care']
  },
  
  // Joint & Bone Health Archetype
  {
    archetype: 'Joint & Bone Health',
    goals: ['joint support', 'bone health', 'mobility'],
    preferences: ['glucosamine', 'anti-inflammatory'],
    restrictions: ['shellfish-free'],
    searchTerms: [
      'glucosamine chondroitin joint',
      'turmeric curcumin inflammation',
      'collagen peptides bone health',
      'MSM joint support',
      'calcium magnesium bone',
      'boswellia joint mobility'
    ],
    categories: ['Health & Personal Care']
  }
];

/**
 * AWS Signature Version 4 implementation for Amazon Product API
 */
class AWSSignatureV4 {
  private accessKey: string;
  private secretKey: string;
  private region: string;
  private service: string;

  constructor(credentials: AmazonCredentials) {
    this.accessKey = credentials.accessKey;
    this.secretKey = credentials.secretKey;
    this.region = credentials.region;
    this.service = 'ProductAdvertisingAPI';
  }

  private getSignatureKey(dateStamp: string): Buffer {
    const kDate = crypto.createHmac('sha256', `AWS4${this.secretKey}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(this.region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(this.service).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    return kSigning;
  }

  sign(request: any): Record<string, string> {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);

    const canonicalUri = '/paapi5/searchitems';
    const canonicalQuerystring = '';
    const canonicalHeaders = `host:${AMAZON_CONFIG.host}\nx-amz-date:${amzDate}\nx-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems\n`;
    const signedHeaders = 'host;x-amz-date;x-amz-target';
    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(request)).digest('hex');

    const canonicalRequest = `POST\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${this.region}/${this.service}/aws4_request`;
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

    const signingKey = this.getSignatureKey(dateStamp);
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    const authorizationHeader = `${algorithm} Credential=${this.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
      'Authorization': authorizationHeader,
      'X-Amz-Date': amzDate,
      'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
      'Content-Type': 'application/json; charset=utf-8',
      'Host': AMAZON_CONFIG.host
    };
  }
}

/**
 * Amazon Product API Client
 */
class AmazonProductAPI {
  private signer: AWSSignatureV4;
  private baseUrl: string;

  constructor() {
    this.signer = new AWSSignatureV4(AMAZON_CONFIG);
    this.baseUrl = `https://${AMAZON_CONFIG.host}/paapi5`;
  }

  private async makeRequest(operation: string, payload: any): Promise<any> {
    const headers = this.signer.sign(payload);
    
    try {
      const response = await fetch(`${this.baseUrl}/${operation.toLowerCase()}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Amazon API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Amazon API Request Failed:', error);
      throw error;
    }
  }

  async searchItems(searchRequest: ProductSearchRequest): Promise<AmazonProduct[]> {
    const payload: any = {
      Keywords: searchRequest.keywords,
      SearchIndex: searchRequest.searchIndex,
      PartnerTag: AMAZON_CONFIG.associateTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.com',
      ItemCount: searchRequest.itemCount || 10,
      Resources: [
        'Images.Primary.Large',
        'Images.Variants.Large',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.ProductInfo',
        'ItemInfo.TechnicalInfo',
        'Offers.Listings.Price',
        'Offers.Listings.DeliveryInfo',
        'Offers.Summaries.HighestPrice',
        'Offers.Summaries.LowestPrice'
      ]
    };

    // Add optional filters
    if (searchRequest.browseNodeId) {
      payload.BrowseNodeId = searchRequest.browseNodeId;
    }

    if (searchRequest.minPrice || searchRequest.maxPrice) {
      payload.MinPrice = searchRequest.minPrice;
      payload.MaxPrice = searchRequest.maxPrice;
    }

    const response = await this.makeRequest('SearchItems', payload);
    
    if (!response.SearchResult?.Items) {
      return [];
    }

    return response.SearchResult.Items.map((item: any) => this.parseAmazonItem(item));
  }

  private parseAmazonItem(item: any): AmazonProduct {
    const images = {
      primary: item.Images?.Primary?.Large?.URL || '',
      variants: item.Images?.Variants?.map((v: any) => v.Large?.URL).filter(Boolean) || []
    };

    const price = item.Offers?.Listings?.[0]?.Price || item.Offers?.Summaries?.[0]?.LowestPrice;
    
    return {
      asin: item.ASIN,
      title: item.ItemInfo?.Title?.DisplayValue || '',
      brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || '',
      price: {
        amount: price?.Amount || 0,
        currency: price?.Currency || 'USD',
        displayAmount: price?.DisplayAmount || '$0.00'
      },
      images,
      affiliateUrl: `https://www.amazon.com/dp/${item.ASIN}?tag=${AMAZON_CONFIG.associateTag}`,
      category: item.BrowseNodeInfo?.BrowseNodes?.[0]?.DisplayName || '',
      rating: item.CustomerReviews?.StarRating?.Value || 0,
      reviewCount: item.CustomerReviews?.Count || 0,
      availability: item.Offers?.Listings?.[0]?.Availability?.Type || 'Unknown',
      features: item.ItemInfo?.Features?.DisplayValues || []
    };
  }
}

/**
 * Supplement Database Populator
 */
class SupplementDatabasePopulator {
  private amazonAPI: AmazonProductAPI;
  private products: Map<string, AmazonProduct[]> = new Map();

  constructor() {
    this.amazonAPI = new AmazonProductAPI();
  }

  async populateDatabase(): Promise<void> {
    console.log('🚀 Starting comprehensive Amazon product database population...');
    console.log(`📊 Processing ${SUPPLEMENT_COMBINATIONS.length} customer archetypes`);

    for (const combination of SUPPLEMENT_COMBINATIONS) {
      console.log(`\n🎯 Processing archetype: ${combination.archetype}`);
      await this.processArchetype(combination);
      
      // Rate limiting - Amazon API allows 1 request per second for new accounts
      await this.delay(1000);
    }

    await this.generateReport();
    await this.saveToDatabase();
  }

  private async processArchetype(combination: SupplementCombination): Promise<void> {
    const archetypeProducts: AmazonProduct[] = [];

    for (const searchTerm of combination.searchTerms) {
      console.log(`  🔍 Searching: "${searchTerm}"`);
      
      try {
        const searchRequest: ProductSearchRequest = {
          keywords: searchTerm,
          searchIndex: 'HealthPersonalCare',
          itemCount: 5, // Limit to top 5 products per search to manage API quotas
          minPrice: 500, // $5 minimum to filter out low-quality products
          maxPrice: 15000 // $150 maximum for reasonable supplement pricing
        };

        const products = await this.amazonAPI.searchItems(searchRequest);
        
        // Filter for quality products
        const qualityProducts = products.filter(product => {
          return product.images.primary && 
                 product.title.length > 10 &&
                 product.price.amount > 0 &&
                 product.brand;
        });

        archetypeProducts.push(...qualityProducts);
        console.log(`    ✅ Found ${qualityProducts.length} quality products`);

        // Rate limiting between searches
        await this.delay(1000);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`    ❌ Error searching "${searchTerm}":`, errorMessage);
      }
    }

    // Remove duplicates based on ASIN
    const uniqueProducts = this.removeDuplicates(archetypeProducts);
    this.products.set(combination.archetype, uniqueProducts);
    
    console.log(`  📦 Total unique products for ${combination.archetype}: ${uniqueProducts.length}`);
  }

  private removeDuplicates(products: AmazonProduct[]): AmazonProduct[] {
    const seen = new Set<string>();
    return products.filter(product => {
      if (seen.has(product.asin)) {
        return false;
      }
      seen.add(product.asin);
      return true;
    });
  }

  private async generateReport(): Promise<void> {
    console.log('\n📊 COMPREHENSIVE PRODUCT DISCOVERY REPORT');
    console.log('='.repeat(50));
    
    let totalProducts = 0;
    let totalWithImages = 0;
    
    for (const [archetype, products] of this.products) {
      const withImages = products.filter(p => p.images.primary).length;
      totalProducts += products.length;
      totalWithImages += withImages;
      
      console.log(`\n${archetype}:`);
      console.log(`  📦 Products found: ${products.length}`);
      console.log(`  🖼️  With images: ${withImages}`);
      console.log(`  💰 Price range: $${Math.min(...products.map(p => p.price.amount / 100)).toFixed(2)} - $${Math.max(...products.map(p => p.price.amount / 100)).toFixed(2)}`);
      
      // Show sample products
      console.log(`  🏆 Top products:`);
      products.slice(0, 3).forEach((product, index) => {
        console.log(`    ${index + 1}. ${product.title.substring(0, 50)}... - ${product.price.displayAmount}`);
      });
    }
    
    console.log(`\n🎯 SUMMARY:`);
    console.log(`  Total products discovered: ${totalProducts}`);
    console.log(`  Products with valid images: ${totalWithImages}`);
    console.log(`  Coverage percentage: ${((totalWithImages / totalProducts) * 100).toFixed(1)}%`);
  }

  private async saveToDatabase(): Promise<void> {
    console.log('\n💾 Saving products to cached stack service...');
    
    // Generate the updated cached stack service file
    const serviceCode = this.generateCachedStackService();
    
    // Write to file
    const fs = await import('fs/promises');
    await fs.writeFile(
      'c:/repo/NutriWiseAI/src/lib/cached-stack-service-updated.ts',
      serviceCode,
      'utf-8'
    );
    
    console.log('✅ Updated cached stack service generated successfully!');
    console.log('📁 File saved as: src/lib/cached-stack-service-updated.ts');
    console.log('\n🔄 Next steps:');
    console.log('1. Review the generated file');
    console.log('2. Replace the current cached-stack-service.ts');
    console.log('3. Test the integration');
  }

  private generateCachedStackService(): string {
    const allProducts: AmazonProduct[] = [];
    for (const products of this.products.values()) {
      allProducts.push(...products);
    }

    const supplements = allProducts.map((product, index) => {
      const archetype = this.findArchetypeForProduct(product);
      return {
        id: `supplement_${index + 1}`,
        name: product.title.length > 50 ? product.title.substring(0, 50) + '...' : product.title,
        brand: product.brand,
        type: this.inferSupplementType(product.title),
        imageUrl: product.images.primary,
        price: product.price.displayAmount,
        affiliateUrl: product.affiliateUrl,
        amazonUrl: `https://www.amazon.com/dp/${product.asin}`,
        rating: product.rating,
        reviewCount: product.reviewCount,
        features: product.features.slice(0, 3),
        category: archetype,
        verified: true,
        lastUpdated: new Date().toISOString()
      };
    });

    return `/**
 * Enhanced Cached Stack Service with Real Amazon Products
 * Generated on: ${new Date().toISOString()}
 * Total products: ${supplements.length}
 * Data source: Amazon Product Advertising API 5.0
 */

export interface CachedSupplement {
  id: string;
  name: string;
  brand: string;
  type: string;
  imageUrl: string;
  price: string;
  affiliateUrl: string;
  amazonUrl: string;
  rating: number;
  reviewCount: number;
  features: string[];
  category: string;
  verified: boolean;
  lastUpdated: string;
}

export const VERIFIED_SUPPLEMENTS: CachedSupplement[] = ${JSON.stringify(supplements, null, 2)};

export class CachedStackService {
  static getRecommendations(archetype: string, goals: string[] = []): CachedSupplement[] {
    // Filter supplements by archetype and goals
    return VERIFIED_SUPPLEMENTS.filter(supplement => {
      const matchesArchetype = supplement.category === archetype;
      const matchesGoals = goals.length === 0 || goals.some(goal => 
        supplement.name.toLowerCase().includes(goal.toLowerCase()) ||
        supplement.features.some(feature => 
          feature.toLowerCase().includes(goal.toLowerCase())
        )
      );
      
      return matchesArchetype && matchesGoals;
    }).slice(0, 6); // Return top 6 recommendations
  }

  static getSupplementById(id: string): CachedSupplement | undefined {
    return VERIFIED_SUPPLEMENTS.find(supplement => supplement.id === id);
  }

  static getAllArchetypes(): string[] {
    return [...new Set(VERIFIED_SUPPLEMENTS.map(s => s.category))];
  }

  static getSupplementsByType(type: string): CachedSupplement[] {
    return VERIFIED_SUPPLEMENTS.filter(supplement => 
      supplement.type.toLowerCase().includes(type.toLowerCase())
    );
  }

  static searchSupplements(query: string): CachedSupplement[] {
    const searchTerm = query.toLowerCase();
    return VERIFIED_SUPPLEMENTS.filter(supplement =>
      supplement.name.toLowerCase().includes(searchTerm) ||
      supplement.brand.toLowerCase().includes(searchTerm) ||
      supplement.type.toLowerCase().includes(searchTerm) ||
      supplement.features.some(feature => 
        feature.toLowerCase().includes(searchTerm)
      )
    );
  }

  static getVerificationStats() {
    const total = VERIFIED_SUPPLEMENTS.length;
    const withImages = VERIFIED_SUPPLEMENTS.filter(s => s.imageUrl).length;
    const withRatings = VERIFIED_SUPPLEMENTS.filter(s => s.rating > 0).length;
    const lastUpdated = Math.max(...VERIFIED_SUPPLEMENTS.map(s => new Date(s.lastUpdated).getTime()));

    return {
      totalProducts: total,
      withValidImages: withImages,
      withCustomerRatings: withRatings,
      coveragePercentage: ((withImages / total) * 100).toFixed(1),
      lastDataUpdate: new Date(lastUpdated).toISOString(),
      archetypes: this.getAllArchetypes()
    };
  }
}`;
  }

  private findArchetypeForProduct(product: AmazonProduct): string {
    for (const [archetype, products] of this.products) {
      if (products.includes(product)) {
        return archetype;
      }
    }
    return 'General Wellness';
  }

  private inferSupplementType(title: string): string {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('protein')) return 'Protein';
    if (titleLower.includes('creatine')) return 'Creatine';
    if (titleLower.includes('vitamin')) return 'Vitamin';
    if (titleLower.includes('omega') || titleLower.includes('fish oil')) return 'Omega-3';
    if (titleLower.includes('probiotic')) return 'Probiotic';
    if (titleLower.includes('magnesium')) return 'Mineral';
    if (titleLower.includes('bcaa')) return 'Amino Acid';
    if (titleLower.includes('pre workout') || titleLower.includes('pre-workout')) return 'Pre-Workout';
    if (titleLower.includes('multivitamin')) return 'Multivitamin';
    if (titleLower.includes('collagen')) return 'Collagen';
    if (titleLower.includes('turmeric') || titleLower.includes('curcumin')) return 'Anti-Inflammatory';
    if (titleLower.includes('ashwagandha')) return 'Adaptogen';
    if (titleLower.includes('melatonin')) return 'Sleep Support';
    
    return 'Supplement';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution function
async function main() {
  try {
    // Validate credentials
    if (!AMAZON_CONFIG.accessKey || !AMAZON_CONFIG.secretKey || !AMAZON_CONFIG.associateTag) {
      console.error('❌ Missing Amazon API credentials!');
      console.log('Please set the following environment variables:');
      console.log('- AMAZON_ACCESS_KEY');
      console.log('- AMAZON_SECRET_KEY'); 
      console.log('- AMAZON_ASSOCIATE_TAG');
      process.exit(1);
    }

    const populator = new SupplementDatabasePopulator();
    await populator.populateDatabase();
    
    console.log('\n🎉 Database population completed successfully!');
    
  } catch (error) {
    console.error('💥 Fatal error during database population:', error);
    process.exit(1);
  }
}

// Export for use in other modules
export {
  AmazonProductAPI,
  SupplementDatabasePopulator,
  SUPPLEMENT_COMBINATIONS,
  type AmazonProduct,
  type SupplementCombination
};

// Run if called directly
if (require.main === module) {
  main();
}
