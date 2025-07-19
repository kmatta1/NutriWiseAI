# Image Configuration Fix

## Issue
Next.js was blocking Amazon product images with the error:
```
Invalid src prop (https://m.media-amazon.com/images/I/81rLlMwAyKL._SL1500_.jpg) on `next/image`, hostname 'm.media-amazon.com' is not configured under images in your 'next.config.js'
```

## Solution
Added the Amazon media domain to the Next.js image configuration in `next.config.ts`:

```typescript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',  // ← Added this
      },
    ],
  },
};
```

## What This Fixes
- ✅ Amazon product images now load properly for premium users
- ✅ "REAL" badge appears on actual product images
- ✅ No more runtime errors when displaying real product photos
- ✅ Premium feature works as intended

## Testing
1. Visit `/advisor` page
2. Fill out and submit the form
3. Click "Stack Details" tab
4. Premium users (50% chance in demo) will see real Amazon product images with "REAL" badges
5. Non-premium users will see generic Unsplash category images

The premium product image feature is now fully functional!
