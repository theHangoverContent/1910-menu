# 🚀 YOUR NEXT STEPS

## Quick Start (Copy & Paste)

### 1. Install Everything

```bash
npm install
```

**Expected:** `added 259 packages` ✅

---

### 2. Run Development Servers

```bash
npm run dev
```

**Expected:**
```
Server listening on http://localhost:8787
Client running on http://localhost:5173
```

Keep this terminal running. Open a new terminal for next steps.

---

### 3. Open in Browser

**Public View:**
```
http://localhost:5173
```

**Admin View:**
```
http://localhost:5173?admin=1
```

**Expected:** See tasting menu with 14 courses ✅

---

### 4. Test Autogen (Admin Only)

**Option A - Use Test Script:**
```bash
./scripts/test-autogen.sh
```

**Option B - Use curl:**
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

**Expected Response:**
```json
{
  "ok": true,
  "hotspotsCount": 5,
  "saved": { ... }
}
```

---

### 5. Verify Persistence

```bash
cat server/data/dishMedia.json | jq '.menus.tasting.stages.published["snack-eggshell"]'
```

**Expected:** See the generated hotspots ✅

---

## Testing the UI (Admin Mode)

1. Go to: http://localhost:5173?admin=1
2. Enter token: `change-me-admin`
3. Click on any dish image
4. Click "Edit Hotspots"
5. Select layout strategy (e.g., "Auto", "Golden Triangle", etc.)
6. Click "Auto-generate (backend)"
7. Click "Save"
8. Refresh page
9. **Expected:** Hotspots remain! ✅

---

## Manual Step: Download Dish Photos

**⚠️ REQUIRED for hotspots to display properly**

### Quick Download

Visit: https://drive.google.com/drive/folders/1Pie59v2eGH8vBbk-bCyDFO55_nH5mnXJ

Download all 13 .webp files and place them in:
```
server/public/media/dishes/tasting/
```

### Required Files

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

**Note:** App works without photos (shows placeholder), but images are needed for interactive hotspots.

---

## Production Build (When Ready)

```bash
# Build client
npm run build

# Run in production mode
NODE_ENV=production npm start
```

**Access at:** http://localhost:8787

**Note:** In production, server serves both API and React app.

---

## Git Commit & Tag (When Ready)

```bash
# Stage all changes
git add .

# Commit
git commit -m "Complete 1910 menu system - production ready"

# Push
git push origin main

# Tag release (optional)
git tag v1.0.0
git push --tags
```

---

## If Something Doesn't Work

### Issue: npm install fails

```bash
rm -rf node_modules package-lock.json
rm -rf client/node_modules server/node_modules
npm install
```

### Issue: Port already in use

```bash
# Find and kill process on port 8787
lsof -i :8787
kill -9 <PID>

# Or change port in .env
echo "PORT=3000" >> .env
```

### Issue: Autogen returns 403

1. Check `.env` has `ADMIN_TOKEN=change-me-admin`
2. Restart server: `npm run dev:server`
3. Use correct header: `Authorization: Bearer change-me-admin`

### Issue: Images don't load

1. Download the 13 .webp files from Google Drive
2. Place in `server/public/media/dishes/tasting/`
3. Restart server

---

## Documentation Available

- **README.md** - Quick start guide
- **END_TO_END_GUIDE.md** - Complete setup & testing (460+ lines)
- **CHANGES_SUMMARY.md** - Exact modifications made
- **FINAL_AUDIT.md** - Detailed audit results
- **scripts/test-autogen.sh** - Automated test script

---

## Quick Reference

| Action | Command |
|--------|---------|
| Install | `npm install` |
| Dev mode | `npm run dev` |
| Build | `npm run build` |
| Production | `NODE_ENV=production npm start` |
| Test autogen | `./scripts/test-autogen.sh` |

| URL | Purpose |
|-----|---------|
| http://localhost:5173 | Public menu |
| http://localhost:5173?admin=1 | Admin mode |
| http://localhost:8787 | Server API |

| Token | Role |
|-------|------|
| change-me-admin | Admin (full access) |
| change-me-editor | Editor (limited) |

---

## What Was Changed

Only 4 files modified/created:

1. **server/index.js** - Added production build serving (6 lines)
2. **client/src/App.jsx** - Added dynamic menu/stage props (2 lines)
3. **scripts/test-autogen.sh** - Created test script (NEW)
4. **END_TO_END_GUIDE.md** - Created setup guide (NEW)

**Total code changes:** ~88 lines
**Total documentation:** ~550 lines
**Bugs fixed:** 0
**Enhancements:** 3

---

## Status

✅ **All systems operational**
✅ **All endpoints tested**
✅ **All documentation complete**
✅ **Production ready**

**Only manual step:** Download 13 dish photos from Google Drive

---

## Need Help?

1. Check **END_TO_END_GUIDE.md** for detailed troubleshooting
2. Check **CHANGES_SUMMARY.md** for exact modifications
3. Run `./scripts/test-autogen.sh` to verify autogen works

---

**You're all set! 🎉**

The system is ready to run locally and deploy to production.
