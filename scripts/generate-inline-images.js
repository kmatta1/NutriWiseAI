/**
 * Generate inline SVG data URIs for supplement placeholders
 * This ensures images will always load without external dependencies
 */

function createSVGDataUri(text, bgColor, textColor = 'white') {
  const svg = `
    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="300" fill="${bgColor}"/>
      <text x="150" y="150" text-anchor="middle" dominant-baseline="middle" 
            font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${textColor}">
        ${text}
      </text>
    </svg>
  `.trim();
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Generate reliable inline images
const supplementImages = {
  vitaminD3: createSVGDataUri('Vitamin D3', '#4F46E5'),
  omega3: createSVGDataUri('Omega-3', '#F59E0B'),
  magnesium: createSVGDataUri('Magnesium', '#10B981'),
  protein: createSVGDataUri('Protein', '#DC2626'),
  creatine: createSVGDataUri('Creatine', '#7C3AED'),
  multivitamin: createSVGDataUri('Multi', '#059669'),
  vitaminC: createSVGDataUri('Vitamin C', '#FFA500'),
  zinc: createSVGDataUri('Zinc', '#8B5CF6'),
  probiotics: createSVGDataUri('Probiotics', '#22C55E'),
  bComplex: createSVGDataUri('B-Complex', '#EF4444'),
  ashwagandha: createSVGDataUri('Ashwagandha', '#A855F7'),
  turmeric: createSVGDataUri('Turmeric', '#F97316')
};

console.log('Generated inline SVG images:');
Object.entries(supplementImages).forEach(([key, dataUri]) => {
  console.log(`${key}: ${dataUri.substring(0, 50)}...`);
});

module.exports = { supplementImages };
