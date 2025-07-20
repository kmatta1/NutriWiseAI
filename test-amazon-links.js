// Test Amazon affiliate URLs
console.log("Testing Amazon affiliate URLs...");

const testUrls = [
  { name: "Whey Protein Isolate", url: "https://www.amazon.com/dp/B000QSNYGI?tag=nutriwiseai-20" },
  { name: "Creatine Monohydrate", url: "https://www.amazon.com/dp/B002DYIZEO?tag=nutriwiseai-20" },
  { name: "Magnesium Glycinate", url: "https://www.amazon.com/dp/B00YQZQH32?tag=nutriwiseai-20" },
  { name: "Vitamin D3", url: "https://www.amazon.com/dp/B000FGDIAI?tag=nutriwiseai-20" }
];

testUrls.forEach(test => {
  console.log(`${test.name}: ${test.url}`);
});

// Test image URLs
console.log("\nTesting product image URLs...");

const testImages = [
  { name: "Whey Protein Isolate", url: "https://m.media-amazon.com/images/I/71BFWQlQ7hL._AC_SL1000_.jpg" },
  { name: "Creatine Monohydrate", url: "https://m.media-amazon.com/images/I/81L9BSiMWDL._AC_SL1500_.jpg" },
  { name: "Magnesium Glycinate", url: "https://m.media-amazon.com/images/I/61rWlZD4sGL._AC_SL1000_.jpg" }
];

testImages.forEach(test => {
  console.log(`${test.name}: ${test.url}`);
});
