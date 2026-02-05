# Action Required: Configure Google Drive Image URLs

## Summary

I've created a complete system to load dish images from your Google Drive folder instead of storing them locally. However, to complete the setup, you need to provide the Google Drive file IDs for each image.

## What I've Built

✅ **Configuration System**
- `tools/google-drive-config.json` - Ready to receive your file IDs
- `tools/update-gdrive-images.js` - Automatically updates dishMedia.json with Google Drive URLs
- `tools/populate-gdrive-config.js` - Interactive tool to help you enter file IDs
- `tools/extract-gdrive-ids.js` - Helper to extract file IDs from links

✅ **Documentation**
- `GOOGLE_DRIVE_IMAGES.md` - Complete setup guide
- Updated `README.md` with Google Drive option

✅ **NPM Script**
- `npm run update-gdrive-images` - One command to apply all changes

## What You Need to Do

### Quick Start (5 minutes)

1. **Open your Google Drive folder:**
   https://drive.google.com/drive/folders/1Pie59v2eGH8vBbk-bCyDFO55_nH5mnXJ?usp=sharing

2. **Run the interactive setup:**
   ```bash
   node tools/populate-gdrive-config.js
   ```
   
   This script will ask for each image's Google Drive link. For each image:
   - Right-click the file in Google Drive
   - Select "Get link" or "Share"
   - Copy the link (format: `https://drive.google.com/file/d/{FILE_ID}/view`)
   - Paste it when prompted

3. **Apply the configuration:**
   ```bash
   npm run update-gdrive-images
   ```

4. **Test it:**
   ```bash
   npm run dev
   ```
   Visit http://localhost:5173 and verify images load from Google Drive

### Images Needed

The script will prompt for these 13 images:
- ✅ snack-eggshell.webp
- ✅ snack-mushroom-tartlet.webp
- ✅ amuse-bouche.webp
- ✅ bread-course.webp
- ✅ starter-1.webp
- ✅ starter-2.webp
- ✅ egg-royale.webp
- ✅ between.webp
- ✅ surprise.webp
- ✅ main-course.webp
- ✅ pre-dessert.webp
- ✅ dessert.webp
- ✅ friandises.webp

## Why File IDs Are Needed

Google Drive uses unique file IDs (not filenames) to identify files. These IDs are part of the shareable link:

```
https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view
                            ↑ This is the file ID ↑
```

The system converts these to direct-view URLs:
```
https://drive.google.com/uc?export=view&id=1AbCdEfGhIjKlMnOpQrStUvWxYz
```

These URLs allow images to be embedded directly in the web application.

## How It Works

1. **Before**: Images reference local paths
   ```json
   "imageUrl": "/media/dishes/tasting/snack-eggshell.webp"
   ```

2. **After**: Images reference Google Drive
   ```json
   "imageUrl": "https://drive.google.com/uc?export=view&id=1AbCdEfGhIjKlMnOpQrStUvWxYz"
   ```

3. **Result**: Application loads images directly from Google Drive - no local storage needed!

## Alternative: Manual Configuration

If you prefer to edit the JSON directly:

1. Edit `tools/google-drive-config.json`
2. Replace each `PASTE_FILE_ID_HERE` with the actual file ID
3. Run `npm run update-gdrive-images`

## Troubleshooting

**Q: Can't access Google Drive folder?**
- Make sure the folder is set to "Anyone with the link can view"
- Verify you're signed in to the correct Google account

**Q: File IDs not working?**
- Double-check the file ID (between `/d/` and `/view` in the link)
- Ensure files haven't been moved or deleted
- Test a direct URL: `https://drive.google.com/uc?export=view&id={YOUR_FILE_ID}`

**Q: Want to use local images instead?**
- Download images from Google Drive
- Place them in `server/public/media/dishes/tasting/`
- No configuration needed - app will use local paths

## Questions?

- See `GOOGLE_DRIVE_IMAGES.md` for detailed documentation
- Check `README.md` for general setup instructions
- All helper tools are in the `tools/` directory

---

**Ready to proceed?** Run `node tools/populate-gdrive-config.js` to get started!
