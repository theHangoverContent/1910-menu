const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { z } = require("zod");
const rateLimit = require("express-rate-limit");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const db = require("./db");
const { getUserFromReq } = require("./auth");
const { STRATEGIES, generateHotspots } = require("./hotspotLayouts");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Rate limiting middleware
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many requests, please try again later." }
});

const apiWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 write requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many API write requests, please try again later." }
});

const staticFileLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 static file requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later."
});

// Apply general rate limiting to all routes
app.use(generalLimiter);

app.use((req, _res, next) => {
  req.user = getUserFromReq(req);
  next();
});

app.use("/media", express.static(path.join(__dirname, "public", "media")));

function loadJson(rel){
  const p = path.join(__dirname, "..", "content", rel);
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}
function loadMenuBase(menuName){
  return loadJson(`menus/${menuName}.json`);
}
function findDish(menuObj, dishId){
  for (const c of (menuObj.courses || [])){
    for (const it of (c.items || [])){
      if (it.id === dishId) return it;
    }
  }
  return null;
}

app.get("/api/health", (_req,res)=>res.json({ ok:true }));

app.get("/api/brand", (_req,res)=>{
  try { res.json({ ok:true, brand: loadJson("brand.json") }); }
  catch { res.status(404).json({ ok:false, error:"brand.json not found" }); }
});

app.get("/api/menus/:menu", (req,res)=>{
  const menuName = req.params.menu;
  const lang = (req.query.lang || "en").toLowerCase();
  try{
    const menu = loadMenuBase(menuName);
    res.json({ ok:true, menu, lang });
  }catch{
    res.status(404).json({ ok:false, error:`Menu not found: ${menuName}` });
  }
});

app.get("/api/ingredients/catalog", (_req,res)=>{
  try{
    res.json(loadJson("ingredients/ingredientsCatalog.json"));
  }catch{
    res.json({});
  }
});

app.get("/api/media/:menu", (req,res)=>{
  const menuName = req.params.menu;
  const stage = (req.query.stage || process.env.DEFAULT_STAGE || "published").toLowerCase();
  const media = db.getMedia(menuName, stage);
  res.json({ ok:true, menu: menuName, stage, media });
});

const MediaUpsertSchema = z.object({
  menu: z.string().min(1),
  stage: z.enum(["draft","review","published"]).default("published"),
  dishId: z.string().min(1),
  imageUrl: z.string().min(1),
  alt: z.record(z.string()).optional(),
  blurDataURL: z.string().optional(),
  hotspots: z.array(z.object({
    x: z.number(),
    y: z.number(),
    ingredientId: z.string().min(1),
    role: z.string().optional(),
    label: z.record(z.string()).optional()
  })).optional()
});

app.post("/api/media/upsert", apiWriteLimiter, (req,res)=>{
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ ok:false, error:"Admin only" });
  const p = MediaUpsertSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ ok:false, error:"Invalid payload", details: p.error.flatten() });

  const { menu, stage, dishId, imageUrl, alt, blurDataURL, hotspots } = p.data;
  const saved = db.upsertMedia({ menuName: menu, stage, dishId, imageUrl, alt, blurDataURL, hotspots });
  res.json({ ok:true, saved });
});

app.get("/api/media/layouts", (_req,res)=>{
  res.json({ ok:true, layouts: STRATEGIES });
});

const AutoGenSchema = z.object({
  menu: z.string().min(1),
  stage: z.enum(["draft","review","published"]).default("published"),
  dishId: z.string().min(1),
  strategy: z.string().optional(),
  seed: z.number().int().optional()
});

app.post("/api/media/autogen", apiWriteLimiter, (req,res)=>{
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ ok:false, error:"Admin only" });
  const p = AutoGenSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ ok:false, error:"Invalid payload", details: p.error.flatten() });

  const { menu, stage, dishId, strategy, seed } = p.data;

  let menuBase;
  try { menuBase = loadMenuBase(menu); }
  catch { return res.status(404).json({ ok:false, error:`Menu not found: ${menu}` }); }

  const dish = findDish(menuBase, dishId);
  if (!dish) return res.status(404).json({ ok:false, error:"Dish not found" });

  const ingredientIds = (dish.ingredients || []).map(x=>x.id).filter(Boolean);
  if (!ingredientIds.length) return res.status(400).json({ ok:false, error:"Dish has no ingredientIds to generate hotspots from." });

  const hotspots = generateHotspots({
    dishId,
    ingredientIds,
    strategy: strategy || "auto",
    seed: seed ?? 1910
  });

  const current = db.getMediaOne(menu, stage, dishId) || {};
  const imageUrl = current.imageUrl || `/media/dishes/tasting/${dishId}.webp`;
  const alt = current.alt || { en: dish.title?.en || dishId, de: dish.title?.de || dishId };
  const blurDataURL = current.blurDataURL || "";

  const saved = db.upsertMedia({ menuName: menu, stage, dishId, imageUrl, alt, blurDataURL, hotspots });
  res.json({ ok:true, menu, stage, dishId, strategy: strategy || "auto", seed: seed ?? 1910, hotspotsCount: hotspots.length, saved });
});

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "client", "dist")));
  app.get("*", staticFileLimiter, (req, res) => {
    res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"));
  });
}

const port = parseInt(process.env.PORT || "8787", 10);
app.listen(port, ()=>console.log(`Server listening on http://localhost:${port}`));
