#!/usr/bin/env tsx

/**
 * QR Code Generator for ThaiCopilot Landing Page
 *
 * Usage:
 *   npm run generate-qr              # Generate QR for main landing page
 *   npm run generate-qr condo_poster # Generate QR with UTM source
 *
 * The QR codes will be saved in the public/ directory as PNG files
 */

import QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.BASE_URL || 'https://thaicopilot.com';
const OUTPUT_DIR = path.join(__dirname, '../public/qr-codes');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateQRCode(url: string, filename: string) {
  try {
    const outputPath = path.join(OUTPUT_DIR, filename);

    // Generate high-resolution QR code for printing
    await QRCode.toFile(outputPath, url, {
      width: 1000, // High resolution for printing
      margin: 2,
      color: {
        dark: '#000000', // Black
        light: '#FFFFFF', // White background
      },
      errorCorrectionLevel: 'H', // High error correction for damaged/dirty posters
    });

    console.log(`✅ QR Code generated: ${filename}`);
    console.log(`   URL: ${url}`);
    console.log(`   Saved to: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error generating QR code:`, error);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const source = args[0] || 'direct';

  // Generate URL with UTM source if provided
  const url = source === 'direct' ? BASE_URL : `${BASE_URL}/?source=${source}`;
  const filename = source === 'direct' ? 'qr-landing-page.png' : `qr-${source}.png`;

  console.log(`\n🔧 Generating QR Code for ThaiCopilot...`);
  console.log(`   Source: ${source}`);
  console.log(`   Base URL: ${BASE_URL}\n`);

  await generateQRCode(url, filename);

  // Also generate a version with colored branding (purple gradient)
  const brandedFilename = source === 'direct'
    ? 'qr-landing-page-branded.png'
    : `qr-${source}-branded.png`;

  await QRCode.toFile(path.join(OUTPUT_DIR, brandedFilename), url, {
    width: 1000,
    margin: 2,
    color: {
      dark: '#9333EA', // Purple-600 (brand color)
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  });

  console.log(`✅ Branded QR Code generated: ${brandedFilename}\n`);
  console.log(`\n🎉 All QR codes generated successfully!`);
  console.log(`📂 Output directory: ${OUTPUT_DIR}\n`);
  console.log(`💡 Tips:`);
  console.log(`   - Use the regular version for best scanning reliability`);
  console.log(`   - Use the branded version for marketing materials`);
  console.log(`   - Print at least 5cm x 5cm for optimal scanning\n`);
}

main().catch(console.error);
