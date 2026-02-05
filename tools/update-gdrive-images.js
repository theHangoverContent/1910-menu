#!/usr/bin/env node

/**
 * Script to update dishMedia.json with Google Drive image URLs
 * 
 * Usage:
 *   1. Edit tools/google-drive-config.json with actual file IDs from Google Drive
 *   2. Run: node tools/update-gdrive-images.js
 *   3. Optional: Use --validate flag to check if URLs are accessible
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CONFIG_PATH = path.join(__dirname, 'google-drive-config.json');
const DISH_MEDIA_PATH = path.join(__dirname, '..', 'content', 'media', 'dishMedia.json');

const VALIDATE = process.argv.includes('--validate');

// Load configuration
console.log('Loading Google Drive configuration...');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

// Load dishMedia.json
console.log('Loading dishMedia.json...');
const dishMedia = JSON.parse(fs.readFileSync(DISH_MEDIA_PATH, 'utf-8'));

// Helper function to validate URL accessibility
function validateUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

// Update URLs
async function updateUrls() {
  let updatedCount = 0;
  const urlTemplate = config.urlTemplate;

  console.log('\nUpdating image URLs...');

  for (const [filename, fileId] of Object.entries(config.images)) {
    if (!fileId || fileId === 'PASTE_FILE_ID_HERE') {
      console.log(`⚠️  Skipping ${filename} - no file ID configured`);
      continue;
    }

    // Extract dishId from filename (remove .webp extension)
    const dishId = filename.replace('.webp', '');
    
    // Build Google Drive URL
    const googleDriveUrl = urlTemplate.replace('{FILE_ID}', fileId);
    
    // Validate URL if requested
    if (VALIDATE) {
      process.stdout.write(`  Validating ${filename}...`);
      const isValid = await validateUrl(googleDriveUrl);
      if (!isValid) {
        console.log(` ❌ URL not accessible`);
        console.log(`    Check file ID: ${fileId}`);
        continue;
      }
      console.log(` ✓`);
    }
    
    // Update in dishMedia.json
    if (dishMedia.menus?.tasting?.stages?.published?.[dishId]) {
      const oldUrl = dishMedia.menus.tasting.stages.published[dishId].imageUrl;
      dishMedia.menus.tasting.stages.published[dishId].imageUrl = googleDriveUrl;
      console.log(`✓ Updated ${dishId}:`);
      console.log(`  From: ${oldUrl}`);
      console.log(`  To:   ${googleDriveUrl}`);
      updatedCount++;
    } else {
      console.log(`⚠️  Dish not found in dishMedia.json: ${dishId}`);
    }
  }

  // Save updated dishMedia.json
  if (updatedCount > 0) {
    dishMedia.generatedAt = new Date().toISOString().split('T')[0];
    fs.writeFileSync(DISH_MEDIA_PATH, JSON.stringify(dishMedia, null, 2) + '\n');
    console.log(`\n✅ Successfully updated ${updatedCount} image URL(s) in dishMedia.json`);
    console.log('\nNext steps:');
    console.log('  1. Run "npm run dev" to start the development server');
    console.log('  2. Visit http://localhost:5173 to verify images load correctly');
  } else {
    console.log('\n❌ No images were updated. Please configure file IDs in tools/google-drive-config.json');
    console.log('\nSee GOOGLE_DRIVE_IMAGES.md for instructions on getting file IDs.');
    process.exit(1);
  }
}

updateUrls().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
