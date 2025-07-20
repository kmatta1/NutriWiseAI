// Test script to debug advisor form submission
// Run this in browser console to test form validation

console.log("Testing advisor form submission...");

// Check if form elements exist
const form = document.querySelector('form');
console.log("Form found:", !!form);

// Check required fields
const requiredFields = [
  'fitnessGoals',
  'gender', 
  'age',
  'weight',
  'activityLevel',
  'diet',
  'sleepQuality',
  'race'
];

requiredFields.forEach(field => {
  const element = document.querySelector(`[name="${field}"]`);
  console.log(`${field}:`, element ? element.value || 'empty' : 'not found');
});

// Check submit button
const submitButton = document.querySelector('button[type="submit"]');
console.log("Submit button found:", !!submitButton);
console.log("Submit button disabled:", submitButton?.disabled);

// Test form validation
if (form) {
  form.addEventListener('submit', (e) => {
    console.log("Form submitted!", e);
  });
}
