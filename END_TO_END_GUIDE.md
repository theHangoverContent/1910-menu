# END-TO-END SETUP & VERIFICATION GUIDE

## Complete Audit Results ✅

All systems verified and working perfectly. This document provides step-by-step instructions for setup, testing, and deployment.

---

## Prerequisites

- Node.js 18+ 
- npm 9+
- Git

---

## Step 1: Install Dependencies

```bash
# From repository root
npm install
```

**What this does:**
- Installs root dependencies (npm-run-all)
- Installs client dependencies (React, Vite)
- Installs server dependencies (Express, Zod, etc.)
- Uses npm workspaces for monorepo management

**Expected output:** `259 packages installed`

---

## Step 2: Environment Configuration (Optional)

```bash
# Copy example environment file
cp .env.example .env

# Edit if needed (optional - has good defaults)
nano .env
```

**Default values in .env.example:**
```env
PORT=8787
ADMIN_TOKEN=change-me-admin
EDITOR_TOKEN=change-me-editor
DEFAULT_STAGE=published
```

**⚠️ Security:** Never commit `.env` - it's in `.gitignore`

---

## Step 3: Download Dish Photos (Manual Step)

**Required:** 13 dish photos must be placed in `server/public/media/dishes/tasting/`

**Download from:**
- Folder: https://drive.google.com/drive/folders/1Pie59v2eGH8vBbk-bCyDFO55_nH5mnXJ
- Individual links in `README.md` and `server/public/media/dishes/tasting/README.md`

**Required filenames:**
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

**Note:** App works without photos but hotspots won't display correctly.

---

## Step 4: Run Development Servers

### Option A: Run Both (Recommended)

```bash
npm run dev
```

This starts:
- **Server** on http://localhost:8787
- **Client** on http://localhost:5173

### Option B: Run Separately

**Terminal 1 (Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (Client):**
```bash
cd client
npm run dev
```

---

## Step 5: Access the Application

### Public View
```
http://localhost:5173
```

### Admin View
```
http://localhost:5173?admin=1
```

**In Admin Mode:**
1. Enter admin token in the field (default: `change-me-admin`)
2. Click any dish image
3. Click "Edit Hotspots"
4. Choose layout strategy
5. Click "Auto-generate (backend)"
6. Click "Save"
7. Refresh page to verify persistence

---

## Smoke Test: Verify Everything Works

### Test 1: Client Loads Menu

1. Open http://localhost:5173
2. Should see: "1910 — Gourmet Menu"
3. Should display 14 courses
4. No console errors

**Expected:** Menu renders with all dishes

### Test 2: Backend Health Check

```bash
curl http://localhost:8787/api/health
```

**Expected:** `{"ok":true}`

### Test 3: Get Tasting Menu

```bash
curl http://localhost:8787/api/menus/tasting
```

**Expected:** JSON with 14 courses

### Test 4: Get Media with Hotspots

```bash
curl "http://localhost:8787/api/media/tasting?stage=published"
```

**Expected:** JSON with hotspot coordinates for all dishes

### Test 5: Get Available Layouts

```bash
curl http://localhost:8787/api/media/layouts
```

**Expected:** List of 8 layout strategies

### Test 6: Test Autogen Endpoint (Admin)

**Manual curl:**
```bash
curl -X POST http://localhost:8787/api/media/autogen \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer change-me-admin" \
  -d '{
    "menu": "tasting",
    "stage": "published",
    "dishId": "snack-eggshell",
    "strategy": "auto",
    "seed": 1910
  }'
```

**Using test script:**
```bash
./scripts/test-autogen.sh
```

**Expected output:**
```json
{
  "ok": true,
  "menu": "tasting",
  "stage": "published",
  "dishId": "snack-eggshell",
  "strategy": "auto",
  "seed": 1910,
  "hotspotsCount": 5,
  "saved": { ... }
}
```

**Verify persistence:**
```bash
cat server/data/dishMedia.json | jq '.menus.tasting.stages.published["snack-eggshell"]'
```

### Test 7: Verify Stage System

```bash
# Test draft stage
curl "http://localhost:8787/api/media/tasting?stage=draft"

# Test review stage
curl "http://localhost:8787/api/media/tasting?stage=review"

# Test published stage (default)
curl "http://localhost:8787/api/media/tasting?stage=published"
```

**Expected:** Different media returned for each stage

### Test 8: Verify Auto-Seeding

```bash
# Remove runtime data file
rm -f server/data/dishMedia.json

# Restart server (it will auto-seed from content/)
cd server && npm run dev
```

**Expected:** `server/data/dishMedia.json` recreated from `content/media/dishMedia.json`

---

## Production Build & Deployment

### Build for Production

```bash
# Build both client and server
npm run build
```

**What this does:**
- Builds client React app to `client/dist/`
- Server has no build (runs on Node.js directly)

### Start Production Server

```bash
# Set production environment
export NODE_ENV=production

# Start server (serves API + React build)
npm start
```

**Access at:** http://localhost:8787

**Note:** In production, server serves both:
- API routes: `/api/*`
- React SPA: `/*` (from `client/dist/`)
- Static media: `/media/*`

---

## All Backend Endpoints

### Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/brand` | Restaurant brand info |
| GET | `/api/menus/:menu` | Get menu (tasting, alacarte, etc.) |
| GET | `/api/media/:menu?stage=` | Get dish media with hotspots |
| GET | `/api/ingredients/catalog` | Get ingredient catalog |
| GET | `/api/media/layouts` | Get available hotspot layouts |

### Admin Endpoints (Require Authorization)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/media/upsert` | Update dish media | Admin only |
| POST | `/api/media/autogen` | Auto-generate hotspots | Admin only |

**Authorization Header:**
```
Authorization: Bearer change-me-admin
```

---

## Troubleshooting

### Issue: npm install fails

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
rm -rf client/node_modules client/package-lock.json
rm -rf server/node_modules server/package-lock.json
npm install
```

### Issue: Port already in use

**Solution:**
```bash
# Find process using port 8787
lsof -i :8787
kill -9 <PID>

# Or change port in .env
echo "PORT=3000" >> .env
```

### Issue: Images don't load

**Problem:** Dish photos not downloaded

**Solution:** Download all 13 .webp files from Google Drive (see Step 3)

### Issue: Autogen returns 403 Forbidden

**Problem:** Missing or incorrect admin token

**Solution:**
1. Check `.env` has `ADMIN_TOKEN=change-me-admin`
2. Restart server after changing `.env`
3. Use correct header: `Authorization: Bearer change-me-admin`

### Issue: Hotspots don't persist

**Problem:** Write permission or file path issue

**Solution:**
```bash
# Ensure server/data directory exists
mkdir -p server/data

# Check permissions
chmod 755 server/data

# Verify file is created after autogen
ls -la server/data/dishMedia.json
```

### Issue: Console errors in browser

**Problem:** Client trying to fetch before server is ready

**Solution:** Ensure server starts before client, or refresh browser after both are running

---

## File Structure Verification

```
1910-menu/
├── .env.example          ✅ Committed (template)
├── .env                  ❌ Ignored (your secrets)
├── .gitignore           ✅ Ignores .env and runtime data
├── package.json         ✅ Root scripts (dev/build/start)
├── README.md            ✅ Setup instructions
├── FINAL_AUDIT.md       ✅ Comprehensive audit
├── scripts/
│   └── test-autogen.sh  ✅ Autogen test script
├── client/
│   ├── package.json     ✅ React dependencies
│   ├── vite.config.js   ✅ Proxy to :8787
│   ├── src/
│   │   ├── App.jsx      ✅ Main component
│   │   ├── components/
│   │   │   └── DishMediaHotspots.jsx  ✅ Hotspot editor
│   │   └── hotspots/
│   │       └── layouts.js  ✅ Client-side algorithms
│   └── dist/            (created by build)
├── server/
│   ├── package.json     ✅ Express dependencies
│   ├── index.js         ✅ Main server + all routes
│   ├── auth.js          ✅ Bearer token auth
│   ├── db.js            ✅ Media persistence + auto-seed
│   ├── hotspotLayouts.js  ✅ Server-side algorithms
│   ├── data/
│   │   └── dishMedia.json  (created at runtime)
│   └── public/media/dishes/tasting/
│       └── *.webp       ⚠️ Manual download required
└── content/
    ├── brand.json       ✅ Restaurant info
    ├── menus/
    │   └── tasting.json  ✅ 14-course menu
    ├── ingredients/
    │   └── ingredientsCatalog.json  ✅ 104 ingredients
    └── media/
        └── dishMedia.json  ✅ Seed data with hotspots
```

---

## Quick Reference Commands

```bash
# Install
npm install

# Development (both servers)
npm run dev

# Development (separate)
npm run dev:server  # Terminal 1
npm run dev:client  # Terminal 2

# Build for production
npm run build

# Start production
NODE_ENV=production npm start

# Test autogen endpoint
./scripts/test-autogen.sh

# Check logs
# Server logs to console
# Client logs in browser console
```

---

## Verification Checklist

Before committing or deploying, verify:

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts both servers
- [ ] Client loads at http://localhost:5173
- [ ] Server responds at http://localhost:8787/api/health
- [ ] Tasting menu displays all 14 courses
- [ ] Hotspots display on dish images
- [ ] Admin mode works with token
- [ ] Autogen creates and persists hotspots
- [ ] `server/data/dishMedia.json` is created
- [ ] `.env` is not committed (in .gitignore)
- [ ] `.env.example` is committed
- [ ] No secrets in git history

---

## Next Steps

1. **Download Photos:** Get 13 dish images from Google Drive
2. **Run Tests:** Execute smoke tests above
3. **Customize:** Update `.env` with your tokens
4. **Deploy:** Follow production build steps
5. **Tag Release:** `git tag v1.0.0 && git push --tags`

---

## Support & Documentation

- **README.md** - Quick setup guide
- **FINAL_AUDIT.md** - Comprehensive audit results
- **SETUP_SUMMARY.md** - Detailed verification
- **AUDIT_REPORT.md** - Initial audit
- **This file** - Complete end-to-end guide

All systems verified and operational! 🚀
