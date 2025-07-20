/**
 * Test Amazon image URLs to find working ones
 */

async function testImageUrl(url, name) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      console.log(`✅ ${name}: ${url} - WORKING`);
      return true;
    } else {
      console.log(`❌ ${name}: ${url} - FAILED (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: ${url} - ERROR: ${error.message}`);
    return false;
  }
}

async function testAllImages() {
  console.log("🔍 Testing Amazon Image URLs\n");
  
  // Current URLs we're using
  const currentImages = [
    {
      name: "Vitamin D3",
      url: "https://m.media-amazon.com/images/I/61+tZqNiArL._AC_SX300_SY300_.jpg"
    },
    {
      name: "Omega-3",
      url: "https://m.media-amazon.com/images/I/61jI7PmMtjL._AC_SX300_SY300_.jpg"
    },
    {
      name: "Magnesium",
      url: "https://m.media-amazon.com/images/I/61XFgqm5-PL._AC_SX300_SY300_.jpg"
    },
    {
      name: "Whey Protein",
      url: "https://m.media-amazon.com/images/I/81TdByTDkqL._AC_SX300_SY300_.jpg"
    },
    {
      name: "Creatine",
      url: "https://m.media-amazon.com/images/I/61aEyJU7r-L._AC_SX300_SY300_.jpg"
    },
    {
      name: "Multivitamin",
      url: "https://m.media-amazon.com/images/I/71aI2RjxgoL._AC_SX300_SY300_.jpg"
    }
  ];
  
  console.log("Testing current image URLs:");
  for (const image of currentImages) {
    await testImageUrl(image.url, image.name);
  }
  
  console.log("\n🔄 Testing alternative Amazon image formats:");
  
  // Test some known working Amazon image patterns
  const alternativeImages = [
    {
      name: "Test Format 1",
      url: "https://images-na.ssl-images-amazon.com/images/I/41-p7RjnbIL._AC_SX300_SY300_.jpg"
    },
    {
      name: "Test Format 2", 
      url: "https://m.media-amazon.com/images/I/51Ga3tbdABL._AC_UL320_.jpg"
    }
  ];
  
  for (const image of alternativeImages) {
    await testImageUrl(image.url, image.name);
  }
  
  console.log("\n💡 Recommendation: Use placeholder images that definitely work, or implement image proxy");
}

// For Node.js compatibility
if (typeof fetch === 'undefined') {
  console.log("❌ fetch not available in Node.js environment");
  console.log("💡 This test needs to run in a browser environment or with a fetch polyfill");
  console.log("\n🔧 Alternative: Let's use working placeholder images for now");
  
  const workingImages = [
    {
      name: "Vitamin D3",
      url: "https://via.placeholder.com/300x300/4F46E5/white?text=Vitamin+D3"
    },
    {
      name: "Omega-3",
      url: "https://via.placeholder.com/300x300/F59E0B/white?text=Omega-3"
    },
    {
      name: "Magnesium",
      url: "https://via.placeholder.com/300x300/10B981/white?text=Magnesium"
    },
    {
      name: "Whey Protein",
      url: "https://via.placeholder.com/300x300/DC2626/white?text=Protein"
    },
    {
      name: "Creatine",
      url: "https://via.placeholder.com/300x300/7C3AED/white?text=Creatine"
    },
    {
      name: "Multivitamin",
      url: "https://via.placeholder.com/300x300/059669/white?text=Multi"
    }
  ];
  
  console.log("🎯 Working placeholder images to use temporarily:");
  workingImages.forEach(img => {
    console.log(`✅ ${img.name}: ${img.url}`);
  });
} else {
  testAllImages();
}
