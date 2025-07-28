/**
 * Nightly script: Generate all advisor input permutations, get AI stack recommendations,
 * check/fetch product data, and seed Firestore/Pinecone as needed.
 * Includes efficiency, idempotency, logging, and extensibility best practices.
 */

import { getAllAdvisorInputPermutations } from './utils/advisor-permutations';
import { dynamicAIAdvisorService } from '../src/lib/dynamic-ai-advisor-service';
import { productCatalogAdminService } from '../src/lib/product-catalog-admin-service';
import { rainforestService } from '../src/lib/rainforest-service';
import { seedStackToFirestore, seedStackToPinecone } from './utils/stack-seeding';
import { logger } from './utils/logger';

async function main() {
  logger.info('Starting nightly advisor permutation generation and seeding...');

  // 1. Generate all advisor input permutations
  const permutations = getAllAdvisorInputPermutations();
  logger.info(`Generated ${permutations.length} advisor input permutations.`);


  // Load current product catalog for idempotency
  const allCatalogProducts = await productCatalogAdminService.getAllProducts();
  const catalogIndex = new Map(
    allCatalogProducts.map(p => [p.asin || p.name.toLowerCase(), p])
  );

  for (const input of permutations) {
    // 2. Get AI stack recommendation for this input
    let result;
    try {
      result = await dynamicAIAdvisorService.generateRecommendations(input);
    } catch (err) {
      logger.error('AI stack recommendation failed', { input, error: err });
      continue;
    }
    if (!result?.stack || !Array.isArray(result.stack.recommendations)) {
      logger.warn('No stack/products returned for input', { input });
      continue;
    }

    // 3. For each product in the stack, ensure it exists in the product catalog
    for (const rec of result.stack.recommendations) {
      const product = rec.product;
      const key = product.asin || product.name.toLowerCase();
      if (!catalogIndex.has(key)) {
        // Fetch from Rainforest API
        let rainforestData;
        try {
          rainforestData = await rainforestService.fetchProductData(product.name);
        } catch (err) {
          logger.error('Rainforest API fetch failed', { product, error: err });
          continue;
        }
        if (rainforestData) {
          try {
            await productCatalogAdminService.addProduct({
              name: rainforestData.title,
              brand: rainforestData.brand,
              category: product.category || '',
              subcategory: product.subcategory || '',
              description: '',
              servingSize: '',
              servingsPerContainer: 0,
              asin: rainforestData.asin,
              amazonUrl: `https://www.amazon.com/dp/${rainforestData.asin}`,
              affiliateUrl: rainforestData.affiliateUrl,
              imageUrl: rainforestData.imageUrl,
              currentPrice: rainforestData.price,
              primeEligible: rainforestData.primeEligible,
              rating: rainforestData.rating,
              reviewCount: rainforestData.reviewCount,
              isAvailable: true,
              activeIngredients: [],
              recommendedDosage: { amount: '', frequency: '', timing: '', instructions: '' },
              evidenceLevel: 'preliminary',
              studyCount: 0,
              citations: [],
              qualityFactors: {
                thirdPartyTested: false,
                gmpCertified: false,
                organicCertified: false,
                allergenFree: false,
                bioavailableForm: false,
                contaminantFree: false,
              },
              targetGoals: [],
              targetDemographics: { gender: ['both'], ageRange: [18, 65], activityLevel: [], experienceLevel: [] },
              healthBenefits: [],
              contraindications: [],
              drugInteractions: [],
              sideEffects: [],
              commissionRate: 0,
              costPerServing: 0,
              lastPriceUpdate: new Date(),
              lastVerified: new Date(),
              isActive: true,
            });
            logger.info('Seeded new product to catalog', { product: rainforestData });
            // Store a minimal object to satisfy the type, only existence is checked
            catalogIndex.set(key, { asin: rainforestData.asin, name: rainforestData.title } as any);
          } catch (err) {
            logger.error('Failed to seed product to catalog', { product, error: err });
          }
        } else {
          logger.warn('No Rainforest data found for product', { product });
        }
      }
    }

    // 4. Seed stack to Firestore and Pinecone
    await seedStackToFirestore(input, result.stack);
    await seedStackToPinecone(input, result.stack);
    logger.info('Seeded stack for input', { input });
  }

  logger.info('Nightly advisor permutation seeding complete.');
}

main().catch((err) => {
  logger.error('Nightly script failed', { error: err });
  process.exit(1);
});
