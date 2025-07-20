/**
 * Amazon Cart Service - Working Implementation  
 * Uses real Amazon ASINs and proper cart integration
 */

import { workingAmazonService } from './working-amazon-service';

export interface AmazonCartItem {
  asin: string;
  quantity: number;
}

export class AmazonCartService {
  private static readonly CART_URL = 'https://www.amazon.com/gp/aws/cart/add.html';
  private static readonly ASSOCIATE_TAG = process.env.AMAZON_PARTNER_TAG || 'nutri0ad-20';

  /**
   * Add items to Amazon cart using real ASINs
   */
  static async addToCart(items: Array<{ name: string; quantity: number }>): Promise<string> {
    const cartItems: AmazonCartItem[] = [];

    // Convert supplement names to real Amazon ASINs
    for (const item of items) {
      const product = workingAmazonService.getRealProduct(item.name);
      if (product) {
        cartItems.push({
          asin: product.asin,
          quantity: item.quantity
        });
        console.log(`✅ Added to cart: ${product.title} (${product.asin}) x${item.quantity}`);
      } else {
        console.warn(`⚠️ No Amazon product found for: ${item.name}`);
      }
    }

    if (cartItems.length === 0) {
      throw new Error('No valid Amazon products found for cart items');
    }

    // Generate Amazon cart URL
    return this.generateCartUrl(cartItems);
  }

  /**
   * Generate Amazon cart URL with multiple items
   */
  private static generateCartUrl(items: AmazonCartItem[]): string {
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
   * Create a form to add multiple items to Amazon cart
   * This follows Amazon's official Add to Cart form specification
   */
  static createAddToCartForm(items: AmazonCartItem[]): HTMLFormElement {
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = this.CART_URL;
    form.target = '_blank'; // Open in new tab for better UX

    // Add associate tag
    const associateTagInput = document.createElement('input');
    associateTagInput.type = 'hidden';
    associateTagInput.name = 'AssociateTag';
    associateTagInput.value = this.ASSOCIATE_TAG;
    form.appendChild(associateTagInput);

    // Add each item with unique identifier
    items.forEach((item, index) => {
      const identifier = index + 1;

      // ASIN input
      const asinInput = document.createElement('input');
      asinInput.type = 'hidden';
      asinInput.name = `ASIN.${identifier}`;
      asinInput.value = item.asin;
      form.appendChild(asinInput);

      // Quantity input
      const quantityInput = document.createElement('input');
      quantityInput.type = 'hidden';
      quantityInput.name = `Quantity.${identifier}`;
      quantityInput.value = item.quantity.toString();
      form.appendChild(quantityInput);
    });

    return form;
  }

  /**
   * Add items to Amazon cart using official form method
   */
  static addToCart(items: AmazonCartItem[]): void {
    console.log('🛒 Adding items to Amazon cart:', items);
    
    // Create and submit form
    const form = this.createAddToCartForm(items);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  /**
   * Add single item to Amazon cart
   */
  static addSingleItemToCart(asin: string, quantity: number = 1): void {
    this.addToCart([{ asin, quantity }]);
  }

  /**
   * Extract ASIN from product URL or return as-is if already ASIN
   */
  static extractASIN(productIdentifier: string): string {
    // If it's already an ASIN (10 characters), return as-is
    if (productIdentifier.length === 10 && /^[A-Z0-9]+$/.test(productIdentifier)) {
      return productIdentifier;
    }

    // Extract ASIN from Amazon URL
    const asinMatch = productIdentifier.match(/\/dp\/([A-Z0-9]{10})/);
    if (asinMatch) {
      return asinMatch[1];
    }

    // Extract from /gp/product/ URLs
    const productMatch = productIdentifier.match(/\/gp\/product\/([A-Z0-9]{10})/);
    if (productMatch) {
      return productMatch[1];
    }

    console.warn('Could not extract ASIN from:', productIdentifier);
    return productIdentifier;
  }

  /**
   * Get direct product page URL with affiliate tag
   */
  static getProductPageURL(asin: string): string {
    return `https://www.amazon.com/dp/${asin}/ref=nosim?tag=${this.ASSOCIATE_TAG}`;
  }
}

export default AmazonCartService;
