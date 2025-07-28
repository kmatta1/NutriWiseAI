// Script to fix all placeholder images in comprehensive-supplements.js
import fs from 'fs';

const filePath = 'c:\\repo\\NutriWiseAI\\src\\lib\\comprehensive-supplements.js';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Define replacement mappings
const replacements = {
  'https://via.placeholder.com/300x300/4F46E5/white?text=Vitamin+D3+2000': 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/4F46E5/white?text=Vitamin+D3+5000': 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/4F46E5/white?text=Vitamin+D3+1000': 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/F59E0B/white?text=Omega-3+Fish': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/F59E0B/white?text=Omega-3+Algae': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/F59E0B/white?text=High+Potency+Omega-3': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/10B981/white?text=Mg+Glycinate': 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/10B981/white?text=Mg+Citrate': 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/10B981/white?text=Mg+Oxide': 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/DC2626/white?text=Whey+Isolate': 'https://images.unsplash.com/photo-1583500178690-594ce94555e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/DC2626/white?text=Plant+Protein': 'https://images.unsplash.com/photo-1583500178690-594ce94555e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/DC2626/white?text=Casein': 'https://images.unsplash.com/photo-1583500178690-594ce94555e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/7C3AED/white?text=Creatine+Mono': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/7C3AED/white?text=Creatine+HCL': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/059669/white?text=Men\'s+Multi': 'https://images.unsplash.com/photo-1607619662634-3ac55ec8c2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/059669/white?text=Women\'s+Multi': 'https://images.unsplash.com/photo-1607619662634-3ac55ec8c2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/059669/white?text=Senior+Multi': 'https://images.unsplash.com/photo-1607619662634-3ac55ec8c2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/FFA500/white?text=Vitamin+C': 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/8B5CF6/white?text=Zinc': 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/22C55E/white?text=Probiotics': 'https://images.unsplash.com/photo-1607619662634-3ac55ec8c2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  'https://via.placeholder.com/300x300/EF4444/white?text=B-Complex': 'https://images.unsplash.com/photo-1550572017-edd951aa8f3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80'
};

// Apply all replacements
for (const [oldUrl, newUrl] of Object.entries(replacements)) {
  content = content.replace(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUrl);
}

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('Fixed all placeholder images in comprehensive-supplements.js');
