// client/src/hotspots/layouts.js
export const HOTSPOT_LAYOUTS = [
  { id: "auto", name: "Auto" },
  { id: "goldenTriangle", name: "Golden Triangle" },
  { id: "sauceSwipe", name: "Sauce Swipe" },
  { id: "centerPerimeter", name: "Center + Perimeter" },
  { id: "twoCluster", name: "Two Clusters" },
  { id: "rimOnly", name: "Rim Only" },
  { id: "bowlGradient", name: "Bowl Gradient" },
  { id: "chefBias", name: "Chef Bias" }
];

export function titleize(s){
  return String(s||"").replace(/[-_]+/g," ").trim().replace(/\b\w/g, (m)=>m.toUpperCase());
}

// kept for compatibility; actual generation happens in backend
export function generateHotspots({ dishId, ingredientIds, strategy="auto", seed=1910 }){
  return (ingredientIds || []).map((id,i)=>({
    x: 0.5 + (i%3-1)*0.08,
    y: 0.55 + (Math.floor(i/3))*0.07,
    ingredientId: id,
    role: "component",
    label: { en: titleize(id), de: titleize(id) }
  }));
}
