#!/usr/bin/env node

/**
 * Interactive script to populate google-drive-config.json with file IDs
 * 
 * Usage:
 *   node tools/populate-gdrive-config.js
 * 
 * This script will:
 * 1. Ask for Google Drive links for each image
 * 2. Extract file IDs from the links
 * 3. Update google-drive-config.json
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CONFIG_PATH = path.join(__dirname, 'google-drive-config.json');

function extractFileId(url) {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

async function main() {
  console.log('Google Drive Configuration Setup');
  console.log('=================================\n');
  
  // Load existing config
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const imageFiles = Object.keys(config.images);
  
  console.log(`This script will help you configure ${imageFiles.length} images.\n`);
  console.log('For each image, paste the shareable Google Drive link.');
  console.log('To skip an image, just press Enter.\n');
  console.log('Google Drive link format:');
  console.log('  https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  function question(prompt) {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  }
  
  let updatedCount = 0;
  
  for (const filename of imageFiles) {
    const currentValue = config.images[filename];
    const hasValue = currentValue && currentValue !== 'PASTE_FILE_ID_HERE';
    
    if (hasValue) {
      console.log(`\n${filename} [already configured: ${currentValue}]`);
      const answer = await question('  Update? (y/N): ');
      if (answer.toLowerCase() !== 'y') {
        continue;
      }
    } else {
      console.log(`\n${filename}`);
    }
    
    const link = await question('  Paste Google Drive link (or Enter to skip): ');
    
    if (!link.trim()) {
      continue;
    }
    
    const fileId = extractFileId(link);
    
    if (fileId) {
      config.images[filename] = fileId;
      console.log(`  ✓ File ID: ${fileId}`);
      updatedCount++;
    } else {
      console.log('  ✗ Could not extract file ID from link');
    }
  }
  
  rl.close();
  
  if (updatedCount > 0) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
    console.log(`\n✅ Updated ${updatedCount} file ID(s) in google-drive-config.json`);
    console.log('\nNext steps:');
    console.log('  1. Run: npm run update-gdrive-images');
    console.log('  2. Run: npm run dev');
    console.log('  3. Visit: http://localhost:5173');
  } else {
    console.log('\n No changes made.');
  }
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
