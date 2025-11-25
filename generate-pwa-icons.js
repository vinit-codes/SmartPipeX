// Simple script to create placeholder PWA icon files
const fs = require('fs');
const path = require('path');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create placeholder icon files
iconSizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  // Create a simple SVG and convert to PNG placeholder
  const svgContent = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#3b82f6"/>
      <rect x="${size/4}" y="${size/4}" width="${size/2}" height="${size/2}" fill="#ffffff" rx="${size/8}"/>
      <text x="${size/2}" y="${size/2 + size/16}" text-anchor="middle" fill="#3b82f6" font-family="Arial" font-size="${size/8}" font-weight="bold">SP</text>
    </svg>
  `;
  
  // For this demo, we'll create a simple text file as placeholder
  fs.writeFileSync(iconPath.replace('.png', '.svg'), svgContent);
  fs.writeFileSync(iconPath + '.placeholder', `SmartPipeX icon ${size}x${size} - Replace with actual PNG`);
});

console.log('✅ PWA icon placeholders created in public/icons/');
console.log('📝 Please replace .placeholder files with actual PNG icons');
