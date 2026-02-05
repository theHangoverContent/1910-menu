#!/usr/bin/env node

/**
 * Helper script to extract Google Drive file IDs from shareable links
 * 
 * Usage:
 *   node tools/extract-gdrive-ids.js <link1> <link2> ...
 * 
 * Or paste links interactively:
 *   node tools/extract-gdrive-ids.js
 */

const readline = require('readline');

function extractFileId(url) {
  // Match patterns like:
  // https://drive.google.com/file/d/{FILE_ID}/view
  // https://drive.google.com/open?id={FILE_ID}
  // https://drive.google.com/uc?id={FILE_ID}
  
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

if (process.argv.length > 2) {
  // Process command-line arguments
  console.log('Extracting file IDs from provided links:\n');
  
  for (let i = 2; i < process.argv.length; i++) {
    const url = process.argv[i];
    const fileId = extractFileId(url);
    
    if (fileId) {
      console.log(`✓ ${url}`);
      console.log(`  File ID: ${fileId}\n`);
    } else {
      console.log(`✗ ${url}`);
      console.log(`  Could not extract file ID\n`);
    }
  }
} else {
  // Interactive mode
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('Google Drive File ID Extractor');
  console.log('==============================\n');
  console.log('Paste Google Drive shareable links (one per line)');
  console.log('Press Ctrl+D (Unix) or Ctrl+Z (Windows) when done\n');
  
  rl.on('line', (line) => {
    const url = line.trim();
    if (url) {
      const fileId = extractFileId(url);
      
      if (fileId) {
        console.log(`  → File ID: ${fileId}`);
      } else {
        console.log(`  → Could not extract file ID`);
      }
    }
  });
  
  rl.on('close', () => {
    console.log('\nDone!');
  });
}
