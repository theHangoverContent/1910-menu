# 1910 Restaurant Menu System

Full-stack restaurant menu application for 1910 restaurant in Grindelwald, Switzerland with bilingual (EN/DE) support, interactive dish hotspots, and automated hotspot generation.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs dependencies for the root, server, and client workspaces.

### 2. Configure Environment

Copy `.env.example` to `.env` and update tokens:

```bash
cp .env.example .env
```

Edit `.env`:
```bash
PORT=8787
ADMIN_TOKEN=your-secret-admin-token
EDITOR_TOKEN=your-secret-editor-token
DEFAULT_STAGE=published
```

### 3. Run Development Server

```bash
npm run dev
```

This starts:
- **Server**: http://localhost:8787 (Express API)
- **Client**: http://localhost:5173 (React + Vite)

The client proxies `/api` and `/media` requests to the server.

### 4. Access Application

- **Public Menu**: http://localhost:5173
- **Admin Mode**: http://localhost:5173?admin=1
- **German Language**: http://localhost:5173?lang=de
- **Stage Selector**: http://localhost:5173?stage=draft

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

```bash
# Build for production
npm run build

# Start production server
npm start
```

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
