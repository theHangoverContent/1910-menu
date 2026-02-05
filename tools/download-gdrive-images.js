#!/usr/bin/env node

/**
 * Script to download Google Drive images locally
 * This provides a fallback when Google Drive URLs are blocked
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const CONFIG_PATH = path.join(__dirname, 'google-drive-config.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'server', 'public', 'media', 'dishes', 'tasting');

// Load configuration
console.log('Loading Google Drive configuration...');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper function to download a file
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        return downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(filepath);
      reject(err);
    });
  });
}

// Download all images
async function downloadImages() {
  let successCount = 0;
  let failCount = 0;

  console.log('\nDownloading images from Google Drive...\n');

  for (const [filename, fileId] of Object.entries(config.images)) {
    if (!fileId || fileId === 'PASTE_FILE_ID_HERE') {
      console.log(`⚠️  Skipping ${filename} - no file ID configured`);
      continue;
    }

    const outputPath = path.join(OUTPUT_DIR, filename);
    
    // Try multiple URL formats
    const urls = [
      `https://drive.google.com/uc?export=download&id=${fileId}`,
      `https://lh3.googleusercontent.com/d/${fileId}`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`
    ];

    let downloaded = false;
    for (const url of urls) {
      try {
        process.stdout.write(`  Downloading ${filename}...`);
        await downloadFile(url, outputPath);
        
        // Check if file was actually downloaded (not an error page)
        const stats = fs.statSync(outputPath);
        if (stats.size > 1000) {  // Reasonable size check
          console.log(` ✓ (${Math.round(stats.size / 1024)}KB)`);
          successCount++;
          downloaded = true;
          break;
        } else {
          fs.unlinkSync(outputPath);
        }
      } catch (error) {
        // Try next URL
      }
    }

    if (!downloaded) {
      console.log(` ❌ Failed`);
      console.log(`    File ID: ${fileId}`);
      failCount++;
    }
  }

  console.log(`\n✅ Downloaded ${successCount} images`);
  if (failCount > 0) {
    console.log(`❌ Failed to download ${failCount} images`);
    console.log('\nNote: Google Drive downloads may fail due to network restrictions.');
    console.log('You can manually download images from:');
    console.log(config.googleDriveFolder);
  } else {
    console.log('\nNext steps:');
    console.log('  1. Update dishMedia.json to use local paths: /media/dishes/tasting/{filename}');
    console.log('  2. Or run: node tools/use-local-images.js');
  }
}

downloadImages().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
