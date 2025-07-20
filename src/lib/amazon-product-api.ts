/**
 * Amazon Product Advertising API Service
 * Official implementation using Amazon's PAAPI 5.0 SDK
 * 
 * This service provides real Amazon product data including:
 * - Actual product ASINs for valid links
 * - High-quality product images from Amazon CDN
 * - Real pricing and availability information
 * - Proper affiliate link generation
 */

const ProductAdvertisingAPIv1 = require('paapi5-nodejs-sdk');

export interface AmazonProduct {
  asin: string;
  title: string;
  imageUrl: string;
  affiliateUrl: string;
  price: number;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  primeEligible?: boolean;
  features?: string[];
}

export class AmazonProductService {
  private api: any;
  private partnerTag: string;

  constructor() {
    this.partnerTag = process.env.AMAZON_PARTNER_TAG || 'nutri0ad-20';
    
    // Initialize the Amazon Product Advertising API client
    const defaultClient = ProductAdvertisingAPIv1.ApiClient.instance;
    
    // These should be set in environment variables
    defaultClient.accessKey = process.env.AMAZON_ACCESS_KEY || '';
    defaultClient.secretKey = process.env.AMAZON_SECRET_KEY || '';
    defaultClient.host = 'webservices.amazon.com';
    defaultClient.region = 'us-east-1';
    
    this.api = new ProductAdvertisingAPIv1.DefaultApi();
  }

  /**
   * Search for real Amazon products for supplements
   */
  async searchSupplementProducts(supplementName: string): Promise<AmazonProduct[]> {
    try {
      console.log(`🔍 Searching Amazon for: ${supplementName}`);

      // Create search request for supplements
      const searchItemsRequest = new ProductAdvertisingAPIv1.SearchItemsRequest();
      searchItemsRequest.PartnerTag = this.partnerTag;
      searchItemsRequest.PartnerType = 'Associates';
      searchItemsRequest.Keywords = `${supplementName} supplement`;
      searchItemsRequest.SearchIndex = 'HealthPersonalCare'; // Health & Personal Care category
      searchItemsRequest.ItemCount = 5; // Get top 5 results
      searchItemsRequest.Resources = [
        'Images.Primary.Large',
        'Images.Primary.Medium', 
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.ByLineInfo', // Brand information
        'Offers.Listings.Price',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible',
        'Offers.Summaries.LowestPrice',
        'BrowseNodeInfo.BrowseNodes'
      ];

      const searchItemsResponse = await this.api.searchItems(searchItemsRequest);
      
      if (searchItemsResponse.SearchResult && searchItemsResponse.SearchResult.Items) {
        const products: AmazonProduct[] = [];
        
        for (const item of searchItemsResponse.SearchResult.Items) {
          try {
            const product = this.parseAmazonItem(item);
            if (product) {
              products.push(product);
            }
          } catch (error) {
            console.warn(`⚠️ Error parsing Amazon item:`, error);
          }
        }
        
        console.log(`✅ Found ${products.length} Amazon products for ${supplementName}`);
        return products;
      } else {
        console.log(`❌ No Amazon products found for ${supplementName}`);
        return [];
      }
    } catch (error) {
      console.error(`❌ Amazon API error for ${supplementName}:`, error);
      return [];
    }
  }

  /**
   * Get a specific product by ASIN
   */
  async getProductByASIN(asin: string): Promise<AmazonProduct | null> {
    try {
      console.log(`🔍 Getting Amazon product by ASIN: ${asin}`);

      const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest();
      getItemsRequest.PartnerTag = this.partnerTag;
      getItemsRequest.PartnerType = 'Associates';
      getItemsRequest.ItemIds = [asin];
      getItemsRequest.Resources = [
        'Images.Primary.Large',
        'Images.Primary.Medium',
        'ItemInfo.Title', 
        'ItemInfo.Features',
        'ItemInfo.ByLineInfo',
        'Offers.Listings.Price',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible',
        'Offers.Summaries.LowestPrice'
      ];

      const getItemsResponse = await this.api.getItems(getItemsRequest);
      
      if (getItemsResponse.ItemsResult && getItemsResponse.ItemsResult.Items) {
        const item = getItemsResponse.ItemsResult.Items[0];
        return this.parseAmazonItem(item);
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Error getting Amazon product ${asin}:`, error);
      return null;
    }
  }

  /**
   * Parse Amazon API response item into our product format
   */
  private parseAmazonItem(item: any): AmazonProduct | null {
    try {
      const asin = item.ASIN;
      const title = item.ItemInfo?.Title?.DisplayValue || 'Unknown Product';
      
      // Get the best available image
      let imageUrl = '';
      if (item.Images?.Primary?.Large?.URL) {
        imageUrl = item.Images.Primary.Large.URL;
      } else if (item.Images?.Primary?.Medium?.URL) {
        imageUrl = item.Images.Primary.Medium.URL;
      }

      // Generate affiliate URL using Amazon's official format
      const affiliateUrl = `https://www.amazon.com/dp/${asin}?tag=${this.partnerTag}&linkCode=ogi&th=1&psc=1`;

      // Extract price information
      let price = 0;
      if (item.Offers?.Summaries?.[0]?.LowestPrice?.Amount) {
        price = item.Offers.Summaries[0].LowestPrice.Amount;
      } else if (item.Offers?.Listings?.[0]?.Price?.Amount) {
        price = item.Offers.Listings[0].Price.Amount;
      }

      // Extract brand information
      let brand = '';
      if (item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue) {
        brand = item.ItemInfo.ByLineInfo.Brand.DisplayValue;
      } else if (item.ItemInfo?.ByLineInfo?.Manufacturer?.DisplayValue) {
        brand = item.ItemInfo.ByLineInfo.Manufacturer.DisplayValue;
      }

      // Check Prime eligibility
      const primeEligible = item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible || false;

      // Extract features
      const features = item.ItemInfo?.Features?.DisplayValues || [];

      const product: AmazonProduct = {
        asin,
        title,
        imageUrl,
        affiliateUrl,
        price,
        brand,
        primeEligible,
        features
      };

      console.log(`✅ Parsed Amazon product: ${title} - $${price} - ${brand}`);
      return product;
    } catch (error) {
      console.error('❌ Error parsing Amazon item:', error);
      return null;
    }
  }

  /**
   * Get the best Amazon product for a supplement
   */
  async getBestProductForSupplement(supplementName: string): Promise<AmazonProduct | null> {
    const products = await this.searchSupplementProducts(supplementName);
    
    if (products.length === 0) {
      return null;
    }

    // Sort by factors: has image, has brand, prime eligible, price
    products.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Prefer products with images
      if (a.imageUrl) scoreA += 10;
      if (b.imageUrl) scoreB += 10;

      // Prefer products with brands
      if (a.brand) scoreA += 5;
      if (b.brand) scoreB += 5;

      // Prefer Prime eligible
      if (a.primeEligible) scoreA += 3;
      if (b.primeEligible) scoreB += 3;

      // Prefer reasonable prices (not too high)
      if (a.price > 0 && a.price < 100) scoreA += 2;
      if (b.price > 0 && b.price < 100) scoreB += 2;

      return scoreB - scoreA;
    });

    return products[0];
  }
}

// Export singleton instance
export const amazonProductService = new AmazonProductService();
