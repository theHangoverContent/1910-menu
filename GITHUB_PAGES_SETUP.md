# GitHub Pages Setup Guide

This guide will help you deploy the 1910 Menu React application to GitHub Pages.

## 🔗 Live Website URL

Once properly configured, your website will be available at:

**https://thehangovercontent.github.io/1910-menu/**

## 🚀 Quick Setup (One-Time Configuration)

### Step 1: Configure GitHub Pages Source

1. Go to your GitHub repository: https://github.com/theHangoverContent/1910-menu
2. Click **Settings** (in the top navigation bar)
3. In the left sidebar, under "Code and automation", click **Pages**
4. Under **Build and deployment**:
   - **Source**: Select **"GitHub Actions"** from the dropdown
   - ⚠️ **DO NOT** select "Deploy from a branch" - this will show the README instead of the app
5. Click **Save** if there's a save button

![GitHub Pages Settings](https://docs.github.com/assets/cb-61520/mw-1440/images/help/pages/publishing-source-dropdown.webp)

### Step 2: Trigger Initial Deployment

**Option A: Manual Trigger (Recommended for first deploy)**
1. Go to the **Actions** tab in your repository
2. Click on **"Deploy to GitHub Pages"** in the left sidebar
3. Click the **"Run workflow"** dropdown button (right side)
4. Select branch: `main`
5. Click **"Run workflow"** (green button)
6. Wait 1-2 minutes for the deployment to complete

**Option B: Push to main branch**
```bash
git push origin main
```

### Step 3: Verify Deployment

1. Go to the **Actions** tab
2. Look for the "Deploy to GitHub Pages" workflow run
3. Both jobs should show green checkmarks (✓ build, ✓ deploy)
4. Wait 2-3 minutes after successful deployment
5. Visit: https://thehangovercontent.github.io/1910-menu/

## ⚠️ Troubleshooting

### Problem: GitHub Pages shows README content instead of React app

**Cause:** GitHub Pages Source is set to "Deploy from a branch" instead of "GitHub Actions"

**Solution:**
1. Go to Settings → Pages
2. Change Source to **"GitHub Actions"**
3. Trigger a new deployment (see Step 2 above)

### Problem: 404 Not Found error

**Possible causes & solutions:**
1. **Deployment still in progress** - Wait 2-3 minutes, then refresh
2. **Workflow failed** - Check Actions tab for error messages
3. **Pages not enabled** - Verify GitHub Pages is enabled in Settings → Pages

### Problem: Assets/CSS/JS not loading (blank white page)

**Possible causes & solutions:**
1. **Browser cache** - Clear cache or try incognito/private browsing mode
2. **Base path issue** - The app should be built with `GITHUB_PAGES=true` environment variable (this is automatic in the workflow)

### Problem: Workflow fails during "Install dependencies"

**Solution:**
```bash
# Locally, run:
npm ci
# If there are issues, try:
rm -rf node_modules package-lock.json
npm install
# Commit and push the updated package-lock.json
```

## 📝 Technical Details

### How the Deployment Works

1. **Workflow Trigger**: The `deploy.yml` workflow runs on every push to `main` branch
2. **Build**: The client is built with `GITHUB_PAGES=true` to set the correct base path (`/1910-menu/`)
3. **Upload**: The built `client/dist` folder is uploaded as a GitHub Pages artifact
4. **Deploy**: GitHub deploys the artifact to GitHub Pages

### Configuration Files

- `.github/workflows/deploy.yml` - GitHub Actions workflow for deployment
- `client/vite.config.js` - Vite configuration with conditional base path for GitHub Pages

### Base Path Configuration

The `vite.config.js` includes:
```javascript
base: process.env.GITHUB_PAGES ? '/1910-menu/' : '/',
```

This ensures:
- Local development uses `/` (root path)
- GitHub Pages deployment uses `/1910-menu/` (repository name as subpath)

## 📌 Important Notes

- **Static Site Only**: GitHub Pages serves the React client as a static site. Backend features (API, hotspot editing) require running the server locally.
- **Automatic Deploys**: After initial setup, every push to `main` automatically triggers a new deployment.
- **Custom Domain**: If you want to use a custom domain, configure it in Settings → Pages → Custom domain.

## 🆘 Need Help?

If you're still experiencing issues:
1. Check the **Actions** tab for detailed error logs
2. Verify all steps in this guide were followed correctly
3. Try clearing browser cache and cookies
4. Wait 5-10 minutes and try again (GitHub Pages can have propagation delays)
