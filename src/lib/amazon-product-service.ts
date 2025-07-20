// Amazon Product Service
// Real-time Amazon product data integration

import { ExtendedUserProfile } from './types';

export interface AmazonProduct {
  asin: string;
  title: string;
  brand: string;
  price: {
    current: number;
    list: number;
    savings: number;
    currency: string;
  };
  rating: {
    average: number;
    count: number;
  };
  images: {
    primary: string;
    variants: string[];
  };
  availability: {
    inStock: boolean;
    primeEligible: boolean;
    deliveryInfo: string;
  };
  features: string[];
  specifications: {
    servings: number;
    dosagePerServing: string;
    ingredients: string[];
  };
  affiliateUrl: string;
  qualityScore: number;
  valueScore: number;
  // Enhanced image data
  realImageUrl?: string;
  imageVerified?: boolean;
}

export interface ProductRecommendation {
  supplement: {
    name: string;
    dosage: string;
    form: string;
    timing: string;
    reasoning: string;
  };
  amazonProducts: AmazonProduct[];
  aiScore: number;
  qualityFactors: {
    thirdPartyTested: boolean;
    gmpCertified: boolean;
    organicCertified: boolean;
    allergenFree: boolean;
    bioavailableForm: boolean;
  };
  priceAnalysis: {
    bestValue: AmazonProduct;
    cheapest: AmazonProduct;
    premium: AmazonProduct;
    costPerServing: number;
  };
}

export interface UserPreferences {
  budget: number;
  dietaryRestrictions: string[];
  preferredBrands: string[];
  avoidIngredients: string[];
  supplementForm: 'capsule' | 'tablet' | 'powder' | 'liquid' | 'any';
  primeRequired: boolean;
  qualityPriority: 'price' | 'quality' | 'balanced';
}

export class AmazonProductService {
  private associateTag: string = 'nutriwiseai-20';
  private productDatabase: Map<string, AmazonProduct[]> = new Map();
  private trustedBrands: Map<string, number> = new Map();
  private qualityKeywords: string[] = [];

  constructor() {
    this.initializeProductDatabase();
    this.initializeTrustedBrands();
    this.initializeQualityKeywords();
  }

  /**
   * Extract real product image from Amazon using ASIN
   */
  async extractRealProductImage(asin: string): Promise<string | null> {
    try {
      console.log(`🖼️ Extracting real product image for ASIN: ${asin}`);
      
      // Amazon's predictable image URL patterns
      const imageUrlPatterns = [
        `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.L.jpg`,
        `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SL1500_.jpg`,
        `https://m.media-amazon.com/images/P/${asin}.01._SL1500_.jpg`,
        `https://images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`,
        `https://ec1.images-amazon.com/images/P/${asin}.01.L.jpg`,
      ];
      
      // Test each URL pattern to find a working image
      for (const imageUrl of imageUrlPatterns) {
        const isWorking = await this.testImageAvailability(imageUrl);
        if (isWorking) {
          console.log(`✅ Found working image URL: ${imageUrl}`);
          return imageUrl;
        }
      }
      
      console.log(`❌ No working image found for ASIN: ${asin}`);
      return null;
      
    } catch (error) {
      console.error(`❌ Error extracting image for ASIN ${asin}:`, error);
      return null;
    }
  }

  /**
   * Test if an image URL is accessible
   */
  private async testImageAvailability(imageUrl: string): Promise<boolean> {
    try {
      return new Promise((resolve) => {
        const img = new Image();
        const timeout = setTimeout(() => {
          console.log(`⏰ Image test timeout: ${imageUrl}`);
          resolve(false);
        }, 2000); // 2 second timeout
        
        img.onload = () => {
          clearTimeout(timeout);
          console.log(`✅ Image accessible: ${imageUrl}`);
          resolve(true);
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          console.log(`❌ Image not accessible: ${imageUrl}`);
          resolve(false);
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.error(`❌ Error testing image URL: ${imageUrl}`, error);
      return false;
    }
  }

  /**
   * Get enhanced product with real verified image
   */
  async getProductWithRealImage(asin: string, supplementName: string): Promise<AmazonProduct | null> {
    try {
      console.log(`Fetching product with real image - ASIN: ${asin}, Name: ${supplementName}`);

      // Extract real image
      const realImageUrl = await this.extractRealProductImage(asin);

      // Get base product data
      const baseProduct = this.createProductFromASIN(asin, supplementName);

      if (baseProduct) {
        // Enhanced with real image data
        baseProduct.realImageUrl = realImageUrl || undefined;
        baseProduct.imageVerified = !!realImageUrl;

        if (realImageUrl) {
          baseProduct.images.primary = realImageUrl;
          console.log(`Enhanced product with real image: ${supplementName}`);
        } else {
          console.log(`No real image found for ASIN: ${asin}`);
        }

        return baseProduct;
      } else {
        console.log(`No base product found for ASIN: ${asin}`);
      }

      return null;
    } catch (error) {
      console.error(`Error fetching product with real image:`, error);
      return null;
    }
  }

  /**
   * Create a product object from ASIN and supplement name
   */
  private createProductFromASIN(asin: string, supplementName: string): AmazonProduct {
    console.log(`Creating product from ASIN: ${asin}, Name: ${supplementName}`);
    // Mock fallback logic for demo purposes
    return {
      asin,
      title: supplementName,
      brand: 'Generic Brand',
      price: {
        current: 0,
        list: 0,
        savings: 0,
        currency: 'USD',
      },
      rating: {
        average: 0,
        count: 0,
      },
      images: {
        primary: '',
        variants: [],
      },
      availability: {
        inStock: false,
        primeEligible: false,
        deliveryInfo: '',
      },
      features: [],
      specifications: {
        servings: 0,
        dosagePerServing: '',
        ingredients: [],
      },
      affiliateUrl: '',
      qualityScore: 0,
      valueScore: 0,
    };
  }

  async findOptimalSupplementProducts(
    supplementName: string,
    dosage: string,
    userPreferences: UserPreferences
  ): Promise<ProductRecommendation> {
    
    // 1. Get product candidates
    const candidates = await this.getProductCandidates(supplementName);
    
    // 2. Filter by user preferences
    const filtered = this.filterByUserPreferences(candidates, userPreferences);
    
    // 3. Score and rank products
    const rankedProducts = this.rankProducts(filtered, userPreferences);
    
    // 4. Analyze pricing
    const priceAnalysis = this.analyzePricing(rankedProducts, dosage);
    
    // 5. Assess quality factors
    const qualityFactors = this.assessQualityFactors(rankedProducts[0]);
    
    return {
      supplement: {
        name: supplementName,
        dosage: dosage,
        form: this.determineBestForm(rankedProducts, userPreferences),
        timing: this.getOptimalTiming(supplementName),
        reasoning: this.generateRecommendationReasoning(rankedProducts[0], supplementName)
      },
      amazonProducts: rankedProducts.slice(0, 3),
      aiScore: this.calculateAIScore(rankedProducts[0]),
      qualityFactors,
      priceAnalysis
    };
  }

  private async getProductCandidates(supplementName: string): Promise<AmazonProduct[]> {
    // Check if we have cached products
    if (this.productDatabase.has(supplementName)) {
      return this.productDatabase.get(supplementName) || [];
    }

    // For demo purposes, return mock products based on supplement name
    // In production, this would call Amazon PA-API
    const mockProducts = this.generateMockProducts(supplementName);
    this.productDatabase.set(supplementName, mockProducts);
    
    return mockProducts;
  }

  private generateMockProducts(supplementName: string): AmazonProduct[] {
    const baseProducts = [
      {
        asin: this.getASINForSupplement(supplementName),
        title: `Premium ${supplementName} - High Potency`,
        brand: this.getBrandForSupplement(supplementName),
        price: {
          current: this.getPriceForSupplement(supplementName),
          list: this.getPriceForSupplement(supplementName) * 1.2,
          savings: this.getPriceForSupplement(supplementName) * 0.2,
          currency: 'USD'
        },
        rating: {
          average: 4.5,
          count: 2847
        },
        images: {
          primary: this.getImageForSupplement(supplementName),
          variants: []
        },
        availability: {
          inStock: true,
          primeEligible: true,
          deliveryInfo: '2-day delivery'
        },
        features: this.getFeaturesForSupplement(supplementName),
        specifications: {
          servings: 60,
          dosagePerServing: this.getDosageForSupplement(supplementName),
          ingredients: [supplementName]
        },
        affiliateUrl: `https://www.amazon.com/dp/${this.getASINForSupplement(supplementName)}?tag=${this.associateTag}`,
        qualityScore: 0.9,
        valueScore: 0.8
      },
      {
        asin: this.getASINForSupplement(supplementName) + '2',
        title: `${supplementName} - Doctor Recommended`,
        brand: this.getAlternateBrandForSupplement(supplementName),
        price: {
          current: this.getPriceForSupplement(supplementName) * 1.3,
          list: this.getPriceForSupplement(supplementName) * 1.5,
          savings: this.getPriceForSupplement(supplementName) * 0.2,
          currency: 'USD'
        },
        rating: {
          average: 4.7,
          count: 1923
        },
        images: {
          primary: this.getImageForSupplement(supplementName),
          variants: []
        },
        availability: {
          inStock: true,
          primeEligible: true,
          deliveryInfo: '2-day delivery'
        },
        features: this.getPremiumFeaturesForSupplement(supplementName),
        specifications: {
          servings: 90,
          dosagePerServing: this.getDosageForSupplement(supplementName),
          ingredients: [supplementName]
        },
        affiliateUrl: `https://www.amazon.com/dp/${this.getASINForSupplement(supplementName)}2?tag=${this.associateTag}`,
        qualityScore: 0.95,
        valueScore: 0.85
      },
      {
        asin: this.getASINForSupplement(supplementName) + '3',
        title: `${supplementName} - Budget Option`,
        brand: 'Nature\'s Bounty',
        price: {
          current: this.getPriceForSupplement(supplementName) * 0.7,
          list: this.getPriceForSupplement(supplementName) * 0.8,
          savings: this.getPriceForSupplement(supplementName) * 0.1,
          currency: 'USD'
        },
        rating: {
          average: 4.2,
          count: 5673
        },
        images: {
          primary: this.getImageForSupplement(supplementName),
          variants: []
        },
        availability: {
          inStock: true,
          primeEligible: true,
          deliveryInfo: '2-day delivery'
        },
        features: this.getBasicFeaturesForSupplement(supplementName),
        specifications: {
          servings: 100,
          dosagePerServing: this.getDosageForSupplement(supplementName),
          ingredients: [supplementName]
        },
        affiliateUrl: `https://www.amazon.com/dp/${this.getASINForSupplement(supplementName)}3?tag=${this.associateTag}`,
        qualityScore: 0.7,
        valueScore: 0.9
      }
    ];

    return baseProducts;
  }

  private filterByUserPreferences(products: AmazonProduct[], preferences: UserPreferences): AmazonProduct[] {
    return products.filter(product => {
      // Budget filter
      if (product.price.current > preferences.budget) return false;
      
      // Prime filter
      if (preferences.primeRequired && !product.availability.primeEligible) return false;
      
      // Brand preference
      if (preferences.preferredBrands.length > 0) {
        const matchesBrand = preferences.preferredBrands.some(brand => 
          product.brand.toLowerCase().includes(brand.toLowerCase())
        );
        if (!matchesBrand) return false;
      }
      
      // Dietary restrictions
      if (preferences.dietaryRestrictions.includes('vegan')) {
        const isVegan = product.features.some(feature => 
          feature.toLowerCase().includes('vegan')
        );
        if (!isVegan) return false;
      }
      
      // Avoid ingredients
      const hasAvoidedIngredients = preferences.avoidIngredients.some(ingredient =>
        product.features.some(feature => 
          feature.toLowerCase().includes(ingredient.toLowerCase())
        )
      );
      if (hasAvoidedIngredients) return false;
      
      return true;
    });
  }

  private rankProducts(products: AmazonProduct[], preferences: UserPreferences): AmazonProduct[] {
    return products.map(product => {
      let score = 0;
      
      // Quality score (40%)
      score += product.qualityScore * 0.4;
      
      // Rating score (30%)
      score += (product.rating.average / 5) * 0.3;
      
      // Value score (20%)
      score += product.valueScore * 0.2;
      
      // Review count score (10%)
      score += Math.min(product.rating.count / 5000, 1) * 0.1;
      
      // Adjust based on user priority
      if (preferences.qualityPriority === 'price') {
        score += (1 - (product.price.current / Math.max(...products.map(p => p.price.current)))) * 0.3;
      } else if (preferences.qualityPriority === 'quality') {
        score += product.qualityScore * 0.3;
      }
      
      return {
        ...product,
        finalScore: score
      };
    })
    .sort((a, b) => (b as any).finalScore - (a as any).finalScore);
  }

  private analyzePricing(products: AmazonProduct[], dosage: string): any {
    const priceAnalysis = products.map(product => {
      const costPerServing = product.specifications.servings > 0 
        ? product.price.current / product.specifications.servings 
        : product.price.current;
      
      return {
        ...product,
        costPerServing
      };
    });

    return {
      bestValue: priceAnalysis.reduce((best, current) => 
        current.valueScore > best.valueScore ? current : best
      ),
      cheapest: priceAnalysis.reduce((cheapest, current) => 
        current.costPerServing < cheapest.costPerServing ? current : cheapest
      ),
      premium: priceAnalysis.reduce((premium, current) => 
        current.qualityScore > premium.qualityScore ? current : premium
      ),
      costPerServing: priceAnalysis.reduce((sum, p) => sum + p.costPerServing, 0) / priceAnalysis.length
    };
  }

  private assessQualityFactors(product: AmazonProduct): any {
    const features = product.features.join(' ').toLowerCase();
    
    return {
      thirdPartyTested: features.includes('third party tested') || features.includes('lab tested'),
      gmpCertified: features.includes('gmp certified') || features.includes('gmp'),
      organicCertified: features.includes('organic') || features.includes('usda organic'),
      allergenFree: features.includes('allergen free') || features.includes('gluten free'),
      bioavailableForm: features.includes('bioavailable') || features.includes('chelated') || features.includes('methylated')
    };
  }

  private determineBestForm(products: AmazonProduct[], preferences: UserPreferences): string {
    if (preferences.supplementForm !== 'any') {
      return preferences.supplementForm;
    }
    
    // Analyze product titles to determine most common form
    const forms = ['capsule', 'tablet', 'powder', 'liquid', 'gummy'];
    const formCounts = forms.map(form => ({
      form,
      count: products.filter(p => p.title.toLowerCase().includes(form)).length
    }));
    
    const mostCommon = formCounts.reduce((max, current) => 
      current.count > max.count ? current : max
    );
    
    return mostCommon.form || 'capsule';
  }

  private getOptimalTiming(supplementName: string): string {
    const timingMap: { [key: string]: string } = {
      'magnesium': 'Before bed with food',
      'vitamin d': 'With breakfast (contains fat)',
      'omega-3': 'With meals to enhance absorption',
      'probiotics': 'On empty stomach, 30 minutes before meals',
      'protein': 'Post-workout or between meals',
      'multivitamin': 'With breakfast',
      'ashwagandha': 'With breakfast or dinner',
      'coq10': 'With breakfast (contains fat)',
      'zinc': 'On empty stomach (or with food if upset stomach)',
      'iron': 'On empty stomach with vitamin C',
      'b12': 'With breakfast',
      'creatine': 'Anytime, with or without food'
    };
    
    const lowerName = supplementName.toLowerCase();
    for (const [key, timing] of Object.entries(timingMap)) {
      if (lowerName.includes(key)) {
        return timing;
      }
    }
    
    return 'With food to enhance absorption';
  }

  private generateRecommendationReasoning(product: AmazonProduct, supplementName: string): string {
    const reasons = [];
    
    if (product.rating.average >= 4.5) {
      reasons.push(`Highly rated (${product.rating.average}/5 stars)`);
    }
    
    if (product.rating.count >= 1000) {
      reasons.push(`Extensively reviewed (${product.rating.count.toLocaleString()} reviews)`);
    }
    
    if (product.availability.primeEligible) {
      reasons.push('Prime eligible for fast delivery');
    }
    
    if (product.qualityScore >= 0.9) {
      reasons.push('Premium quality with third-party testing');
    }
    
    if (product.price.savings > 0) {
      reasons.push(`Save $${product.price.savings.toFixed(2)} from list price`);
    }
    
    const brandScore = this.trustedBrands.get(product.brand) || 0;
    if (brandScore >= 85) {
      reasons.push('From trusted, high-quality brand');
    }
    
    return reasons.length > 0 
      ? `Top choice: ${reasons.join(', ')}.`
      : `Quality ${supplementName} supplement from reputable brand.`;
  }

  private calculateAIScore(product: AmazonProduct): number {
    const score = (product.qualityScore * 0.4) + 
                  (product.rating.average / 5 * 0.3) + 
                  (product.valueScore * 0.3);
    return Math.round(score * 100);
  }

  // Helper methods for mock data generation
  private getASINForSupplement(name: string): string {
    const asinMap: { [key: string]: string } = {
      'Omega-3 Fish Oil': 'B00CAZAU62',
      'Magnesium Glycinate': 'B00YQZQH32',
      'Vitamin D3': 'B000FGDIAI',
      'Whey Protein Isolate': 'B000QSNYGI',
      'Creatine Monohydrate': 'B002DYIZEO',
      'Probiotics': 'B00JEKYNZA',
      'Multivitamin': 'B00280EAW0',
      'Ashwagandha KSM-66': 'B078SZ5YTV',
      'CoQ10 Ubiquinol': 'B004U5II8E',
      'Lion\'s Mane Mushroom': 'B073WSQV5L',
      'Zinc Bisglycinate': 'B00020IGNQ',
      'Iron Bisglycinate': 'B00020IGNY',
      'B12 Methylcobalamin': 'B00020IGNG'
    };
    
    return asinMap[name] || 'B00EXAMPLE';
  }

  private getBrandForSupplement(name: string): string {
    const brandMap: { [key: string]: string } = {
      'Omega-3 Fish Oil': 'Nordic Naturals',
      'Magnesium Glycinate': 'Doctor\'s Best',
      'Vitamin D3': 'NOW Foods',
      'Whey Protein Isolate': 'Optimum Nutrition',
      'Creatine Monohydrate': 'Optimum Nutrition',
      'Probiotics': 'Garden of Life',
      'Multivitamin': 'Optimum Nutrition',
      'Ashwagandha KSM-66': 'Jarrow Formulas',
      'CoQ10 Ubiquinol': 'Qunol',
      'Lion\'s Mane Mushroom': 'Host Defense',
      'Zinc Bisglycinate': 'Thorne',
      'Iron Bisglycinate': 'Thorne',
      'B12 Methylcobalamin': 'Thorne'
    };
    
    return brandMap[name] || 'Premium Brand';
  }

  private getAlternateBrandForSupplement(name: string): string {
    const brandMap: { [key: string]: string } = {
      'Omega-3 Fish Oil': 'Life Extension',
      'Magnesium Glycinate': 'Thorne',
      'Vitamin D3': 'Thorne',
      'Whey Protein Isolate': 'Dymatize',
      'Creatine Monohydrate': 'Thorne',
      'Probiotics': 'Thorne',
      'Multivitamin': 'Thorne',
      'Ashwagandha KSM-66': 'Life Extension',
      'CoQ10 Ubiquinol': 'Life Extension',
      'Lion\'s Mane Mushroom': 'Life Extension',
      'Zinc Bisglycinate': 'Life Extension',
      'Iron Bisglycinate': 'Life Extension',
      'B12 Methylcobalamin': 'Life Extension'
    };
    
    return brandMap[name] || 'Doctor\'s Best';
  }

  private getPriceForSupplement(name: string): number {
    const priceMap: { [key: string]: number } = {
      'Omega-3 Fish Oil': 24.99,
      'Magnesium Glycinate': 19.99,
      'Vitamin D3': 14.99,
      'Whey Protein Isolate': 54.99,
      'Creatine Monohydrate': 29.99,
      'Probiotics': 28.99,
      'Multivitamin': 29.99,
      'Ashwagandha KSM-66': 22.99,
      'CoQ10 Ubiquinol': 34.99,
      'Lion\'s Mane Mushroom': 26.99,
      'Zinc Bisglycinate': 12.99,
      'Iron Bisglycinate': 19.99,
      'B12 Methylcobalamin': 16.99
    };
    
    return priceMap[name] || 19.99;
  }

  private getDosageForSupplement(name: string): string {
    const dosageMap: { [key: string]: string } = {
      'Omega-3 Fish Oil': '1000mg EPA/DHA',
      'Magnesium Glycinate': '400mg',
      'Vitamin D3': '2000 IU',
      'Whey Protein Isolate': '25g',
      'Creatine Monohydrate': '5g',
      'Probiotics': '10 billion CFU',
      'Multivitamin': '1 tablet',
      'Ashwagandha KSM-66': '300mg',
      'CoQ10 Ubiquinol': '100mg',
      'Lion\'s Mane Mushroom': '500mg',
      'Zinc Bisglycinate': '15mg',
      'Iron Bisglycinate': '18mg',
      'B12 Methylcobalamin': '1000mcg'
    };
    
    return dosageMap[name] || '500mg';
  }

  private getImageForSupplement(name: string): string {
    const imageMap: { [key: string]: string } = {
      'Omega-3 Fish Oil': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5PbWVnYS0zPC90ZXh0Pgo8L3N2Zz4K',
      'Magnesium Glycinate': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5NYWduZXNpdW08L3RleHQ+Cjwvc3ZnPgo=',
      'Vitamin D3': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5WaXRhbWluIEQzPC90ZXh0Pgo8L3N2Zz4K',
      'Whey Protein Isolate': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5XaGV5IFByb3RlaW48L3RleHQ+Cjwvc3ZnPgo=',
      'Creatine Monohydrate': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5DcmVhdGluZTwvdGV4dD4KPHN2Zz4K',
      'Probiotics': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5Qcm9iaW90aWNzPC90ZXh0Pgo8L3N2Zz4K',
      'Multivitamin': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5NdWx0aXZpdGFtaW48L3RleHQ+Cjwvc3ZnPgo=',
      'Ashwagandha KSM-66': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5Bc2h3YWdhbmRoYTwvdGV4dD4KPHN2Zz4K',
      'CoQ10 Ubiquinol': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5Db1ExMDwvdGV4dD4KPHN2Zz4K',
      'B12 Methylcobalamin': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5CMTI8L3RleHQ+Cjwvc3ZnPgo='
    };
    
    return imageMap[name] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMjU2M2ViIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5TdXBwbGVtZW50PC90ZXh0Pgo8L3N2Zz4K';
  }

  private getFeaturesForSupplement(name: string): string[] {
    const baseFeatures = [
      'Third Party Tested',
      'GMP Certified',
      'Non-GMO',
      'Gluten Free',
      'Made in USA'
    ];
    
    const specificFeatures: { [key: string]: string[] } = {
      'Omega-3 Fish Oil': ['Molecularly Distilled', 'Mercury Free', 'Sustainable Fish'],
      'Magnesium Glycinate': ['Chelated Form', 'Highly Bioavailable', 'Gentle on Stomach'],
      'Vitamin D3': ['Cholecalciferol', 'Supports Immune System', 'Bone Health'],
      'Probiotics': ['Delayed Release', '10 Billion CFU', 'Shelf Stable'],
      'Ashwagandha KSM-66': ['Clinically Studied', 'Stress Support', 'Adaptogen'],
      'CoQ10 Ubiquinol': ['Reduced Form', 'Enhanced Absorption', 'Cardiovascular Support']
    };
    
    return [...baseFeatures, ...(specificFeatures[name] || [])];
  }

  private getPremiumFeaturesForSupplement(name: string): string[] {
    const premiumFeatures = [
      'Third Party Tested',
      'GMP Certified',
      'Non-GMO',
      'Gluten Free',
      'Made in USA',
      'USP Verified',
      'NSF Certified',
      'Organic',
      'Vegan',
      'Doctor Recommended'
    ];
    
    return premiumFeatures;
  }

  private getBasicFeaturesForSupplement(name: string): string[] {
    return [
      'GMP Certified',
      'Non-GMO',
      'Gluten Free',
      'Made in USA'
    ];
  }

  private initializeProductDatabase(): void {
    // Initialize with some cached products
    // In production, this would be populated from a database
  }

  private initializeTrustedBrands(): void {
    this.trustedBrands.set('Thorne', 95);
    this.trustedBrands.set('Life Extension', 92);
    this.trustedBrands.set('Jarrow Formulas', 90);
    this.trustedBrands.set('NOW Foods', 88);
    this.trustedBrands.set('Doctor\'s Best', 87);
    this.trustedBrands.set('Solgar', 85);
    this.trustedBrands.set('Nature Made', 83);
    this.trustedBrands.set('Kirkland', 82);
    this.trustedBrands.set('Garden of Life', 80);
    this.trustedBrands.set('New Chapter', 78);
    this.trustedBrands.set('Optimum Nutrition', 85);
    this.trustedBrands.set('Nordic Naturals', 90);
    this.trustedBrands.set('Qunol', 82);
    this.trustedBrands.set('Host Defense', 85);
  }

  private initializeQualityKeywords(): void {
    this.qualityKeywords = [
      'third party tested',
      'gmp certified',
      'nsf certified',
      'usp verified',
      'non-gmo',
      'organic',
      'gluten free',
      'allergen free',
      'bioavailable',
      'chelated',
      'methylated',
      'pharmaceutical grade',
      'clinically studied',
      'doctor recommended'
    ];
  }

  // Method to convert ExtendedUserProfile to UserPreferences
  mapUserProfileToPreferences(profile: ExtendedUserProfile): UserPreferences {
    return {
      budget: profile.budget || 100,
      dietaryRestrictions: this.extractDietaryRestrictions(profile),
      preferredBrands: [], // Could be added to profile later
      avoidIngredients: this.extractAvoidIngredients(profile),
      supplementForm: 'any',
      primeRequired: false,
      qualityPriority: 'balanced'
    };
  }

  private extractDietaryRestrictions(profile: ExtendedUserProfile): string[] {
    const restrictions = [];
    
    if (profile.diet === 'vegetarian') restrictions.push('vegetarian');
    if (profile.diet === 'vegan') restrictions.push('vegan');
    if (profile.otherCriteria?.includes('gluten')) restrictions.push('gluten-free');
    if (profile.otherCriteria?.includes('dairy')) restrictions.push('dairy-free');
    
    return restrictions;
  }

  private extractAvoidIngredients(profile: ExtendedUserProfile): string[] {
    const avoid = [];
    
    if (profile.otherCriteria?.includes('shellfish')) avoid.push('shellfish');
    if (profile.otherCriteria?.includes('soy')) avoid.push('soy');
    if (profile.otherCriteria?.includes('nuts')) avoid.push('nuts');
    
    return avoid;
  }
}

export const amazonProductService = new AmazonProductService();
