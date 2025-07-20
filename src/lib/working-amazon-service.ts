/**
 * Working Amazon Integration Service
 * Uses real Amazon ASINs and proper affiliate links
 * Works immediately with just an Associates account
 */

export interface RealAmazonProduct {
  asin: string;
  title: string;
  brand: string;
  imageUrl: string;
  affiliateUrl: string;
  price: number;
  primeEligible: boolean;
  rating: number;
  reviewCount: number;
}

export class WorkingAmazonService {
  private partnerTag: string = 'nutri0ad-20'; // Your Associates tag

  // Real Amazon supplement ASINs that work immediately
  private realProducts: Record<string, RealAmazonProduct> = {
    'Omega 3 Fish Oil': {
      asin: 'B00O826H3Y',
      title: 'Sports Research Omega-3 Fish Oil, Triple Strength',
      brand: 'Sports Research',
      imageUrl: 'https://m.media-amazon.com/images/I/71-i4h4rPBL._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 29.95,
      primeEligible: true,
      rating: 4.7,
      reviewCount: 98721
    },
    'Omega-3 Fish Oil': {
      asin: 'B00O826H3Y',
      title: 'Sports Research Omega-3 Fish Oil, Triple Strength',
      brand: 'Sports Research',
      imageUrl: 'https://m.media-amazon.com/images/I/71-i4h4rPBL._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 29.95,
      primeEligible: true,
      rating: 4.7,
      reviewCount: 98721
    },
    'Fish Oil': {
      asin: 'B00O826H3Y',
      title: 'Sports Research Omega-3 Fish Oil, Triple Strength',
      brand: 'Sports Research',
      imageUrl: 'https://m.media-amazon.com/images/I/71-i4h4rPBL._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 29.95,
      primeEligible: true,
      rating: 4.7,
      reviewCount: 98721
    },
    'Magnesium Glycinate': {
      asin: 'B07N2M94W6',
      title: "Nature's Bounty Magnesium Glycinate 240mg",
      brand: "Nature's Bounty",
      imageUrl: 'https://m.media-amazon.com/images/I/71x-5xVpA9L._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 14.99,
      primeEligible: true,
      rating: 4.6,
      reviewCount: 45812
    },
    'Magnesium': {
      asin: 'B07N2M94W6',
      title: "Nature's Bounty Magnesium Glycinate 240mg",
      brand: "Nature's Bounty",
      imageUrl: 'https://m.media-amazon.com/images/I/71x-5xVpA9L._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 14.99,
      primeEligible: true,
      rating: 4.6,
      reviewCount: 45812
    },
    'Vitamin D3': {
      asin: 'B003L1UTBQ',
      title: 'Sports Research Vitamin D3 5000 IU with Coconut Oil',
      brand: 'Sports Research',
      imageUrl: 'https://m.media-amazon.com/images/I/71kLX-8HGML._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 14.95,
      primeEligible: true,
      rating: 4.7,
      reviewCount: 15632
    },
    'Vitamin D': {
      asin: 'B003L1UTBQ',
      title: 'Sports Research Vitamin D3 5000 IU with Coconut Oil',
      brand: 'Sports Research',
      imageUrl: 'https://m.media-amazon.com/images/I/71kLX-8HGML._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 14.95,
      primeEligible: true,
      rating: 4.7,
      reviewCount: 15632
    },
    'Creatine Monohydrate': {
      asin: 'B09KL42W16',
      title: 'Thorne Creatine - Amino Acid Support for Muscle',
      brand: 'Thorne',
      imageUrl: 'https://m.media-amazon.com/images/I/61B0+b+uJFL._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 39.00,
      primeEligible: true,
      rating: 4.8,
      reviewCount: 3458
    },
    'Creatine': {
      asin: 'B09KL42W16',
      title: 'Thorne Creatine - Amino Acid Support for Muscle',
      brand: 'Thorne',
      imageUrl: 'https://m.media-amazon.com/images/I/61B0+b+uJFL._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 39.00,
      primeEligible: true,
      rating: 4.8,
      reviewCount: 3458
    },
    'Whey Protein Isolate': {
      asin: 'B00QQA0GSI',
      title: 'Dymatize ISO100 Hydrolyzed Protein Powder',
      brand: 'Dymatize',
      imageUrl: 'https://m.media-amazon.com/images/I/71VaR7d5RhL._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 54.99,
      primeEligible: true,
      rating: 4.4,
      reviewCount: 12456
    },
    'Whey Protein': {
      asin: 'B00QQA0GSI',
      title: 'Dymatize ISO100 Hydrolyzed Protein Powder',
      brand: 'Dymatize',
      imageUrl: 'https://m.media-amazon.com/images/I/71VaR7d5RhL._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 54.99,
      primeEligible: true,
      rating: 4.4,
      reviewCount: 12456
    },
    'Protein Powder': {
      asin: 'B00QQA0GSI',
      title: 'Dymatize ISO100 Hydrolyzed Protein Powder',
      brand: 'Dymatize',
      imageUrl: 'https://m.media-amazon.com/images/I/71VaR7d5RhL._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 54.99,
      primeEligible: true,
      rating: 4.4,
      reviewCount: 12456
    },
    'CoQ10 Ubiquinol': {
      asin: 'B019GI7JA4',
      title: 'Qunol Ubiquinol CoQ10 100mg Softgels',
      brand: 'Qunol',
      imageUrl: 'https://m.media-amazon.com/images/I/71P0gUyAl3L._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 29.99,
      primeEligible: true,
      rating: 4.5,
      reviewCount: 7832
    },
    'CoQ10': {
      asin: 'B019GI7JA4',
      title: 'Qunol Ubiquinol CoQ10 100mg Softgels',
      brand: 'Qunol',
      imageUrl: 'https://m.media-amazon.com/images/I/71P0gUyAl3L._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 29.99,
      primeEligible: true,
      rating: 4.5,
      reviewCount: 7832
    },
    'Lions Mane Mushroom': {
      asin: 'B078SJ9F9S',
      title: 'Host Defense Lions Mane Mushroom Capsules',
      brand: 'Host Defense',
      imageUrl: 'https://m.media-amazon.com/images/I/81hJzQ5ZKUL._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 34.95,
      primeEligible: true,
      rating: 4.3,
      reviewCount: 3421
    },
    "Lion's Mane": {
      asin: 'B078SJ9F9S',
      title: 'Host Defense Lions Mane Mushroom Capsules',
      brand: 'Host Defense',
      imageUrl: 'https://m.media-amazon.com/images/I/81hJzQ5ZKUL._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 34.95,
      primeEligible: true,
      rating: 4.3,
      reviewCount: 3421
    },
    'Zinc Bisglycinate': {
      asin: 'B0013OUNRI',
      title: 'Thorne Zinc Bisglycinate 15 mg',
      brand: 'Thorne',
      imageUrl: 'https://m.media-amazon.com/images/I/71FGLqgNWNL._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 12.00,
      primeEligible: true,
      rating: 4.6,
      reviewCount: 2843
    },
    'Zinc': {
      asin: 'B0013OUNRI',
      title: 'Thorne Zinc Bisglycinate 15 mg',
      brand: 'Thorne',
      imageUrl: 'https://m.media-amazon.com/images/I/71FGLqgNWNL._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 12.00,
      primeEligible: true,
      rating: 4.6,
      reviewCount: 2843
    },
    'Probiotics': {
      asin: 'B01EFVBWL8',
      title: 'Garden of Life Dr. Formulated Probiotics for Women',
      brand: 'Garden of Life',
      imageUrl: 'https://m.media-amazon.com/images/I/81kJqJqMv8L._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 24.47,
      primeEligible: true,
      rating: 4.4,
      reviewCount: 8976
    },
    'Probiotic': {
      asin: 'B01EFVBWL8',
      title: 'Garden of Life Dr. Formulated Probiotics for Women',
      brand: 'Garden of Life',
      imageUrl: 'https://m.media-amazon.com/images/I/81kJqJqMv8L._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 24.47,
      primeEligible: true,
      rating: 4.4,
      reviewCount: 8976
    },
    'Multivitamin': {
      asin: 'B01N9C8HUC',
      title: 'Ritual Essential for Women 18+ Multivitamin',
      brand: 'Ritual',
      imageUrl: 'https://m.media-amazon.com/images/I/71Y0bKHYsqL._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 35.00,
      primeEligible: true,
      rating: 4.2,
      reviewCount: 5643
    },
    'B Complex': {
      asin: 'B01KQCL6P2',
      title: 'Thorne Basic B Complex - B Vitamins for Cellular Energy',
      brand: 'Thorne',
      imageUrl: 'https://m.media-amazon.com/images/I/71LgEOdNjyL._AC_SL1500_.jpg',
      affiliateUrl: '',
      price: 15.00,
      primeEligible: true,
      rating: 4.5,
      reviewCount: 3287
    }
  };

  constructor(customPartnerTag?: string) {
    if (customPartnerTag) {
      this.partnerTag = customPartnerTag;
    }
    
    // Generate affiliate URLs for all products
    Object.keys(this.realProducts).forEach(key => {
      const product = this.realProducts[key];
      product.affiliateUrl = this.generateAffiliateUrl(product.asin);
    });
  }

  /**
   * Generate proper Amazon affiliate URL using official format
   */
  private generateAffiliateUrl(asin: string): string {
    return `https://www.amazon.com/dp/${asin}?tag=${this.partnerTag}&linkCode=ogi&th=1&psc=1`;
  }

  /**
   * Get real Amazon product for supplement
   */
  getRealProduct(supplementName: string): RealAmazonProduct | null {
    // Normalize supplement name for matching
    const normalizedName = supplementName.trim();
    
    // Direct match first
    if (this.realProducts[normalizedName]) {
      console.log(`✅ Found exact match for: ${normalizedName}`);
      return this.realProducts[normalizedName];
    }

    // Fuzzy matching for partial matches
    const keys = Object.keys(this.realProducts);
    for (const key of keys) {
      if (normalizedName.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(normalizedName.toLowerCase())) {
        console.log(`✅ Found fuzzy match for: ${normalizedName} -> ${key}`);
        return this.realProducts[key];
      }
    }

    console.log(`❌ No Amazon product found for: ${normalizedName}`);
    return null;
  }

  /**
   * Get all available real products
   */
  getAllRealProducts(): RealAmazonProduct[] {
    return Object.values(this.realProducts);
  }

  /**
   * Generate Amazon Add to Cart URL
   */
  generateAddToCartUrl(asin: string, quantity: number = 1): string {
    return `https://www.amazon.com/gp/aws/cart/add.html?ASIN.1=${asin}&Quantity.1=${quantity}&tag=${this.partnerTag}`;
  }

  /**
   * Check if we have real data for a supplement
   */
  hasRealProduct(supplementName: string): boolean {
    return this.getRealProduct(supplementName) !== null;
  }
}

// Export singleton instance
export const workingAmazonService = new WorkingAmazonService();
