import { VERIFIED_SUPPLEMENTS } from '../src/lib/cached-stack-service.ts';
import { fetchProductData } from './product-data-fetcher.ts';
import fs from 'fs';
import path from 'path';
import https from 'https';

// Fix __dirname for ES modules
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadImage(imageUrl: string, filename: string, retries = 3): Promise<string> {
  const dirPath = path.join(__dirname, '../public/images/supplements');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  const destPath = path.join(dirPath, filename);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        https.get(imageUrl, (response) => {
          if (response.statusCode !== 200) {
            file.close();
            fs.unlink(destPath, () => {});
            return reject(new Error(`Failed to download image: ${response.statusCode}`));
          }
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(undefined);
          });
        }).on('error', (err) => {
          file.close();
          fs.unlink(destPath, () => {});
          reject(err);
        });
      });
      return `/images/supplements/${filename}`;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(res => setTimeout(res, 1000 * attempt)); // Exponential backoff
    }
  }
  throw new Error('Image download failed after retries');
}

async function updateAllSupplements(affiliateTag: string) {
  const updatedSupplements = [];
  const failedImages: string[] = [];
  for (const supplement of VERIFIED_SUPPLEMENTS) {
    try {
      console.log(`Fetching data for: ${supplement.name}`);
      const result = await fetchProductData(supplement.name, affiliateTag);
      let localImagePath = result.imageUrl;
      if (result.imageUrl && result.imageUrl.startsWith('http')) {
        // Generate a safe filename
        const safeName = result.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const ext = path.extname(result.imageUrl).split('?')[0] || '.jpg';
        const filename = `${safeName}${ext}`;
        try {
          localImagePath = await downloadImage(result.imageUrl, filename);
        } catch (imgErr) {
          console.error(`Image download failed for ${result.name}:`, imgErr);
          failedImages.push(`${supplement.name}: ${result.imageUrl}`);
          // Fallback: try Google Images if not already
          if (result.imageUrl && !result.imageUrl.includes('googleusercontent')) {
            try {
              const googleResult = await fetchProductData(supplement.name + ' supplement', affiliateTag);
              if (googleResult.imageUrl && googleResult.imageUrl.startsWith('http')) {
                const googleFilename = `${safeName}_google${path.extname(googleResult.imageUrl).split('?')[0] || '.jpg'}`;
                localImagePath = await downloadImage(googleResult.imageUrl, googleFilename);
              } else {
                localImagePath = '/images/supplements/placeholder.jpg';
              }
            } catch (googleErr) {
              console.error(`Google image download failed for ${supplement.name}:`, googleErr);
              failedImages.push(`${supplement.name} (Google): ${googleErr}`);
              localImagePath = '/images/supplements/placeholder.jpg';
            }
          } else {
            localImagePath = '/images/supplements/placeholder.jpg';
          }
        }
      }
      updatedSupplements.push({
        ...supplement,
        name: result.name,
        brand: result.brand,
        price: result.price,
        reviewCount: result.reviews,
        rating: result.stars,
        imageUrl: localImagePath,
        affiliateUrl: result.affiliateUrl,
        amazonUrl: result.sourceUrl,
        lastUpdated: new Date().toISOString(),
        verified: true
      });
    } catch (err) {
      console.error(`Failed for ${supplement.name}:`, err);
      updatedSupplements.push(supplement);
    }
  }
  if (failedImages.length > 0) {
    fs.writeFileSync('./failed-image-downloads.txt', failedImages.join('\n'));
    console.log(`Some images failed to download. See failed-image-downloads.txt for details.`);
  }
  fs.writeFileSync('./updated-supplements.json', JSON.stringify(updatedSupplements, null, 2));
  console.log('All supplements updated and saved to updated-supplements.json');
}

updateAllSupplements('nutriwiseai-20');
