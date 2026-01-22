const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createLenderIcon(size, outputPath) {
  try {
    // Create a green circular background with money theme
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <!-- Background circle -->
        <circle cx="${size / 2}" cy="${size / 2}" r="${
      size / 2 - 2
    }" fill="#4CAF50" stroke="#2E7D32" stroke-width="2"/>

        <!-- Money bag shape -->
        <ellipse cx="${size / 2}" cy="${size / 2 - size / 6}" rx="${
      size / 3
    }" ry="${size / 4}" fill="#2E7D32"/>
        <rect x="${size / 2 - size / 5}" y="${size / 2 - size / 6}" width="${
      size / 2.5
    }" height="${size / 3.5}" rx="${size / 20}" fill="#2E7D32"/>

        <!-- Money bag handle -->
        <ellipse cx="${size / 2 - size / 6}" cy="${
      size / 2 - size / 3.5
    }" rx="${size / 16}" ry="${size / 20}" fill="#1B5E20"/>
        <ellipse cx="${size / 2 + size / 6}" cy="${
      size / 2 - size / 3.5
    }" rx="${size / 16}" ry="${size / 20}" fill="#1B5E20"/>
        <rect x="${size / 2 - size / 6}" y="${size / 2 - size / 3.2}" width="${
      size / 3
    }" height="${size / 15}" rx="${size / 30}" fill="#1B5E20"/>

        <!-- Dollar sign - scale based on icon size -->
        <text x="${size / 2}" y="${
      size / 2 + size / 8
    }" font-family="Arial, sans-serif" font-size="${
      size / 2.5
    }" font-weight="bold" text-anchor="middle" fill="white">$</text>

        <!-- Coin highlights -->
        <circle cx="${size / 2 - size / 6}" cy="${size / 2 - size / 10}" r="${
      size / 25
    }" fill="#66BB6A"/>
        <circle cx="${size / 2 + size / 6}" cy="${size / 2 - size / 10}" r="${
      size / 25
    }" fill="#66BB6A"/>
        <circle cx="${size / 2}" cy="${size / 2 + size / 15}" r="${
      size / 30
    }" fill="#81C784"/>
      </svg>
    `;

    await sharp(Buffer.from(svg)).png().toFile(outputPath);
    console.log(`✅ Created icon: ${outputPath} (${size}x${size})`);
  } catch (error) {
    console.error(`❌ Failed to create icon ${outputPath}:`, error.message);
  }
}

async function generateIcons() {
  const iconDir = path.join(
    __dirname,
    'ios/lenderapp/Images.xcassets/AppIcon.appiconset',
  );
  const sizes = [
    { name: 'Icon-20@2x.png', size: 40 },
    { name: 'Icon-20@3x.png', size: 60 },
    { name: 'Icon-29@2x.png', size: 58 },
    { name: 'Icon-29@3x.png', size: 87 },
    { name: 'Icon-40@2x.png', size: 80 },
    { name: 'Icon-40@3x.png', size: 120 },
    { name: 'Icon-60@2x.png', size: 120 },
    { name: 'Icon-60@3x.png', size: 180 },
    { name: 'Icon-1024.png', size: 1024 },
  ];

  // Ensure directory exists
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }

  console.log('🎨 Generating LenderApp icons...\n');

  for (const { name, size } of sizes) {
    const outputPath = path.join(iconDir, name);
    await createLenderIcon(size, outputPath);
  }

  console.log('🎨 Generating LenderApp icons...\n');

  for (const { name, size } of sizes) {
    const outputPath = path.join(iconDir, name);
    await createLenderIcon(size, outputPath);
  }

  console.log('\n🎉 All icons generated successfully!');
  console.log('💡 Icon features: Green money bag with dollar sign');
}

generateIcons().catch(console.error);

console.log('Icon generation complete. Note: These are placeholder files.');
console.log(
  'For production, replace with proper PNG icons using the SVG design.',
);
