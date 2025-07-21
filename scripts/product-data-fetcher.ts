import puppeteer from 'puppeteer';
import fs from 'fs';

/**
 * Fetches product details from Amazon and image from Amazon or Google Images.
 * @param {string} productName - The supplement/product name to search for.
 * @param {string} affiliateTag - Your Amazon affiliate code.
 */
export async function fetchProductData(productName: string, affiliateTag: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Search Amazon for the product
  const amazonSearchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(productName)}`;
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
  await page.goto(amazonSearchUrl, { waitUntil: 'domcontentloaded' });
  await new Promise(res => setTimeout(res, 3000)); // Wait 3 seconds for dynamic content
  // Log HTML for debugging
  const html = await page.content();
  fs.writeFileSync('./amazon-search-debug.html', html);

  // 2. Scrape first product details
  const productData = await page.evaluate(() => {
          let firstProduct = document.querySelector('[data-component-type="s-search-result"]');
          if (!firstProduct) {
            const allResults = document.querySelectorAll('[data-component-type="s-search-result"]');
            firstProduct = allResults.length > 0 ? allResults[0] : null;
          }
          if (!firstProduct) return null;
          // Product link (relative URL)
          let linkElem = firstProduct.querySelector('a.a-link-normal');
          let link = linkElem ? linkElem.getAttribute('href') : null;
          // Product title
          let titleElem = firstProduct.querySelector('h2 span');
          let title = titleElem ? titleElem.textContent : null;
          // Product image
          let imgElem = firstProduct.querySelector('img.s-image');
          let imageUrl = imgElem ? imgElem.getAttribute('src') : null;
          // Brand (may be in a span or div)
          let brandElem = firstProduct.querySelector('.a-row.a-size-base.a-color-secondary .a-size-base') || firstProduct.querySelector('.a-size-base-plus');
          let brand = brandElem ? brandElem.textContent : null;
          // Price
          let priceElem = firstProduct.querySelector('.a-price .a-offscreen');
          let price = priceElem ? priceElem.textContent : null;
          // Reviews
          let reviewsElem = firstProduct.querySelector('.a-size-base.s-underline-text');
          let reviews = reviewsElem ? reviewsElem.textContent : null;
          // Stars
          let starsElem = firstProduct.querySelector('.a-icon-alt');
          let stars = starsElem ? starsElem.textContent : null;
          // Fallbacks for missing data
          if (!title) title = firstProduct.getAttribute('data-asin') || 'Unknown';
          return { link, title, brand, price, reviews, stars, imageUrl };
  });

  if (!productData || !productData.link) {
    await browser.close();
    throw new Error('No product found on Amazon.');
  }

  // 3. Visit product page and try to scrape image
        let imageUrl = productData.imageUrl;
        const productUrl = productData.link.startsWith('http') ? productData.link : `https://www.amazon.com${productData.link}`;
        await page.goto(productUrl, { waitUntil: 'domcontentloaded' });
        const productPageImage = await page.evaluate(() => {
            const img = document.querySelector('#imgTagWrapperId img');
            return img ? (img as HTMLImageElement).src : null;
        });
        if (productPageImage) imageUrl = productPageImage;

        // 4. If Amazon image fails, fallback to Google Images
        if (!imageUrl) {
            const googleSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(productData.title || productName)}`;
            await page.goto(googleSearchUrl, { waitUntil: 'domcontentloaded' });
            const googleImage = await page.evaluate(() => {
                const img = document.querySelector('img');
                return img ? (img as HTMLImageElement).src : null;
            });
            if (googleImage) imageUrl = googleImage;
        }

  await browser.close();

  // 5. Construct affiliate link
  const affiliateUrl = productUrl + (productUrl.includes('?') ? '&' : '?') + `tag=${affiliateTag}`;

  // 6. Store or return data
  const result = {
    name: productData.title || productName,
    brand: productData.brand,
    price: productData.price,
    reviews: productData.reviews,
    stars: productData.stars,
    imageUrl,
    affiliateUrl,
    sourceUrl: productUrl
  };

  // Example: Save to file (replace with DB logic)
  fs.writeFileSync(`./product-data-${productName.replace(/\s+/g, '_')}.json`, JSON.stringify(result, null, 2));

  return result;
}

// Test invocation for a real product
fetchProductData('Creatine Monohydrate', 'nutriwiseai-20')
  .then(result => {
    console.log('Test product data:', result);
  })
  .catch(error => {
    console.error('Error fetching product data:', error);
  });
