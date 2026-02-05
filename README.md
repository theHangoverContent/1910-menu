# 1910 Restaurant Menu System

Full-stack restaurant menu application for 1910 restaurant in Grindelwald, Switzerland with bilingual (EN/DE) support, interactive dish hotspots, and automated hotspot generation.

## 🌐 Live Demo (Static)

**https://thehangovercontent.github.io/1910-menu/**

> ⚠️ **Note:** The GitHub Pages version is static (client-only). For full functionality with API and images, run locally (see below).

> 🔧 **If the link shows README instead of the app:** Go to repository Settings → Pages → Change Source from "Deploy from a branch" to "GitHub Actions", then trigger the workflow from the Actions tab.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs dependencies for the root, server, and client workspaces.

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` if you want custom tokens (optional - defaults work fine):
```bash
PORT=8787
ADMIN_TOKEN=your-secret-admin-token
EDITOR_TOKEN=your-secret-editor-token
DEFAULT_STAGE=published
```

### 3. Add Dish Photos (⚠️ REQUIRED MANUAL STEP)

The folder structure is ready, but you need to add your dish images.

**Option A: Load from Google Drive (Recommended)**

Configure the app to load images directly from Google Drive without downloading:

1. See [GOOGLE_DRIVE_IMAGES.md](GOOGLE_DRIVE_IMAGES.md) for detailed instructions
2. Google Drive folder: https://drive.google.com/drive/folders/1Pie59v2eGH8vBbk-bCyDFO55_nH5mnXJ?usp=sharing
3. Quick setup:
   ```bash
   # 1. Edit tools/google-drive-config.json with file IDs from Google Drive
   # 2. Run the update script
   npm run update-gdrive-images
   ```

**Option B: Use Local Images**

Download and store images locally:

**📥 Download images from Google Drive:**
https://drive.google.com/drive/folders/1Pie59v2eGH8vBbk-bCyDFO55_nH5mnXJ?usp=sharing

**📂 Location:** `server/public/media/dishes/tasting/`

**Required images (WebP format recommended):**
- `snack-eggshell.webp`
- `snack-mushroom-tartlet.webp`
- `amuse-bouche.webp`
- `bread-course.webp`
- `starter-1.webp`
- `starter-2.webp`
- `egg-royale.webp`
- `between.webp`
- `surprise.webp`
- `main-course.webp`
- `pre-dessert.webp`
- `dessert.webp`
- `friandises.webp`

**Convert images to WebP (if needed):**
```bash
# If you have JPG/PNG images, use the provided Python tool
python tools/convert_tasting_backups_to_webp.py
```

**Note:** The app will work without images (shows placeholder text), but images are required for interactive hotspots to display properly.

### 4. Run Development Server

```bash
npm run dev
```

This starts:
- **Server**: http://localhost:8787 (Express API)
- **Client**: http://localhost:5173 (React + Vite)

The client proxies `/api` and `/media` requests to the server.

### 5. Access Application

- **Public Menu**: http://localhost:5173
- **Admin Mode**: http://localhost:5173?admin=1
- **German Language**: http://localhost:5173?lang=de
- **Stage Selector**: http://localhost:5173?stage=draft

### 6. Test Admin Features (Optional)

1. Open http://localhost:5173?admin=1
2. Enter your ADMIN_TOKEN (from .env) in the "Admin token" field
3. Click on any dish → "Edit Hotspots"
4. Click "Auto-generate (backend)" to create hotspots
5. Adjust strategy (auto, goldenTriangle, etc.) and seed as needed
6. Click "Save" to persist
7. Refresh page - hotspots remain!

## API Endpoints

### Public Endpoints

```bash
# Health check
curl http://localhost:8787/api/health

# Get brand info
curl http://localhost:8787/api/brand

# Get tasting menu (EN)
curl http://localhost:8787/api/menus/tasting?lang=en

# Get dish media (published stage)
curl http://localhost:8787/api/media/tasting?stage=published

# Get ingredient catalog
curl http://localhost:8787/api/ingredients/catalog

# Get available hotspot layout strategies
curl http://localhost:8787/api/media/layouts
```

### Admin Endpoints (require Bearer token)

```bash
# Auto-generate hotspots for a dish
curl -X POST http://localhost:8787/api/media/autogen \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-admin-token" \
  -d '{
    "menu": "tasting",
    "stage": "published",
    "dishId": "snack-eggshell",
    "strategy": "auto",
    "seed": 1910
  }'

# Manually upsert dish media with hotspots
curl -X POST http://localhost:8787/api/media/upsert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-admin-token" \
  -d '{
    "menu": "tasting",
    "stage": "published",
    "dishId": "snack-eggshell",
    "imageUrl": "/media/dishes/tasting/snack-eggshell.webp",
    "alt": {
      "en": "Snack Eggshell",
      "de": "Snack Eierschale"
    },
    "blurDataURL": "",
    "hotspots": [
      {
        "x": 0.6391,
        "y": 0.6513,
        "ingredientId": "sausage-cream",
        "role": "sauce",
        "label": {
          "en": "Sausage Cream",
          "de": "Wurstcreme"
        }
      }
    ]
  }'
```

## Hotspot Layout Strategies

The backend supports 8 hotspot generation strategies:

1. **auto** - Intelligent picker based on dish type and ingredient count
2. **goldenTriangle** - Hero + sauce + garnish composition
3. **sauceSwipe** - Bézier curve with positioned accents
4. **centerPerimeter** - Core cluster with rim garnish
5. **twoCluster** - Left/right dual composition
6. **rimOnly** - Minimalist perimeter placement
7. **bowlGradient** - Vertical layering for bowls/terrines
8. **chefBias** - Off-center mass + upper accents

Each strategy uses physics-based relaxation to avoid hotspot collisions.

## Stage Management

Content supports 3 stages for workflow:

- **draft** - Work in progress
- **review** - Ready for review
- **published** - Live content (default)

Switch stages via:
- Query param: `?stage=draft`
- API param: `?stage=review`
- Admin UI dropdown

## Project Structure

```
├── content/              # Static content (committed)
│   ├── brand.json
│   ├── ingredients/
│   │   └── ingredientsCatalog.json
│   ├── menus/
│   │   ├── tasting.json
│   │   ├── alacarte.json
│   │   ├── daily.json
│   │   ├── winelist.json
│   │   └── bardrinks.json
│   └── media/
│       └── dishMedia.json (seed data)
├── server/              # Express API
│   ├── index.js         # Main server
│   ├── auth.js          # Token middleware
│   ├── db.js            # File-based persistence
│   ├── hotspotLayouts.js # 8 layout algorithms
│   ├── data/            # Runtime storage
│   │   └── dishMedia.json (auto-seeded, gitignored)
│   └── public/
│       └── media/       # Static dish images
├── client/              # React + Vite
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── theme.css
│   │   ├── components/
│   │   │   └── DishMediaHotspots.jsx
│   │   └── hotspots/
│   │       └── layouts.js
│   └── vite.config.js
└── tools/               # Utilities
    └── convert_tasting_backups_to_webp.py
```

## Build and Deploy

### Local Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Deploy to GitHub Pages

The repository is configured to automatically deploy to GitHub Pages when changes are pushed to the `main` branch.

**⚠️ IMPORTANT: One-time Setup Required**

If you see the README content instead of the React app at your GitHub Pages URL, you need to configure the Pages source:

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar, under "Code and automation")
4. Under **Build and deployment** → **Source**, select **"GitHub Actions"** (NOT "Deploy from a branch")
5. Click **Save**
6. Go to the **Actions** tab and either:
   - Wait for the next push to `main` branch, OR
   - Click on "Deploy to GitHub Pages" workflow → "Run workflow" → "Run workflow" (manual trigger)

**🌐 Live Website URL:**

Once deployed, the React app will be available at:

**https://thehangovercontent.github.io/1910-menu/**

**Manual deployment:**
```bash
# Trigger workflow manually from Actions tab
# or push to main branch
git push origin main
```

**Troubleshooting:**
- If you see README content: Verify GitHub Pages Source is set to "GitHub Actions" (not a branch)
- If you get 404: Wait 2-3 minutes after deployment, then refresh. Check Actions tab for deployment status.
- If assets don't load: Clear browser cache or try incognito mode

**Note:** The static GitHub Pages deployment serves only the React client. API endpoints and dynamic features (like hotspot editing) require running the backend server locally (see Local Production Build above).

## Adding Dish Images

1. Place images in `server/public/media/dishes/tasting/`
2. Use WebP format for best performance
3. Use Python tool to convert: `python tools/convert_tasting_backups_to_webp.py`

## Features

- ✨ Bilingual menu viewer (EN/DE)
- ✨ Interactive dish hotspots with tooltips
- ✨ Admin mode with drag-to-edit hotspots
- ✨ Backend hotspot autogeneration (8 strategies)
- ✨ Stage-aware media management
- ✨ Wine/beer/juice pairings
- ✨ Ingredient catalog drawer
- ✨ Lightbox image zoom
- ✨ Progressive image loading with blur placeholders

## Development Notes

- Server auto-seeds `server/data/dishMedia.json` from `content/media/dishMedia.json` on first run
- Client uses Vite proxy to avoid CORS issues during development
- Token auth is simple bearer tokens (no JWT validation)
- Hotspot coordinates are normalized (0-1 range) for responsive display
