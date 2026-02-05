#!/usr/bin/env node

/**
 * Script to update dishMedia.json to use local image paths
 * Use this as an alternative to Google Drive URLs
 */

const fs = require('fs');
const path = require('path');

const DISH_MEDIA_PATH = path.join(__dirname, '..', 'content', 'media', 'dishMedia.json');
const LOCAL_PATH_BASE = '/media/dishes/tasting/';

// Load dishMedia.json
console.log('Loading dishMedia.json...');
const dishMedia = JSON.parse(fs.readFileSync(DISH_MEDIA_PATH, 'utf-8'));

// Update URLs to use local paths
console.log('\nUpdating image URLs to use local paths...\n');

let updatedCount = 0;

const dishes = dishMedia.menus?.tasting?.stages?.published;
if (dishes) {
  for (const [dishId, dishData] of Object.entries(dishes)) {
    const filename = `${dishId}.webp`;
    const localPath = `${LOCAL_PATH_BASE}${filename}`;
    
    const oldUrl = dishData.imageUrl;
    dishData.imageUrl = localPath;
    
    console.log(`✓ Updated ${dishId}:`);
    console.log(`  From: ${oldUrl}`);
    console.log(`  To:   ${localPath}`);
    updatedCount++;
  }
}

// Save updated dishMedia.json
if (updatedCount > 0) {
  dishMedia.generatedAt = new Date().toISOString().split('T')[0];
  fs.writeFileSync(DISH_MEDIA_PATH, JSON.stringify(dishMedia, null, 2) + '\n');
  console.log(`\n✅ Successfully updated ${updatedCount} image URL(s) to use local paths`);
  console.log('\nNext steps:');
  console.log('  1. Ensure images are in server/public/media/dishes/tasting/');
  console.log('  2. Run "npm run dev" to start the development server');
  console.log('  3. Visit http://localhost:5173 to verify images load correctly');
} else {
  console.log('\n❌ No images were updated.');
  process.exit(1);
}
