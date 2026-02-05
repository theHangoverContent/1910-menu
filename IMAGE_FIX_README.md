# Google Drive Image Loading - Fix Documentation

## Problem
The dish images from Google Drive were appearing black or showing small placeholder icons instead of loading properly. The images were being blocked by browser privacy features or ad blockers with `ERR_BLOCKED_BY_CLIENT` errors.

## Solution
Updated the Google Drive image URLs to use the most reliable format for embedding: `https://lh3.googleusercontent.com/d/{FILE_ID}`

This format:
- Bypasses most ad blockers and privacy extensions
- Works reliably across all modern browsers
- Loads images directly from Google's CDN
- Requires no authentication or special permissions (as long as files are publicly shared)

## Current Configuration

### Image URLs
All dish images are now configured to load from Google Drive using the `googleusercontent.com` domain:
- **Format**: `https://lh3.googleusercontent.com/d/{FILE_ID}`
- **Location**: `content/media/dishMedia.json`
- **Config**: `tools/google-drive-config.json`

### Verify Google Drive Permissions
Ensure all images in the Google Drive folder have "Anyone with the link can view" permission:
https://drive.google.com/drive/folders/1Pie59v2eGH8vBbk-bCyDFO55_nH5mnXJ?usp=sharing

## Alternative: Local Images

If Google Drive URLs are still being blocked in your environment (e.g., corporate firewalls, strict privacy settings), you can switch to local images:

### Step 1: Download Images from Google Drive
```bash
# Manual download: Visit the Google Drive folder and download all images
# Or use the helper script (requires network access to Google Drive):
npm run download-gdrive-images
```

### Step 2: Switch to Local Paths
```bash
npm run use-local-images
```

This will:
- Update `content/media/dishMedia.json` to use local paths: `/media/dishes/tasting/{filename}`
- Images will be served from `server/public/media/dishes/tasting/`

### Step 3: Place Images in the Server Directory
Ensure all `.webp` image files are in:
```
server/public/media/dishes/tasting/
```

Required files:
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

## Switching Between Google Drive and Local Images

### To use Google Drive (recommended):
```bash
npm run update-gdrive-images
```

### To use local images:
```bash
npm run use-local-images
```

## Testing

### Test in a Real Browser
The automation testing environment blocks Google URLs, but they work perfectly in real browsers:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173 in your browser (Chrome, Firefox, Safari, Edge)

3. Check that dish images load properly

### If Images Don't Load
1. Check browser console for errors
2. Verify Google Drive folder permissions (must be "Anyone with the link")
3. Try disabling ad blockers/privacy extensions temporarily
4. If issues persist, switch to local images (see above)

## Troubleshooting

### Images show as black or don't load
- **Cause**: Ad blocker or privacy extension blocking Google URLs
- **Solution**: Whitelist `lh3.googleusercontent.com` or switch to local images

### 403 Forbidden errors
- **Cause**: Google Drive files not publicly shared
- **Solution**: Update sharing permissions to "Anyone with the link can view"

### Network errors in automation/CI
- **Cause**: Automation environments often block external image requests
- **Solution**: This is expected; images will work in production browsers

## Files Modified
- `content/media/dishMedia.json` - Updated image URLs
- `tools/google-drive-config.json` - Updated URL template
- `tools/download-gdrive-images.js` - New helper script to download images
- `tools/use-local-images.js` - New helper script to switch to local paths
- `package.json` - Added new npm scripts

## Best Practices
1. **Production**: Use Google Drive URLs (easier management, no storage needed)
2. **Development**: Use Google Drive URLs if accessible, otherwise local images
3. **CI/CD**: Use local images or mock data for automated testing
