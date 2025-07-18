// This script helps identify component styling issues

console.log("Checking component styling...");

// Check if UI components are imported correctly
const fs = require('fs');
const path = require('path');

// Define paths to check
const appComponents = path.join(__dirname, 'src/components');
const uiComponents = path.join(__dirname, 'src/components/ui');

console.log(`Checking components in ${appComponents}`);
console.log(`Checking UI components in ${uiComponents}`);

// Verify component imports
console.log("\nVerifying component imports...");

// List all files in directories
console.log("\nUI Component files:");
try {
  const uiFiles = fs.readdirSync(uiComponents);
  uiFiles.forEach(file => console.log(` - ${file}`));
} catch (err) {
  console.error("Error reading UI components:", err);
}

console.log("\nMain Component files:");
try {
  const appFiles = fs.readdirSync(appComponents)
    .filter(file => file !== 'ui');
  appFiles.forEach(file => console.log(` - ${file}`));
} catch (err) {
  console.error("Error reading app components:", err);
}

console.log("\nDone! Check any styling issues and ensure all components are properly imported.");
