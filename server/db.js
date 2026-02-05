const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "dishMedia.json");
const SEED_FILE = path.join(__dirname, "..", "content", "media", "dishMedia.json");

function ensureData(){
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    if (fs.existsSync(SEED_FILE)) fs.copyFileSync(SEED_FILE, DATA_FILE);
    else fs.writeFileSync(DATA_FILE, JSON.stringify({ schemaVersion: 2, menus: {} }, null, 2), "utf-8");
  }
}

function read(){
  ensureData();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function write(obj){
  ensureData();
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), "utf-8");
}

/**
 * Backward compatibility:
 * Old shape: menus[menuName][dishId] = {imageUrl, alt, blurDataURL, hotspots}
 * New shape: menus[menuName].stages[stage][dishId] = { ... }
 */
function getMenuStage(obj, menuName, stage){
  obj.menus = obj.menus || {};
  const m = obj.menus[menuName] || {};

  // migrate old shape if found
  if (!m.stages) {
    const dishes = {};
    for (const [k,v] of Object.entries(m)) {
      if (typeof v === "object" && v && (v.imageUrl || v.hotspots || v.blurDataURL)) dishes[k] = v;
    }
    obj.menus[menuName] = { stages: { published: dishes } };
  }

  obj.menus[menuName].stages = obj.menus[menuName].stages || {};
  obj.menus[menuName].stages[stage] = obj.menus[menuName].stages[stage] || {};
  return obj.menus[menuName].stages[stage];
}

function getMedia(menuName, stage="published"){
  const obj = read();
  const stageObj = getMenuStage(obj, menuName, stage);
  write(obj);
  return stageObj;
}

function getMediaOne(menuName, stage, dishId){
  const m = getMedia(menuName, stage);
  return m[dishId] || null;
}

function upsertMedia({ menuName, stage="published", dishId, imageUrl, alt, blurDataURL, hotspots }){
  const obj = read();
  const stageObj = getMenuStage(obj, menuName, stage);
  stageObj[dishId] = {
    imageUrl,
    alt: alt || { en: "EDIT_ME dish photo", de: "EDIT_ME Gericht Foto" },
    blurDataURL: blurDataURL || "",
    hotspots: hotspots || []
  };
  write(obj);
  return stageObj[dishId];
}

module.exports = { getMedia, getMediaOne, upsertMedia };
