/**
 * Image Fallback Service
 * 
 * Handles image loading failures and provides reliable fallback images
 * for supplement products when Amazon URLs return 404 errors
 */

export class ImageFallbackService {
  private static instance: ImageFallbackService;

  static getInstance(): ImageFallbackService {
    if (!ImageFallbackService.instance) {
      ImageFallbackService.instance = new ImageFallbackService();
    }
    return ImageFallbackService.instance;
  }

  /**
   * Get a reliable image URL with fallback handling
   */
  getReliableImageUrl(
    originalUrl: string | null, 
    supplementName: string, 
    category?: string
  ): string {
    // If no original URL or it's invalid, use fallback immediately
    if (!originalUrl || !this.isValidUrl(originalUrl)) {
      return this.generateFallbackImage(supplementName, category);
    }

    // For Amazon URLs that commonly fail, proxy through our service
    if (this.isAmazonImageUrl(originalUrl)) {
      return this.getProxiedAmazonImage(originalUrl, supplementName, category);
    }

    // Return original URL with onError fallback handled by component
    return originalUrl;
  }

  /**
   * Generate fallback image URL based on supplement type
   */
  private generateFallbackImage(supplementName: string, category?: string): string {
    const name = supplementName.toLowerCase();
    
    // Category-based fallbacks
    if (category) {
      const categoryLower = category.toLowerCase();
      
      if (categoryLower.includes('protein')) {
        return '/images/fallbacks/protein-powder.jpg';
      }
      if (categoryLower.includes('vitamin')) {
        return '/images/fallbacks/vitamins.jpg';
      }
      if (categoryLower.includes('mineral')) {
        return '/images/fallbacks/minerals.jpg';
      }
      if (categoryLower.includes('herb') || categoryLower.includes('extract')) {
        return '/images/fallbacks/herbs.jpg';
      }
      if (categoryLower.includes('amino') || categoryLower.includes('creatine')) {
        return '/images/fallbacks/amino-acids.jpg';
      }
      if (categoryLower.includes('oil') || categoryLower.includes('omega')) {
        return '/images/fallbacks/fish-oil.jpg';
      }
    }

    // Name-based fallbacks
    if (name.includes('protein')) {
      return '/images/fallbacks/protein-powder.jpg';
    }
    if (name.includes('creatine')) {
      return '/images/fallbacks/creatine.jpg';
    }
    if (name.includes('vitamin d') || name.includes('d3')) {
      return '/images/fallbacks/vitamin-d.jpg';
    }
    if (name.includes('omega') || name.includes('fish oil')) {
      return '/images/fallbacks/fish-oil.jpg';
    }
    if (name.includes('magnesium')) {
      return '/images/fallbacks/magnesium.jpg';
    }
    if (name.includes('multivitamin')) {
      return '/images/fallbacks/multivitamin.jpg';
    }
    if (name.includes('probiotic')) {
      return '/images/fallbacks/probiotics.jpg';
    }
    if (name.includes('turmeric') || name.includes('curcumin')) {
      return '/images/fallbacks/turmeric.jpg';
    }
    if (name.includes('ashwagandha')) {
      return '/images/fallbacks/ashwagandha.jpg';
    }
    if (name.includes('zinc')) {
      return '/images/fallbacks/zinc.jpg';
    }

    // Default fallback
    return '/images/fallbacks/generic-supplement.jpg';
  }

  /**
   * Create a proxied Amazon image URL that's more reliable
   */
  private getProxiedAmazonImage(
    originalUrl: string, 
    supplementName: string, 
    category?: string
  ): string {
    // For development, return fallback immediately since Amazon images are failing
    if (process.env.NODE_ENV === 'development') {
      return this.generateFallbackImage(supplementName, category);
    }

    // In production, could proxy through a CDN or image service
    // For now, return the original URL with fallback handling in component
    return originalUrl;
  }

  /**
   * Check if URL is a valid Amazon image URL
   */
  private isAmazonImageUrl(url: string): boolean {
    return url.includes('amazon.com') || 
           url.includes('images-amazon.com') || 
           url.includes('ssl-images-amazon.com') ||
           url.includes('m.media-amazon.com');
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Test if an image URL is accessible
   */
  async testImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get image HTML with proper fallback handling
   */
  getImageComponent(
    originalUrl: string | null,
    supplementName: string,
    category?: string,
    className?: string
  ): { src: string; onError: string } {
    const primarySrc = this.getReliableImageUrl(originalUrl, supplementName, category);
    const fallbackSrc = this.generateFallbackImage(supplementName, category);
    
    return {
      src: primarySrc,
      onError: `this.src='${fallbackSrc}'`
    };
  }
}

export const imageFallbackService = ImageFallbackService.getInstance();
