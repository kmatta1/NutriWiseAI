/**
 * Product Catalog Admin Service
 * 
 * This service is used for administrative operations like seeding the database.
 * It uses Firebase Admin SDK for server-side operations.
 */

import { adminDb } from './firebase-admin';
import { ProductCatalogItem } from './product-catalog-service';

export class ProductCatalogAdminService {
  private readonly COLLECTION_NAME = 'productCatalog';

  /**
   * Add a product to the catalog using Admin SDK
   */
  async addProduct(productData: Omit<ProductCatalogItem, 'id' | 'createdAt' | 'lastUpdated'>): Promise<string> {
    try {
      const now = new Date();
      const docRef = adminDb.collection(this.COLLECTION_NAME).doc();
      
      const product: ProductCatalogItem = {
        id: docRef.id,
        ...productData,
        createdAt: now,
        lastUpdated: now,
        lastPriceUpdate: now,
        lastVerified: now,
        isActive: true
      };

      await docRef.set(product);
      return docRef.id;
    } catch (error) {
      console.error('Error adding product to catalog:', error);
      throw error;
    }
  }

  /**
   * Get all products from the catalog
   */
  async getAllProducts(): Promise<ProductCatalogItem[]> {
    try {
      const snapshot = await adminDb.collection(this.COLLECTION_NAME).get();
      return snapshot.docs.map(doc => doc.data() as ProductCatalogItem);
    } catch (error) {
      console.error('Error getting products from catalog:', error);
      throw error;
    }
  }

  /**
   * Clear the entire catalog (use with caution!)
   */
  async clearCatalog(): Promise<void> {
    try {
      const snapshot = await adminDb.collection(this.COLLECTION_NAME).get();
      const batch = adminDb.batch();
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log('✅ Product catalog cleared');
    } catch (error) {
      console.error('Error clearing catalog:', error);
      throw error;
    }
  }

  /**
   * Get catalog statistics
   */
  async getCatalogStats(): Promise<{
    totalProducts: number;
    productsByCategory: Record<string, number>;
    averagePrice: number;
    lastUpdated: Date | null;
  }> {
    try {
      const products = await this.getAllProducts();
      
      const productsByCategory = products.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const averagePrice = products.reduce((sum, product) => sum + product.currentPrice, 0) / products.length;

      const lastUpdated = products.length > 0 
        ? new Date(Math.max(...products.map(p => p.lastUpdated.getTime())))
        : null;

      return {
        totalProducts: products.length,
        productsByCategory,
        averagePrice: parseFloat(averagePrice.toFixed(2)),
        lastUpdated
      };
    } catch (error) {
      console.error('Error getting catalog stats:', error);
      throw error;
    }
  }
}

export const productCatalogAdminService = new ProductCatalogAdminService();
