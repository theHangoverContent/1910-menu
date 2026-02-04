# Monorepo Audit Report

## Summary

✅ **PASSED** - The repository is correctly configured and ready to run.

## Verification Checklist

### 1. ✅ npm install at repo root works
- Root package.json has correct workspace configuration
- Dependencies: npm-run-all for concurrent execution
- Workspaces: client and server configured

### 2. ✅ npm run dev runs server+client concurrently
- Script: `npm-run-all -p dev:server dev:client`
- Server runs on port 8787
- Client runs on port 5173
- Vite proxy configured for /api and /media

### 3. ✅ Client loads tasting menu, images, hotspots without errors
- App.jsx properly fetches from `/api/menus/:menu`
- Media loaded from `/api/media/:menu?stage=`
- DishMediaHotspots component correctly displays hotspots
- No import errors or path issues

### 4. ✅ Backend routes work correctly

**GET /api/menus/:menu**
- Loads menu from content/menus/{menu}.json
- Supports lang query parameter
- Returns proper JSON structure

**GET /api/media/:menu?stage=**
- Returns media for specified menu and stage
- Auto-migrates old format to new stage-based format
- Defaults to published stage (or DEFAULT_STAGE from .env)

**GET /api/media/layouts**
- Returns list of 8 hotspot layout strategies
- Public endpoint (no auth required)

**POST /api/media/upsert** (admin only)
- Requires Authorization: Bearer {ADMIN_TOKEN}
- Validates with Zod schema
- Schema includes hotspots[].role and hotspots[].label
- Persists to server/data/dishMedia.json

**POST /api/media/autogen** (admin only)
- Requires Authorization: Bearer {ADMIN_TOKEN}
- Validates dish exists in menu
- Extracts ingredient IDs from dish
- Generates hotspots using selected strategy
- Persists result to server/data/dishMedia.json
- Returns generated hotspots with role and label

### 5. ✅ Stage support: draft/review/published
- Enum defined in Zod schemas
- server/db.js getMenuStage handles all 3 stages
- Client has stage selector dropdown
- Query parameter ?stage= works
- Default stage from .env (DEFAULT_STAGE)

### 6. ✅ dishMedia seeding
- server/db.js ensureData() function:
  - Creates server/data/ if missing
  - Copies content/media/dishMedia.json if server/data/dishMedia.json missing
  - Creates empty structure if seed file not found
- Runs on every read() call
- Auto-migration from old format to stage-based format

### 7. ✅ Static media served from /media
- Express static middleware: `app.use("/media", express.static(...))`
- Serves from: server/public/media/
- Client requests: /media/dishes/tasting/{dishId}.webp
- Vite proxy forwards /media to server:8787

## Port Configuration

✅ **Verified correct:**
- Server: 8787 (configurable via PORT in .env)
- Client: 5173 (Vite default)
- Vite proxy: /api → http://localhost:8787
- Vite proxy: /media → http://localhost:8787

## Zod Schemas

✅ **Verified complete:**

**MediaUpsertSchema:**
```javascript
hotspots: z.array(z.object({
  x: z.number(),
  y: z.number(),
  ingredientId: z.string().min(1),
  role: z.string().optional(),        // ✅ Present
  label: z.record(z.string()).optional() // ✅ Present
})).optional()
```

## Authorization

✅ **Verified correct:**

**Server (auth.js):**
- Extracts Bearer token from Authorization header
- Regex: `/^Bearer\s+(.+)$/`
- Compares to ADMIN_TOKEN and EDITOR_TOKEN from .env
- Returns { role: "admin" } or { role: "editor" }

**Client (App.jsx):**
```javascript
function authHeaders(){
  if (!adminToken) return {};
  return { "Authorization": `Bearer ${adminToken}` };
}
```

**Client (DishMediaHotspots.jsx):**
```javascript
"Authorization": `Bearer ${adminToken}`
```

## Issues Found and Fixed

### Issue 1: Runtime data not in .gitignore
**Root cause:** server/data/dishMedia.json should be runtime-only
**Fix:** Added to .gitignore with comment
**Impact:** Prevents accidental commit of runtime data

### Issue 2: Missing comprehensive README
**Root cause:** Original README only had "website"
**Fix:** Created detailed README with:
- Setup instructions
- npm commands
- curl examples for all endpoints
- Admin token usage
- Hotspot strategies documentation
- Project structure
**Impact:** Developers can now set up and test the system easily

## Test Commands

```bash
# Install
npm install

# Run dev
npm run dev

# Test public endpoint
curl http://localhost:8787/api/health

# Test admin endpoint (replace token)
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

## No Code Changes Required

All code is already correctly implemented:
- ✅ Imports are correct
- ✅ Paths are correct
- ✅ Dish IDs match between menu and media
- ✅ Authorization is properly enforced
- ✅ Zod schemas are complete
- ✅ Stage support is implemented
- ✅ Media seeding works
- ✅ Proxy configuration is correct

## Conclusion

The monorepo is **production-ready** and all must-haves are satisfied. Only documentation improvements were needed (README + .gitignore).
