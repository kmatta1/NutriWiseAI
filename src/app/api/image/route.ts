// src/app/api/image/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Using node-fetch to ensure consistent behavior across environments
import fetch from 'node-fetch';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Error: Missing image URL parameter.', { status: 400 });
  }

  // Validate the URL to ensure it's from allowed domains
  try {
    const url = new URL(imageUrl);
    const allowedDomains = [
      'media-amazon.com',
      'images-amazon.com', 
      'ssl-images-amazon.com',
      'placehold.co', // Updated placeholder service
      'placeholder.com',
      'images.weserv.nl' // Added external proxy service
    ];
    
    const isAllowed = allowedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith('.' + domain)
    );
    
    // Debugging logs
    console.log(`[Image Proxy] Debugging: Received request for URL: ${imageUrl}`);
    console.log(`[Image Proxy] Allowed domains: ${allowedDomains.join(', ')}`);
    console.log(`[Image Proxy] Validation result for ${url.hostname}: ${isAllowed}`);
    
    if (!isAllowed) {
      return new NextResponse(`Error: Domain ${url.hostname} not allowed.`, { status: 400 });
    }

    // Modify logic to route Amazon image requests through the proxy
    if (url.hostname.includes('amazon.com')) {
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}`;
      console.log(`[Image Proxy] 🔄 Routing Amazon image through external proxy: ${proxyUrl}`);
      try {
        const response = await fetch(proxyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        });

        // Log upstream fetch response status
        console.log(`[Image Proxy] Upstream fetch response status: ${response.status}`);

        if (!response.ok) {
          console.error(`[Image Proxy] ❌ Proxy fetch failed for ${proxyUrl} with status: ${response.status} ${response.statusText}`);
          return new NextResponse(`Failed to fetch image via proxy. Status: ${response.status}`, { status: response.status });
        }

        const imageArrayBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        console.log(`[Image Proxy] ✅ Successfully fetched via proxy: ${proxyUrl}. Content-Type: ${contentType}`);

        return new NextResponse(imageArrayBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      } catch (error: any) {
        console.error(`[Image Proxy] Catastrophic error for proxy URL ${proxyUrl}:`, error);
        return new NextResponse(`Error proxying image via external service: ${error.message}`, { status: 500 });
      }
    }
  } catch (e) {
    return new NextResponse('Error: Invalid URL format.', { status: 400 });
  }

  console.log(`[Image Proxy] 🚀 Fetching image: ${imageUrl}`);

  try {
    const response = await fetch(imageUrl, {
      headers: {
        // Mimic a browser User-Agent to avoid being blocked
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.amazon.com/', // A common referer
      },
    });

    // Log upstream fetch response status
    console.log(`[Image Proxy] Upstream fetch response status: ${response.status}`);

    if (!response.ok) {
      console.error(`[Image Proxy] ❌ Upstream fetch failed for ${imageUrl} with status: ${response.status} ${response.statusText}`);
      return new NextResponse(`Failed to fetch image. Status: ${response.status}`, { status: response.status });
    }

    // Convert the response to an ArrayBuffer, which is compatible with NextResponse
    const imageArrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    console.log(`[Image Proxy] ✅ Successfully fetched ${imageUrl}. Content-Type: ${contentType}`);

    // Return the image with appropriate headers
    return new NextResponse(imageArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    });
  } catch (error: any) {
    console.error(`[Image Proxy]  catastrophic error for ${imageUrl}:`, error);

    // Fallback handling for DNS resolution failures
    if (error.code === 'ENOTFOUND') {
      console.error(`[Image Proxy] DNS resolution failed for ${imageUrl}. Using fallback image.`);
      const fallbackUrl = 'https://placehold.co/150x150';
      return new NextResponse(await fetch(fallbackUrl).then(res => res.arrayBuffer()), {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    return new NextResponse(`Error proxying image: ${error.message}`, { status: 500 });
  }
}
