# Amazon Product Integration Setup Guide

## Overview

NutriWiseAI now integrates with Amazon's Product Advertising API 5.0 to show real product information, prices, images, and affiliate purchase links with your tracking ID.

## Key Features Fixed

✅ **Real Product Data**: Shows actual Amazon product titles, brands, and images  
✅ **Live Pricing**: Displays current Amazon prices and Prime eligibility  
✅ **Quality Indicators**: Shows ratings, review counts, and quality certifications  
✅ **Affiliate Tracking**: All purchase links include your Amazon Associate tracking ID  
✅ **Fallback System**: Uses mock data when API is unavailable  

## Amazon API Setup

### 1. Get Amazon Associate Account
1. Sign up at [Amazon Associates](https://affiliate-program.amazon.com/)
2. Complete the application process
3. Get your Associate Tag (e.g., `nutriwiseai-20`)

### 2. Get Product Advertising API Access
1. Go to [Product Advertising API](https://webservices.amazon.com/paapi5/documentation/register-for-pa-api.html)
2. Apply for API access (requires existing Associate account)
3. Get your Access Key and Secret Key

### 3. Configure Environment Variables
```bash
AMAZON_ACCESS_KEY=your_amazon_access_key_here
AMAZON_SECRET_KEY=your_amazon_secret_key_here
```

## How It Works

### 1. Product Search
When AI recommends supplements, the system:
- Searches Amazon for relevant products
- Filters by quality standards (ratings, reviews, trusted brands)
- Ranks by AI-powered quality scoring

### 2. Quality Assessment
Products are evaluated on:
- ⭐ Rating (4.0+ required)
- 👥 Review count (50+ reviews preferred)
- 🏆 Brand reputation (trusted supplement brands)
- 🔬 Quality indicators (3rd party tested, GMP certified, etc.)

### 3. Price Analysis
- 💰 Best value recommendations
- 💎 Premium options
- 💵 Budget-friendly alternatives
- 📊 Cost per serving calculations

### 4. Affiliate Integration
All product links include:
- Your Amazon Associate tracking ID
- Proper attribution for commission tracking
- Direct product page links when possible
- Search fallbacks for unavailable products

## Technical Implementation

### Core Components

1. **`AmazonIntegrationService`** (`src/lib/amazon-integration.ts`)
   - Product search and data mapping
   - Quality filtering and AI scoring
   - Mock data fallbacks

2. **Enhanced AI Service** (`src/lib/fallback-ai.ts`)
   - Integrates Amazon products into recommendations
   - Premium vs free user handling
   - Real product image and pricing

3. **Supplement Stack Card** (`src/components/supplement-stack-card.tsx`)
   - Displays Amazon product information
   - Quality badges and Prime eligibility
   - Enhanced "View Product Details" buttons

### API Rate Limits

Amazon Product Advertising API has limits:
- **1 request per second** for new accounts
- **Up to 8,640 requests per day**
- Higher limits available for accounts with sales

### Error Handling

The system gracefully handles:
- ❌ API unavailability (uses mock data)
- ⏱️ Rate limiting (queues requests)
- 🔍 No results found (shows search links)
- 🔐 Invalid credentials (logs warnings)

## Testing

### With API Credentials
1. Add real Amazon API keys to `.env.local`
2. Test supplement recommendations
3. Verify real product data appears
4. Check affiliate links include your tracking ID

### Without API Credentials
1. System automatically uses mock data
2. Realistic product information shown
3. All functionality works as expected
4. Search fallbacks to Amazon with tracking ID

## Monetization Features

### Affiliate Revenue
- ✅ All product links monetized
- ✅ Tracking ID properly implemented  
- ✅ Direct product page links for higher conversion
- ✅ Search fallbacks maintain monetization

### Analytics Integration
- 📊 Click tracking for affiliate links
- 📈 Product view analytics
- 💰 Revenue attribution per recommendation
- 📋 Conversion funnel optimization

### Premium Features
- 🥇 Real-time Amazon data for premium users
- 🔄 Live price comparisons
- ⚡ Priority product recommendations
- 📱 Enhanced product details and alternatives

## Compliance

### Amazon Requirements
- ✅ Proper affiliate disclosure
- ✅ Associate tag in all links
- ✅ Accurate product information
- ✅ Up-to-date pricing displays

### User Experience
- ✅ Fast loading (mock data fallbacks)
- ✅ Mobile responsive product cards
- ✅ Clear call-to-action buttons
- ✅ Quality indicators and social proof

## Next Steps

1. **Set up Amazon Associate account** if not already done
2. **Apply for Product Advertising API access**
3. **Add API credentials** to environment variables
4. **Test the integration** with real product searches
5. **Monitor affiliate revenue** and optimize conversions

The system is designed to work immediately with mock data while you set up API access, ensuring no downtime during the transition to real Amazon integration.
