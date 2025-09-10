/**
 * Creates a simple test PNG image for E2E testing
 * This script generates a minimal valid PNG file
 */

import fs from 'fs';
import path from 'path';

// Create a simple 1x1 pixel PNG (smallest valid PNG)
const pngData = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  // PNG signature
  0x00, 0x00, 0x00, 0x0D,                          // IHDR chunk length
  0x49, 0x48, 0x44, 0x52,                          // "IHDR"
  0x00, 0x00, 0x00, 0x01,                          // width: 1
  0x00, 0x00, 0x00, 0x01,                          // height: 1
  0x08, 0x02,                                       // 8 bits per channel, RGB
  0x00, 0x00, 0x00,                                // compression, filter, interlace
  0x90, 0x77, 0x53, 0xDE,                          // CRC
  0x00, 0x00, 0x00, 0x0C,                          // IDAT chunk length
  0x49, 0x44, 0x41, 0x54,                          // "IDAT"
  0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF,  // compressed pixel data
  0xFF, 0x00, 0x00, 0x00,                          // (white pixel)
  0x02, 0x00, 0x01, 0x73,                          // CRC
  0x00, 0x00, 0x00, 0x00,                          // IEND chunk length
  0x49, 0x45, 0x4E, 0x44,                          // "IEND"
  0xAE, 0x42, 0x60, 0x82                           // CRC
]);

const outputPath = path.join(process.cwd(), 'tests/fixtures/test-card.png');

// Write the test PNG file
fs.writeFileSync(outputPath, pngData);

console.log(`✅ Created test PNG image at: ${outputPath}`);
console.log(`📊 File size: ${pngData.length} bytes`);

// Verify the file was created
if (fs.existsSync(outputPath)) {
  const stats = fs.statSync(outputPath);
  console.log(`✅ File verified: ${stats.size} bytes`);
} else {
  console.error('❌ Failed to create test image');
  process.exit(1);
}