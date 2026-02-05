# Google Drive Image Integration

This document explains how to configure the application to load dish images from Google Drive instead of local storage.

## Overview

Images for the tasting menu can be loaded directly from Google Drive, allowing easier image management and sharing without needing to download and store images locally.

## Setup Instructions

### Step 1: Get Google Drive File IDs

1. **Open the Google Drive folder:**
   - Visit: https://drive.google.com/drive/folders/1Pie59v2eGH8vBbk-bCyDFO55_nH5mnXJ?usp=sharing

2. **Get each image file's ID:**
   - Right-click on each image file (e.g., `snack-eggshell.webp`)
   - Select "Get link" or "Share"
   - Copy the shareable link - it will look like:
     ```
     https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view?usp=sharing
     ```
   - The file ID is the part between `/d/` and `/view` (e.g., `1AbCdEfGhIjKlMnOpQrStUvWxYz`)

3. **Collect file IDs for all 13 images:**
   - snack-eggshell.webp
   - snack-mushroom-tartlet.webp
   - amuse-bouche.webp
   - bread-course.webp
   - starter-1.webp
   - starter-2.webp
   - egg-royale.webp
   - between.webp
   - surprise.webp
   - main-course.webp
   - pre-dessert.webp
   - dessert.webp
   - friandises.webp

### Step 2: Configure File IDs

**Option A: Interactive Setup (Recommended)**

Use the interactive helper script:

```bash
node tools/populate-gdrive-config.js
```

This script will:
- Prompt you for each image's Google Drive link
- Automatically extract file IDs
- Update `tools/google-drive-config.json`

**Option B: Manual Setup**

Edit `tools/google-drive-config.json` and replace `PASTE_FILE_ID_HERE` with the actual file IDs:

```json
{
  "images": {
    "snack-eggshell.webp": "1AbCdEfGhIjKlMnOpQrStUvWxYz",
    "snack-mushroom-tartlet.webp": "1BcDeFgHiJkLmNoPqRsTuVwXyZ",
    ...
  }
}
```

**Option C: Extract from Links**

If you have links in a file or clipboard, use the extraction helper:

```bash
# Extract file IDs from links
node tools/extract-gdrive-ids.js "link1" "link2" "link3"

# Or interactively (paste links, Ctrl+D when done)
node tools/extract-gdrive-ids.js
```

### Step 3: Update Image URLs

Run the update script to automatically update `content/media/dishMedia.json` with Google Drive URLs:

```bash
npm run update-gdrive-images
```

This will:
- Read the file IDs from `tools/google-drive-config.json`
- Generate Google Drive direct URLs (format: `https://drive.google.com/uc?export=view&id={FILE_ID}`)
- Update `content/media/dishMedia.json` with the new URLs
- Show a summary of updated images

### Step 4: Verify

Start the development server and verify images load correctly:

```bash
npm run dev
```

Visit http://localhost:5173 and check that dish images are loading from Google Drive.

## Google Drive URL Format

The script converts file IDs to direct-view URLs using this format:

```
https://drive.google.com/uc?export=view&id={FILE_ID}
```

This format allows images to be embedded and displayed directly in web applications.

## Troubleshooting

### Images not loading
- Verify the Google Drive folder and files are set to "Anyone with the link can view"
- Check that file IDs in `google-drive-config.json` are correct
- Ensure the file IDs don't include extra characters or spaces
- Check browser console for CORS or network errors

### File IDs not working
- Make sure you copied the ID from between `/d/` and `/view` in the shareable link
- Verify the files are accessible (not moved or deleted)
- Try opening the direct URL in a browser: `https://drive.google.com/uc?export=view&id={YOUR_FILE_ID}`

## Alternative: Local Images

If you prefer to use local images instead of Google Drive:

1. Download all images from the Google Drive folder
2. Place them in `server/public/media/dishes/tasting/`
3. The application will serve them from the local path: `/media/dishes/tasting/{filename}`

## Notes

- Google Drive URLs remain valid as long as the sharing permissions don't change
- If files are moved or sharing is revoked, images will stop loading
- Consider Google Drive storage limits and access quotas for production use
