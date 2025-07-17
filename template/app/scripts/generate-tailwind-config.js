const fs = require('fs');
const path = require('path');

// Read CSS variables from Main.css
function extractCSSVariables(cssContent) {
  const variables = {};
  const regex = /--([^:]+):\s*([^;]+);/g;
  let match;
  
  while ((match = regex.exec(cssContent)) !== null) {
    const [, name, value] = match;
    variables[name] = value.trim();
  }
  
  return variables;
}

// Generate Tailwind config from CSS variables
function generateTailwindConfig(variables) {
  const colors = {};
  
  // Map CSS variables to Tailwind color structure
  Object.entries(variables).forEach(([name, value]) => {
    if (name.includes('-')) {
      const [base, variant] = name.split('-');
      if (!colors[base]) colors[base] = {};
      
      if (variant) {
        colors[base][variant] = `hsl(var(--${name}))`;
      } else {
        colors[base] = `hsl(var(--${name}))`;
      }
    } else {
      colors[name] = `hsl(var(--${name}))`;
    }
  });
  
  return colors;
}

// Main execution
const cssPath = path.join(__dirname, '../src/client/Main.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');
const variables = extractCSSVariables(cssContent);
const generatedColors = generateTailwindConfig(variables);

console.log('Generated colors from CSS variables:');
console.log(JSON.stringify(generatedColors, null, 2)); 