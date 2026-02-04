/**
 * Server-side hotspot auto-layouts.
 * Output: [{x,y,ingredientId,role,label:{en,de}}]
 */

function mulberry32(seed) {
  let a = (seed >>> 0) || 1;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function clamp01(n) { return Math.max(0, Math.min(1, n)); }
function jitter(rng, s) { return (rng() - 0.5) * s; }

function titleize(id){
  return String(id||"").replace(/[-_]+/g," ").trim().replace(/\b\w/g, (m)=>m.toUpperCase());
}

function inferRole(ingredientId) {
  const s = String(ingredientId || "").toLowerCase();
  const hero = ["duck","zander","char","saibling","fish","caviar","beef","veal","lamb","pork"];
  const sauce = ["jus","sauce","foam","oil","gel","creme","cream","mayo","mayonnaise","dashi","garum","verjus","kvass","cremeux"];
  const garnish = ["herb","chives","lovage","shiso","lime","zest","finger","caper","parsley","wild-garlic","flower"];
  const crunch = ["crumble","cracker","powder","croquette","tartlet","seed","meringue"];
  const accent = ["pickle","pickled","ferment","radish","gooseberry","rhubarb","lingonberry","elderberry","verjus","caviar"];

  if (hero.some(k => s.includes(k))) return "hero";
  if (sauce.some(k => s.includes(k))) return "sauce";
  if (crunch.some(k => s.includes(k))) return "crunch";
  if (garnish.some(k => s.includes(k))) return "garnish";
  if (accent.some(k => s.includes(k))) return "accent";
  return "component";
}

function pickStrategyAuto({ dishId, ingredientIds }) {
  const s = String(dishId || "").toLowerCase();
  const n = ingredientIds.length;
  if (s.includes("dessert") || s.includes("friand")) return "chefBias";
  if (s.includes("bread")) return "centerPerimeter";
  if (s.includes("surprise") || s.includes("agnolotti") || s.includes("pasta")) return "twoCluster";
  if (s.includes("between") || s.includes("leek") || s.includes("terrine")) return "bowlGradient";
  if (n >= 10) return "centerPerimeter";
  if (n <= 4) return "goldenTriangle";
  return "chefBias";
}

function relax(points, opts = {}) {
  const iterations = opts.iterations ?? 70;
  const minDist = opts.minDist ?? 0.06;
  const bounds = opts.bounds ?? { left: 0.08, right: 0.92, top: 0.10, bottom: 0.92 };
  const k = 0.016;

  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < points.length; i++) {
      let dx = 0, dy = 0;
      for (let j = 0; j < points.length; j++) {
        if (i === j) continue;
        const ax = points[i].x - points[j].x;
        const ay = points[i].y - points[j].y;
        const d2 = ax*ax + ay*ay;
        if (d2 === 0) continue;
        const d = Math.sqrt(d2);
        if (d < minDist) {
          const push = (minDist - d) / minDist;
          dx += (ax / d) * push;
          dy += (ay / d) * push;
        }
      }
      points[i].x = clamp01(points[i].x + dx * k);
      points[i].y = clamp01(points[i].y + dy * k);
      points[i].x = Math.max(bounds.left, Math.min(bounds.right, points[i].x));
      points[i].y = Math.max(bounds.top, Math.min(bounds.bottom, points[i].y));
    }
  }
  return points;
}

function layoutGoldenTriangle({ ingredientIds, rng }) {
  const anchors = {
    hero: { x: 0.52, y: 0.58 },
    sauce: { x: 0.67, y: 0.72 },
    garnish: { x: 0.38, y: 0.42 },
    crunch: { x: 0.60, y: 0.48 },
    accent: { x: 0.44, y: 0.70 },
    component: { x: 0.52, y: 0.58 }
  };
  const pts = ingredientIds.map((id, idx) => {
    const role = inferRole(id);
    const a = anchors[role] || anchors.component;
    return {
      ingredientId:id, role,
      x: clamp01(a.x + jitter(rng, 0.09) + (idx===0 ? 0 : jitter(rng, 0.03))),
      y: clamp01(a.y + jitter(rng, 0.07) + (idx===0 ? 0 : jitter(rng, 0.03)))
    };
  });
  return relax(pts, { minDist: 0.065 });
}

function layoutSauceSwipe({ ingredientIds, rng }) {
  const n = ingredientIds.length || 1;
  const pts = [];
  const p0 = { x: 0.22, y: 0.72 }, p1 = { x: 0.52, y: 0.62 }, p2 = { x: 0.80, y: 0.70 };
  function bez(t) {
    const a = (1-t)*(1-t);
    const b = 2*(1-t)*t;
    const c = t*t;
    return { x: a*p0.x + b*p1.x + c*p2.x, y: a*p0.y + b*p1.y + c*p2.y };
  }
  for (let i = 0; i < n; i++) {
    const id = ingredientIds[i];
    const role = inferRole(id);
    let t = n === 1 ? 0.5 : i/(n-1);
    let p = bez(t);
    if (role === "garnish") p = { x: p.x + jitter(rng,0.06), y: p.y - 0.18 + jitter(rng,0.05) };
    if (role === "hero") p = { x: 0.52 + jitter(rng,0.05), y: 0.58 + jitter(rng,0.05) };
    if (role === "crunch") p = { x: p.x + jitter(rng,0.04), y: p.y - 0.10 + jitter(rng,0.04) };
    pts.push({ ingredientId:id, role, x: clamp01(p.x + jitter(rng,0.03)), y: clamp01(p.y + jitter(rng,0.03)) });
  }
  return relax(pts, { minDist: 0.06 });
}

function layoutCenterPerimeter({ ingredientIds, rng }) {
  const core = [], rim = [];
  for (const id of ingredientIds) {
    const role = inferRole(id);
    if (role === "garnish" || role === "accent") rim.push({ id, role });
    else core.push({ id, role });
  }
  const pts = [];
  for (let i = 0; i < core.length; i++) {
    const a = (i / Math.max(1, core.length)) * Math.PI*2;
    const r = 0.12 + rng()*0.10;
    pts.push({ ingredientId: core[i].id, role: core[i].role, x: clamp01(0.52 + Math.cos(a)*r + jitter(rng,0.05)), y: clamp01(0.58 + Math.sin(a)*r*0.75 + jitter(rng,0.05)) });
  }
  for (let i = 0; i < rim.length; i++) {
    const t = rim.length === 1 ? 0.5 : i/(rim.length-1);
    const ang = (Math.PI*0.15) + t*(Math.PI*0.70);
    const rr = 0.34 + rng()*0.03;
    pts.push({ ingredientId: rim[i].id, role: rim[i].role, x: clamp01(0.5 + Math.cos(ang)*rr + jitter(rng,0.03)), y: clamp01(0.55 + Math.sin(ang)*rr + jitter(rng,0.03)) });
  }
  return relax(pts, { minDist: 0.06 });
}

function layoutTwoCluster({ ingredientIds, rng }) {
  const left = { x: 0.38, y: 0.58 };
  const right = { x: 0.66, y: 0.58 };
  const pts = ingredientIds.map((id, i) => {
    const role = inferRole(id);
    const a = (i % 2 === 0) ? left : right;
    const up = (role === "garnish") ? -0.14 : 0;
    const dn = (role === "sauce") ? 0.10 : 0;
    return { ingredientId:id, role, x: clamp01(a.x + jitter(rng,0.10)), y: clamp01(a.y + up + dn + jitter(rng,0.08)) };
  });
  return relax(pts, { minDist: 0.065 });
}

function layoutRimOnly({ ingredientIds, rng }) {
  const n = ingredientIds.length || 1;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const id = ingredientIds[i];
    const role = inferRole(id);
    const t = n === 1 ? 0.5 : i/(n-1);
    const ang = (Math.PI*0.10) + t*(Math.PI*1.60);
    const rr = 0.40 + rng()*0.03;
    pts.push({ ingredientId:id, role, x: clamp01(0.50 + Math.cos(ang)*rr + jitter(rng,0.02)), y: clamp01(0.56 + Math.sin(ang)*rr + jitter(rng,0.02)) });
  }
  return relax(pts, { minDist: 0.06, bounds: { left: 0.06, right: 0.94, top: 0.06, bottom: 0.94 } });
}

function layoutBowlGradient({ ingredientIds, rng }) {
  const n = ingredientIds.length || 1;
  const pts = ingredientIds.map((id, i) => {
    const role = inferRole(id);
    let y = 0.55;
    if (role === "garnish") y = 0.38;
    else if (role === "crunch") y = 0.72;
    else if (role === "sauce") y = 0.62;
    y += jitter(rng,0.05);
    const x = 0.5 + ((i - (n-1)/2) / Math.max(1, n)) * 0.42 + jitter(rng,0.06);
    return { ingredientId:id, role, x: clamp01(x), y: clamp01(y) };
  });
  return relax(pts, { minDist: 0.06 });
}

function layoutChefBias({ ingredientIds, rng }) {
  const pts = ingredientIds.map((id) => {
    const role = inferRole(id);
    let x = 0.54, y = 0.60;
    if (role === "hero") { x = 0.54; y = 0.62; }
    if (role === "sauce") { x = 0.66; y = 0.72; }
    if (role === "garnish") { x = 0.40; y = 0.42; }
    if (role === "accent") { x = 0.46; y = 0.70; }
    if (role === "crunch") { x = 0.60; y = 0.50; }
    return { ingredientId:id, role, x: clamp01(x + jitter(rng,0.10)), y: clamp01(y + jitter(rng,0.08)) };
  });
  return relax(pts, { minDist: 0.065 });
}

const STRATEGIES = [
  { id: "auto", name: "Auto", note: "Chooses a plate-realistic layout based on dish + ingredient count." },
  { id: "goldenTriangle", name: "Golden Triangle", note: "Hero + sauce + garnish composition." },
  { id: "sauceSwipe", name: "Sauce Swipe", note: "Points along a curved sauce line + accents." },
  { id: "centerPerimeter", name: "Center + Perimeter", note: "Core cluster with rim accents." },
  { id: "twoCluster", name: "Two Clusters", note: "Left/right dual composition." },
  { id: "rimOnly", name: "Rim Only", note: "Minimalist: points on the rim." },
  { id: "bowlGradient", name: "Bowl Gradient", note: "Vertical layering for bowls/terrines." },
  { id: "chefBias", name: "Chef Bias", note: "Off-center mass + upper accents." }
];

function generateHotspots({ dishId, ingredientIds, strategy = "auto", seed = 1910 }) {
  const ids = (ingredientIds || []).filter(Boolean);
  const chosen = (strategy === "auto") ? pickStrategyAuto({ dishId, ingredientIds: ids }) : strategy;
  const rng = mulberry32(typeof seed === "number" ? seed : 1910);

  let pts;
  if (chosen === "goldenTriangle") pts = layoutGoldenTriangle({ ingredientIds: ids, rng });
  else if (chosen === "sauceSwipe") pts = layoutSauceSwipe({ ingredientIds: ids, rng });
  else if (chosen === "centerPerimeter") pts = layoutCenterPerimeter({ ingredientIds: ids, rng });
  else if (chosen === "twoCluster") pts = layoutTwoCluster({ ingredientIds: ids, rng });
  else if (chosen === "rimOnly") pts = layoutRimOnly({ ingredientIds: ids, rng });
  else if (chosen === "bowlGradient") pts = layoutBowlGradient({ ingredientIds: ids, rng });
  else if (chosen === "chefBias") pts = layoutChefBias({ ingredientIds: ids, rng });
  else pts = layoutChefBias({ ingredientIds: ids, rng });

  return pts.map(p => ({
    x: Number(p.x.toFixed(4)),
    y: Number(p.y.toFixed(4)),
    ingredientId: p.ingredientId,
    role: p.role,
    label: { en: titleize(p.ingredientId), de: titleize(p.ingredientId) }
  }));
}

module.exports = { STRATEGIES, generateHotspots };
