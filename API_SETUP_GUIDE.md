# 🔑 API Keys Setup Guide for Image Management

To get unique, high-quality images for your 653+ products, you'll need API keys from these free services:

## 🎯 Required APIs (Choose at least one)

### 1. Google Custom Search API (Recommended)
- **Free Tier**: 100 searches per day
- **Best for**: Finding exact product images
- **Setup**:
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Create a new project or select existing
  3. Enable the "Custom Search API"
  4. Go to "Credentials" → "Create Credentials" → "API Key"
  5. Copy your API key

### 2. Google Custom Search Engine
- **Free**: Unlimited (works with API above)
- **Setup**:
  1. Go to [Google Custom Search](https://cse.google.com/)
  2. Click "Add" to create new search engine
  3. In "Sites to search" enter: `*` (search entire web)
  4. Click "Create"
  5. Go to "Control Panel" → "Setup" → copy "Search engine ID"

### 3. SerpApi (Optional but Powerful)
- **Free Tier**: 100 searches per month
- **Best for**: High-quality Google Images scraping
- **Setup**:
  1. Go to [SerpApi](https://serpapi.com/)
  2. Sign up for free account
  3. Go to dashboard and copy your API key

### 4. Bing Image Search API (Backup)
- **Free Tier**: 1,000 searches per month
- **Setup**:
  1. Go to [Azure Cognitive Services](https://azure.microsoft.com/en-us/services/cognitive-services/bing-image-search-api/)
  2. Create free Azure account
  3. Create "Bing Search v7" resource
  4. Copy API key from "Keys and Endpoint"

## 📝 Add to .env File

Create or update your `.env` file with these keys:

```env
# Google Custom Search (Primary - get both)
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here

# SerpApi (Optional but recommended)
SERPAPI_KEY=your_serpapi_key_here

# Bing Images (Backup)
BING_API_KEY=your_bing_api_key_here
```

## 🚀 Usage Recommendations

### Minimum Setup (Free)
- Get Google Custom Search API + Search Engine ID
- This gives you 100 unique product images per day
- Enough to process your entire catalog in 7-10 days

### Optimal Setup (Still Free)
- Add SerpApi for higher quality results
- Add Bing as backup for difficult products
- This gives you multiple fallbacks and better success rate

### Rate Limiting Strategy
Our script automatically:
- Processes products in batches of 10
- Waits between requests to respect limits
- Tries multiple sources if one fails
- Tracks daily usage to stay within limits

## 🎯 Expected Results

With proper API keys, you'll get:
- ✅ 653 unique, high-quality product images
- ✅ Exact brand/product matches when possible
- ✅ Automatic fallbacks for difficult searches
- ✅ Permanent storage in Firebase
- ✅ No more duplicate or broken images

## 🔧 Troubleshooting

### "API key missing" errors
- Double-check your .env file has the correct variable names
- Restart your script after adding keys
- Ensure no extra spaces around the = sign

### "Quota exceeded" errors  
- You've hit daily limits - wait 24 hours or get additional APIs
- The script will automatically resume where it left off

### "No images found" errors
- Some products are hard to find - this is normal
- The script will try multiple sources before giving up
- Generic supplement images are used as fallbacks

## 📊 Cost Analysis

All recommended APIs have generous free tiers:
- Google: 100 searches/day = FREE
- SerpApi: 100 searches/month = FREE  
- Bing: 1,000 searches/month = FREE

Total cost: **$0** for your entire 653 product catalog!
