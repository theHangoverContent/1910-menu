# Dish Photos

## ⚠️ MANUAL STEP REQUIRED

This directory needs to contain dish photos for the tasting menu.

### Download Images

**📥 Google Drive Link:**
https://drive.google.com/drive/folders/1Pie59v2eGH8vBbk-bCyDFO55_nH5mnXJ?usp=sharing

### Required Files

Place the following WebP images in this directory:

```
snack-eggshell.webp
snack-mushroom-tartlet.webp
amuse-bouche.webp
bread-course.webp
starter-1.webp
starter-2.webp
egg-royale.webp
between.webp
surprise.webp
main-course.webp
pre-dessert.webp
dessert.webp
friandises.webp
```

### File Format

- **Recommended:** WebP format (best performance)
- **Fallback:** JPG or PNG (use conversion tool below)

### Converting Images

If you have JPG/PNG images instead of WebP:

1. Place your JPG/PNG files in this directory
2. Run the conversion tool from the repo root:
   ```bash
   python tools/convert_tasting_backups_to_webp.py
   ```
3. The tool will create .webp versions of your images

### Note

The application will work without images (showing placeholder text), but images are required for the interactive hotspot feature to display properly.

### URL Path

Images placed here will be served at:
```
http://localhost:8787/media/dishes/tasting/<filename>.webp
```
