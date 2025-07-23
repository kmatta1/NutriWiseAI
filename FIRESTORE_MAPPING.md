# Firebase Storage to Firestore Database Mapping

Based on the Firestore database structure and available Firebase Storage images, here's the correct mapping:

## Confirmed Database Entries (from screenshot):

### supplement_22
- **Name**: "Turmeric Curcumin with BioPerine by BioSchwartz"
- **Category**: "Joint & Bone Health"
- **Features**: ["1500mg Turmeric", "95% Curcuminoids", "BioPerine for Absorption", "Joint Health"]
- **Image**: `supplement-images/supplement_22.jpg`
- **Brand**: "BioSchwartz"
- **Price**: "$19.95"
- **Rating**: 4.5
- **Review Count**: 12456

## Expected Database Structure:

Based on the visible database structure and the product data files in the repository, the supplements should be stored with IDs that correspond to their Firebase Storage images:

```
supplements/
├── supplement_1/     → Protein supplements
├── supplement_2/     → Creatine supplements  
├── supplement_3/     → Pre-workout supplements
├── supplement_4/     → BCAA/Amino supplements
├── supplement_5/     → Omega-3/Fish oil supplements
├── supplement_6/     → Vitamin D supplements
├── supplement_7/     → Magnesium supplements
├── supplement_8/     → Probiotic supplements
├── supplement_9/     → Melatonin supplements
├── supplement_10/    → Multivitamin supplements
├── supplement_11/    → Green Tea Extract supplements
├── supplement_12/    → Ashwagandha supplements
├── supplement_13/    → Rhodiola supplements
├── supplement_14/    → Bacopa Monnieri supplements
├── supplement_15/    → Lion's Mane supplements
├── supplement_16/    → L-Theanine supplements
├── supplement_17/    → Ginkgo Biloba supplements
├── supplement_18/    → Garcinia Cambogia supplements
├── supplement_19/    → CLA supplements
├── supplement_20/    → L-Carnitine supplements
├── supplement_21/    → Collagen supplements
├── supplement_22/    → Turmeric/Curcumin supplements (CONFIRMED)
├── supplement_23/    → MSM supplements
├── supplement_24/    → Pre-workout (Legion Pulse) supplements
└── supplement_25/    → Other/Miscellaneous supplements
```

## Product Data Files Available:

The repository contains these product data files that should match database entries:

1. `product-data-Ashwagandha_Root_Extract_by_Nutricost.json` → supplement_12
2. `product-data-Bacopa_Monnieri_Extract_by_Nutricost.json` → supplement_14
3. `product-data-BCAA_Energy_Amino_Acid_Supplement_by_Cellucor_C4.json` → supplement_4
4. `product-data-CLA_1250_Safflower_Oil_by_Sports_Research.json` → supplement_19
5. `product-data-Collagen_Peptides_Powder_by_Vital_Proteins.json` → supplement_21
6. `product-data-Creatine_Monohydrate_Powder_Micronized_by_BulkSupplements.json` → supplement_2
7. `product-data-Garcinia_Cambogia_Extract_by_Nature's_Bounty.json` → supplement_18
8. `product-data-Ginkgo_Biloba_Extract_by_Nature's_Bounty.json` → supplement_17
9. `product-data-Glucosamine_Chondroitin_MSM_by_Kirkland_Signature.json` → supplement_22 (Joint & Bone)
10. `product-data-Green_Tea_Extract_Supplement_by_NOW_Foods.json` → supplement_11
11. `product-data-L-Carnitine_1000mg_by_Nutricost.json` → supplement_20
12. `product-data-L-Theanine_200mg_by_NOW_Foods.json` → supplement_16
13. `product-data-Lion's_Mane_Mushroom_Extract_by_Host_Defense.json` → supplement_15
14. `product-data-Magnesium_Glycinate_400mg_by_Doctor's_Best.json` → supplement_7
15. `product-data-Melatonin_3mg_by_Nature_Made.json` → supplement_9
16. `product-data-MSM_Powder_1000mg_by_NOW_Foods.json` → supplement_23
17. `product-data-Omega-3_Fish_Oil_1200mg_by_Nature_Made.json` → supplement_5
18. `product-data-Optimum_Nutrition_Gold_Standard_100%_Whey_Protein_Powder_-_Vanilla.json` → supplement_1
19. `product-data-Pre-Workout_Supplement_by_Legion_Pulse.json` → supplement_24
20. `product-data-Probiotics_50_Billion_CFU_by_Physician's_Choice.json` → supplement_8
21. `product-data-Rhodiola_Rosea_Extract_by_NOW_Foods.json` → supplement_13
22. `product-data-Turmeric_Curcumin_with_BioPerine_by_BioSchwartz.json` → supplement_22 (CONFIRMED)
23. `product-data-Vitamin_D3_5000_IU_by_NOW_Foods.json` → supplement_6
24. `product-data-Whole_Food_Multivitamin_by_Garden_of_Life.json` → supplement_10

## Implementation Strategy:

1. **Primary**: Check if supplement name matches a database entry → use database ID for image
2. **Secondary**: Use name-based matching to map to appropriate supplement_X.jpg
3. **Fallback**: Use Amazon product image URLs

## Next Steps:

1. Populate Firestore database with supplements matching the product data files
2. Ensure Firebase Storage contains images named `supplement_1.jpg` through `supplement_25.jpg`
3. Update component to prioritize database ID over name-based matching
4. Test image loading for all supplement categories

## Database Document Structure:

Each supplement document should contain:
```json
{
  "id": "supplement_22",
  "name": "Turmeric Curcumin with BioPerine by BioSchwartz",
  "category": "Joint & Bone Health",
  "brand": "BioSchwartz", 
  "price": "$19.95",
  "rating": 4.5,
  "reviewCount": 12456,
  "features": ["1500mg Turmeric", "95% Curcuminoids", "BioPerine for Absorption", "Joint Health"],
  "affiliateUrl": "https://www.amazon.com/dp/B00K2RBDUO?tag=nutriwiseai-20",
  "amazonUrl": "https://www.amazon.com/dp/B00K2RBDUO",
  "imageUrl": "https://m.media-amazon.com/images/I/71XN4ZyXLHL._AC_SL1500_.jpg",
  "verified": true,
  "type": "Anti-inflammatory"
}
```
