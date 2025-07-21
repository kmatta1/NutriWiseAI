const fetch = require('node-fetch');
const { workingAmazonService } = require('../src/lib/working-amazon-service');

const CHECK_IMAGES = true;
const CHECK_PRODUCT_PAGES = true;

// ANSI colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
};

async function checkUrl(url, type) {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    if (response.ok) {
      console.log(`${colors.green}✅ SUCCESS${colors.reset}: ${type} for ${url} is valid (${response.status}).`);
      return true;
    } else {
      console.error(`${colors.red}❌ FAILED${colors.reset}: ${type} for ${url} returned status ${response.status}.`);
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}❌ ERROR${colors.reset}: Checking ${type} for ${url} failed:`, error.message);
    return false;
  }
}

async function verifyProducts() {
  const products = workingAmazonService.getAllRealProducts();
  let allLinksValid = true;
  
  console.log(`${colors.cyan}Starting verification for ${products.length} Amazon products...${colors.reset}\n`);

  // Use a Set to avoid checking the same URL multiple times
  const uniqueImageUrls = new Set(products.map(p => p.imageUrl));
  const uniqueAffiliateUrls = new Set(products.map(p => p.affiliateUrl));

  if (CHECK_IMAGES) {
    console.log(`\n--- Verifying ${uniqueImageUrls.size} Unique Image URLs ---\n`);
    for (const url of uniqueImageUrls) {
      if (!await checkUrl(url, 'Image URL')) {
        allLinksValid = false;
      }
    }
  }

  if (CHECK_PRODUCT_PAGES) {
    console.log(`\n--- Verifying ${uniqueAffiliateUrls.size} Unique Product Page URLs ---\n`);
    for (const url of uniqueAffiliateUrls) {
      if (!await checkUrl(url, 'Product URL')) {
        allLinksValid = false;
      }
    }
  }

  console.log('\n--- Verification Summary ---');
  if (allLinksValid) {
    console.log(`${colors.green}🎉 All configured Amazon links are valid!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️ Some Amazon links failed verification. Please check the logs above and update 'working-amazon-service.ts'.${colors.reset}`);
  }
}

verifyProducts();
