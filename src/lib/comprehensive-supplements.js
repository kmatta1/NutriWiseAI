/**
 * Comprehensive supplement database expansion
 * This will create a much larger database of verified supplements to handle more customer combinations
 */

const COMPREHENSIVE_SUPPLEMENTS = {
  // VITAMIN D VARIATIONS
  'vitamin-d3-2000': {
    id: 'vitamin-d3-2000',
    name: 'Vitamin D3 2000 IU',
    brand: 'NOW Foods',
    dosage: '2000 IU',
    timing: 'With breakfast',
    reasoning: 'Essential for immune function, bone health, and mood regulation',
    asin: 'B000FGDIAI',
    amazonUrl: 'https://www.amazon.com/dp/B000FGDIAI?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 12.99,
    category: 'vitamin-d',
    targetGroups: ['general', 'elderly', 'low-sun-exposure']
  },
  'vitamin-d3-5000': {
    id: 'vitamin-d3-5000',
    name: 'Vitamin D3 5000 IU',
    brand: 'Thorne',
    dosage: '5000 IU',
    timing: 'With breakfast',
    reasoning: 'Higher dose for severe deficiency and therapeutic benefits',
    asin: 'B0797G4Q7L',
    amazonUrl: 'https://www.amazon.com/dp/B0797G4Q7L?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 18.99,
    category: 'vitamin-d',
    targetGroups: ['deficient', 'athletes', 'winter-climate']
  },
  'vitamin-d3-1000': {
    id: 'vitamin-d3-1000',
    name: 'Vitamin D3 1000 IU',
    brand: 'Garden of Life',
    dosage: '1000 IU',
    timing: 'With breakfast',
    reasoning: 'Gentle dose for maintenance and sensitive individuals',
    asin: 'B00280MC8W',
    amazonUrl: 'https://www.amazon.com/dp/B00280MC8W?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 14.99,
    category: 'vitamin-d',
    targetGroups: ['maintenance', 'children', 'sensitive']
  },

  // OMEGA-3 VARIATIONS
  'omega3-fish-oil': {
    id: 'omega3-fish-oil',
    name: 'Omega-3 Fish Oil',
    brand: 'Nordic Naturals',
    dosage: '1000mg EPA/DHA',
    timing: 'With meals',
    reasoning: 'Supports heart health, brain function, and reduces inflammation',
    asin: 'B00CAZAU62',
    amazonUrl: 'https://www.amazon.com/dp/B00CAZAU62?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 29.95,
    category: 'omega-3',
    targetGroups: ['general', 'heart-health', 'brain-health']
  },
  'omega3-algae': {
    id: 'omega3-algae',
    name: 'Omega-3 Algae Oil',
    brand: 'Sports Research',
    dosage: '800mg EPA/DHA',
    timing: 'With meals',
    reasoning: 'Plant-based omega-3 for vegans and vegetarians',
    asin: 'B01MYE83TF',
    amazonUrl: 'https://www.amazon.com/dp/B01MYE83TF?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 34.95,
    category: 'omega-3',
    targetGroups: ['vegan', 'vegetarian', 'fish-allergic']
  },
  'omega3-high-potency': {
    id: 'omega3-high-potency',
    name: 'High Potency Omega-3',
    brand: 'Carlson Labs',
    dosage: '1600mg EPA/DHA',
    timing: 'With meals',
    reasoning: 'Concentrated formula for therapeutic benefits',
    asin: 'B001LF39RO',
    amazonUrl: 'https://www.amazon.com/dp/B001LF39RO?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 45.99,
    category: 'omega-3',
    targetGroups: ['therapeutic', 'high-inflammation', 'athletes']
  },

  // MAGNESIUM VARIATIONS
  'magnesium-glycinate': {
    id: 'magnesium-glycinate',
    name: 'Magnesium Glycinate',
    brand: 'Thorne',
    dosage: '200mg',
    timing: 'Before bedtime',
    reasoning: 'Best absorbed form, promotes sleep and muscle relaxation',
    asin: 'B0013OUNRI',
    amazonUrl: 'https://www.amazon.com/dp/B0013OUNRI?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 18.99,
    category: 'magnesium',
    targetGroups: ['sleep-issues', 'muscle-tension', 'anxiety']
  },
  'magnesium-citrate': {
    id: 'magnesium-citrate',
    name: 'Magnesium Citrate',
    brand: 'NOW Foods',
    dosage: '400mg',
    timing: 'With meals',
    reasoning: 'Good absorption, supports digestion and energy',
    asin: 'B000BD0RT0',
    amazonUrl: 'https://www.amazon.com/dp/B000BD0RT0?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 14.99,
    category: 'magnesium',
    targetGroups: ['digestive-issues', 'energy', 'budget-conscious']
  },
  'magnesium-oxide': {
    id: 'magnesium-oxide',
    name: 'Magnesium Oxide',
    brand: 'Nature Made',
    dosage: '400mg',
    timing: 'With meals',
    reasoning: 'High elemental magnesium content, budget-friendly',
    asin: 'B00013YXA8',
    amazonUrl: 'https://www.amazon.com/dp/B00013YXA8?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 9.99,
    category: 'magnesium',
    targetGroups: ['budget', 'high-dose-needed', 'basic-supplementation']
  },

  // PROTEIN VARIATIONS
  'whey-protein-isolate': {
    id: 'whey-protein-isolate',
    name: 'Whey Protein Isolate',
    brand: 'Optimum Nutrition',
    dosage: '25g',
    timing: 'Post-workout',
    reasoning: 'Fast-absorbing, low lactose, ideal for muscle building',
    asin: 'B000QSNYGI',
    amazonUrl: 'https://www.amazon.com/dp/B000QSNYGI?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1583500178690-594ce94555e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 54.99,
    category: 'protein',
    targetGroups: ['muscle-building', 'athletes', 'lactose-sensitive']
  },
  'plant-protein': {
    id: 'plant-protein',
    name: 'Plant Protein Blend',
    brand: 'Vega',
    dosage: '20g',
    timing: 'Post-workout or anytime',
    reasoning: 'Complete amino acid profile from plants',
    asin: 'B00J074W94',
    amazonUrl: 'https://www.amazon.com/dp/B00J074W94?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1583500178690-594ce94555e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 39.99,
    category: 'protein',
    targetGroups: ['vegan', 'vegetarian', 'dairy-free']
  },
  'casein-protein': {
    id: 'casein-protein',
    name: 'Casein Protein',
    brand: 'Dymatize',
    dosage: '25g',
    timing: 'Before bedtime',
    reasoning: 'Slow-release protein for overnight muscle recovery',
    asin: 'B002DYJ0O6',
    amazonUrl: 'https://www.amazon.com/dp/B002DYJ0O6?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1583500178690-594ce94555e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 49.99,
    category: 'protein',
    targetGroups: ['muscle-building', 'recovery', 'bedtime-supplementation']
  },

  // CREATINE VARIATIONS
  'creatine-monohydrate': {
    id: 'creatine-monohydrate',
    name: 'Creatine Monohydrate',
    brand: 'Optimum Nutrition',
    dosage: '5g',
    timing: 'Post-workout',
    reasoning: 'Most researched form, enhances strength and power',
    asin: 'B002DYIZEO',
    amazonUrl: 'https://www.amazon.com/dp/B002DYIZEO?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 27.99,
    category: 'creatine',
    targetGroups: ['strength-training', 'power-sports', 'muscle-building']
  },
  'creatine-hcl': {
    id: 'creatine-hcl',
    name: 'Creatine HCL',
    brand: 'Kaged Muscle',
    dosage: '2g',
    timing: 'Pre or post-workout',
    reasoning: 'Better solubility, no loading phase needed',
    asin: 'B00PU9HWAE',
    amazonUrl: 'https://www.amazon.com/dp/B00PU9HWAE?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 34.99,
    category: 'creatine',
    targetGroups: ['sensitive-stomach', 'premium', 'convenience']
  },

  // MULTIVITAMIN VARIATIONS
  'mens-multivitamin': {
    id: 'mens-multivitamin',
    name: 'Men\'s Daily Multivitamin',
    brand: 'Garden of Life',
    dosage: '2 capsules',
    timing: 'With breakfast',
    reasoning: 'Tailored nutrient profile for men\'s health needs',
    asin: 'B00280EAW0',
    amazonUrl: 'https://www.amazon.com/dp/B00280EAW0?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1607619662634-3ac55ec8c2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 35.99,
    category: 'multivitamin',
    targetGroups: ['men', 'general-health', 'nutrient-gaps']
  },
  'womens-multivitamin': {
    id: 'womens-multivitamin',
    name: 'Women\'s Daily Multivitamin',
    brand: 'Rainbow Light',
    dosage: '2 tablets',
    timing: 'With breakfast',
    reasoning: 'Higher iron and folate for women\'s specific needs',
    asin: 'B000056VJ2',
    amazonUrl: 'https://www.amazon.com/dp/B000056VJ2?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1607619662634-3ac55ec8c2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 32.99,
    category: 'multivitamin',
    targetGroups: ['women', 'reproductive-health', 'energy']
  },
  'seniors-multivitamin': {
    id: 'seniors-multivitamin',
    name: 'Senior Multivitamin',
    brand: 'Centrum',
    dosage: '1 tablet',
    timing: 'With breakfast',
    reasoning: 'Adjusted formulation for aging nutritional needs',
    asin: 'B001F0R6PC',
    amazonUrl: 'https://www.amazon.com/dp/B001F0R6PC?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1607619662634-3ac55ec8c2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 24.99,
    category: 'multivitamin',
    targetGroups: ['seniors', 'elderly', 'cognitive-health']
  },

  // ADDITIONAL POPULAR SUPPLEMENTS
  'vitamin-c': {
    id: 'vitamin-c',
    name: 'Vitamin C',
    brand: 'NOW Foods',
    dosage: '1000mg',
    timing: 'With meals',
    reasoning: 'Immune support and antioxidant protection',
    asin: 'B0013OQGO6',
    amazonUrl: 'https://www.amazon.com/dp/B0013OQGO6?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 16.99,
    category: 'vitamin',
    targetGroups: ['immune-support', 'antioxidant', 'general-health']
  },
  'zinc': {
    id: 'zinc',
    name: 'Zinc Picolinate',
    brand: 'Thorne',
    dosage: '15mg',
    timing: 'On empty stomach',
    reasoning: 'Immune function, wound healing, and hormone production',
    asin: 'B0013HQJ0E',
    amazonUrl: 'https://www.amazon.com/dp/B0013HQJ0E?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 12.99,
    category: 'mineral',
    targetGroups: ['immune-support', 'skin-health', 'hormone-support']
  },
  'probiotics': {
    id: 'probiotics',
    name: 'Probiotic Complex',
    brand: 'Garden of Life',
    dosage: '50 billion CFU',
    timing: 'On empty stomach',
    reasoning: 'Digestive health and immune system support',
    asin: 'B00Y8MP4G6',
    amazonUrl: 'https://www.amazon.com/dp/B00Y8MP4G6?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1607619662634-3ac55ec8c2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 44.99,
    category: 'digestive',
    targetGroups: ['digestive-health', 'immune-support', 'gut-health']
  },
  'b-complex': {
    id: 'b-complex',
    name: 'B-Complex Vitamins',
    brand: 'Thorne',
    dosage: '1 capsule',
    timing: 'With breakfast',
    reasoning: 'Energy metabolism and nervous system support',
    asin: 'B0797GWG7S',
    amazonUrl: 'https://www.amazon.com/dp/B0797GWG7S?tag=nutriwiseai-20',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    currentPrice: 19.99,
    category: 'vitamin',
    targetGroups: ['energy', 'stress-support', 'nervous-system']
  },
  'ashwagandha': {
    id: 'ashwagandha',
    name: 'Ashwagandha Extract',
    brand: 'KSM-66',
    dosage: '600mg',
    timing: 'With dinner',
    reasoning: 'Stress reduction and cortisol management',
    asin: 'B078SZ8G8K',
    amazonUrl: 'https://www.amazon.com/dp/B078SZ8G8K?tag=nutriwiseai-20',
    imageUrl: 'https://via.placeholder.com/300x300/A855F7/white?text=Ashwagandha',
    currentPrice: 24.99,
    category: 'adaptogen',
    targetGroups: ['stress-management', 'anxiety', 'cortisol-support']
  },
  'turmeric': {
    id: 'turmeric',
    name: 'Turmeric Curcumin',
    brand: 'Life Extension',
    dosage: '500mg',
    timing: 'With meals',
    reasoning: 'Anti-inflammatory and joint health support',
    asin: 'B00JA4TICE',
    amazonUrl: 'https://www.amazon.com/dp/B00JA4TICE?tag=nutriwiseai-20',
    imageUrl: 'https://via.placeholder.com/300x300/F97316/white?text=Turmeric',
    currentPrice: 21.99,
    category: 'anti-inflammatory',
    targetGroups: ['joint-health', 'inflammation', 'recovery']
  }
};

console.log("📊 Comprehensive Supplement Database Created");
console.log(`Total supplements: ${Object.keys(COMPREHENSIVE_SUPPLEMENTS).length}`);
console.log("Categories covered:");
console.log("- Vitamin D (3 variations)");
console.log("- Omega-3 (3 variations)");
console.log("- Magnesium (3 variations)");
console.log("- Protein (3 variations)");
console.log("- Creatine (2 variations)");
console.log("- Multivitamins (3 variations)");
console.log("- Additional supplements (6 types)");
console.log("\n🎯 This database can now handle diverse customer combinations!");

module.exports = { COMPREHENSIVE_SUPPLEMENTS };
