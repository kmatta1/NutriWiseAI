/**
 * Working Amazon Cart Service
 * Uses real Amazon ASINs and proper cart integration
 */

import { workingAmazonService } from './working-amazon-service';

export interface WorkingCartItem {
  asin: string;
  quantity: number;
  title: string;
}

export class WorkingAmazonCart {
  private static readonly CART_URL = 'https://www.amazon.com/gp/aws/cart/add.html';
  private static readonly ASSOCIATE_TAG = 'nutri0ad-20';

  /**
   * Add items to Amazon cart - returns URL for redirect
   */
  static async addToCart(items: Array<{ name: string; quantity: number }>): Promise<string> {
    const cartItems: WorkingCartItem[] = [];

    // Convert supplement names to real Amazon products
    for (const item of items) {
      const product = workingAmazonService.getRealProduct(item.name);
      if (product) {
        cartItems.push({
          asin: product.asin,
          quantity: item.quantity,
          title: product.title
        });
        console.log(`✅ Added to cart: ${product.title} (${product.asin}) x${item.quantity}`);
      } else {
        console.warn(`⚠️ No Amazon product found for: ${item.name}`);
      }
    }

    if (cartItems.length === 0) {
      throw new Error('No valid Amazon products found for cart items');
    }

    // Generate cart URL
    return this.generateCartUrl(cartItems);
  }

  /**
   * Generate Amazon cart URL
   */
  private static generateCartUrl(items: WorkingCartItem[]): string {
    const params = new URLSearchParams();
    params.append('tag', this.ASSOCIATE_TAG);

    items.forEach((item, index) => {
      const itemNumber = index + 1;
      params.append(`ASIN.${itemNumber}`, item.asin);
      params.append(`Quantity.${itemNumber}`, item.quantity.toString());
    });

    const cartUrl = `${this.CART_URL}?${params.toString()}`;
    console.log('🛒 Generated Amazon cart URL:', cartUrl);
    return cartUrl;
  }

  /**
   * Get individual product cart URL
   */
  static getProductCartUrl(supplementName: string, quantity: number = 1): string | null {
    const product = workingAmazonService.getRealProduct(supplementName);
    if (!product) {
      return null;
    }
    return workingAmazonService.generateAddToCartUrl(product.asin, quantity);
  }

  /**
   * Get product details
   */
  static getProductDetails(supplementName: string) {
    return workingAmazonService.getRealProduct(supplementName);
  }
}

export default WorkingAmazonCart;
