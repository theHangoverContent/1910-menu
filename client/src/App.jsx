import React, { useEffect, useMemo, useState } from "react";
import DishMediaHotspots from "./components/DishMediaHotspots.jsx";

const STAGES = ["draft","review","published"];

function useQuery(){
  return useMemo(()=>new URLSearchParams(window.location.search), []);
}
function titleize(s){ return String(s||"").replace(/[-_]+/g," ").replace(/\b\w/g,m=>m.toUpperCase()); }

export default function App(){
  const q = useQuery();
  const [lang, setLang] = useState(q.get("lang") || "en");
  const [menuName, setMenuName] = useState(q.get("menu") || "tasting");
  const [stage, setStage] = useState(q.get("stage") || "published");

  const adminMode = q.get("admin") === "1";
  const [adminToken, setAdminToken] = useState(localStorage.getItem("ADMIN_TOKEN") || "");

  const [menu, setMenu] = useState(null);
  const [media, setMedia] = useState(null);
  const [activeIngredient, setActiveIngredient] = useState(null);
  const [catalog, setCatalog] = useState(null);

  useEffect(()=>{
    fetch(`/api/menus/${menuName}?lang=${lang}`).then(r=>r.json()).then(setMenu);
  },[menuName, lang]);

  useEffect(()=>{
    fetch(`/api/media/${menuName}?stage=${stage}`).then(r=>r.json()).then(setMedia);
  },[menuName, stage]);

  useEffect(()=>{
    fetch(`/api/ingredients/catalog`).then(r=>r.json()).then(setCatalog);
  },[]);

  const brandBadges = [
    "Michelin 2026",
    "Gault & Millau 2026 — 3 hats / 16 points",
    "Falstaff 2026 — 3 forks",
    "Flow Food Cook's Alliance 2025"
  ];

  function authHeaders(){
    if (!adminToken) return {};
    return { "Authorization": `Bearer ${adminToken}` };
  }

  async function saveDishMedia(draft, dishId){
    const payload = {
      menu: menuName,
      stage,
      dishId,
      imageUrl: draft.imageUrl,
      alt: draft.alt,
      blurDataURL: draft.blurDataURL,
      hotspots: draft.hotspots
    };

    const res = await fetch(`/api/media/upsert`, {
      method:"POST",
      headers:{ "Content-Type":"application/json", ...authHeaders() },
      body: JSON.stringify(payload)
    });
    const out = await res.json();
    if (!out.ok) {
      alert(out.error || "Save failed");
      return;
    }
    const m = await fetch(`/api/media/${menuName}?stage=${stage}`).then(r=>r.json());
    setMedia(m);
  }

  const ingredientInfo = useMemo(()=>{
    if (!activeIngredient || !catalog) return null;
    const items = catalog?.items || {};
    return items[activeIngredient] || { id: activeIngredient, title: { en: titleize(activeIngredient), de: titleize(activeIngredient) }, description: { en: "EDIT_ME ingredient info.", de: "EDIT_ME Zutat Info." } };
  },[activeIngredient, catalog]);

  if (!menu?.ok) {
    return (
      <div className="container">
        <div className="panel course">
          <div className="muted">Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div className="brand">
          <h1>1910</h1>
          <div className="sub">{lang==="de" ? "Gourmet-Menü" : "Gourmet Menu"} — {lang==="de" ? "warme, gedimmte Atmosphäre" : "warm low-light atmosphere"}</div>
        </div>
        <div className="badges">
          {brandBadges.map((b,i)=><span key={i} className="badge">{b}</span>)}
        </div>
      </div>

      <div className="nav">
        <button className="btn ghost" onClick={()=>setMenuName("tasting")}>Tasting</button>
        <button className="btn ghost" onClick={()=>setMenuName("alacarte")}>À la carte</button>
        <button className="btn ghost" onClick={()=>setMenuName("daily")}>Daily</button>
        <button className="btn ghost" onClick={()=>setMenuName("winelist")}>Wine List</button>
        <button className="btn ghost" onClick={()=>setMenuName("bardrinks")}>Bar Drinks</button>

        <button className="btn ghost" onClick={()=>setLang(lang==="en"?"de":"en")}>{lang==="en"?"DE":"EN"}</button>

        <select className="btn ghost" value={stage} onChange={(e)=>setStage(e.target.value)}>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {adminMode && (
          <div className="row" style={{ marginLeft:"auto" }}>
            <div className="field">
              <label className="small">Admin token</label>
              <input
                value={adminToken}
                onChange={(e)=>{ setAdminToken(e.target.value); localStorage.setItem("ADMIN_TOKEN", e.target.value); }}
                placeholder="Bearer token"
              />
            </div>
          </div>
        )}
      </div>

      {(menu.menu.courses || []).map((course) => (
        <div key={course.id} className="panel course">
          <h2>{course.title?.[lang] || course.title?.en}</h2>

          {(course.items || []).map((item) => {
            const dishId = item.id;
            const dishMedia = media?.media?.[dishId] || {
              imageUrl: `/media/dishes/tasting/${dishId}.webp`,
              alt: { en: item.title?.en || dishId, de: item.title?.de || dishId },
              blurDataURL: "",
              hotspots: []
            };

            return (
              <div key={dishId} className="item">
                <div className="itemTitle">
                  <div>
                    <h3>{item.title?.[lang] || item.title?.en}</h3>
                    <div className="small muted">{item.description?.[lang] || item.description?.en}</div>
                    {item.allergens?.length ? (
                      <div className="small" style={{ marginTop:6 }}>
                        {lang==="de" ? "Allergene:" : "Allergens:"} {item.allergens.join(", ")}
                      </div>
                    ) : null}
                  </div>
                </div>

                <DishMediaHotspots
                  dishId={dishId}
                  media={dishMedia}
                  lang={lang}
                  menu={menuName}
                  stage={stage}
                  ingredientIds={(item.ingredients || []).map(x=>x.id)}
                  isAdmin={adminMode}
                  adminToken={adminToken}
                  onHotspotClick={(id)=>setActiveIngredient(id)}
                  onSaveMedia={(draft)=>saveDishMedia(draft, dishId)}
                />

                {(item.ingredients || []).length ? (
                  <div className="ingredients">
                    {(item.ingredients || []).map((ing)=>(
                      <button key={ing.id} className="pill" onClick={()=>setActiveIngredient(ing.id)}>
                        {ing.label?.[lang] || ing.label?.en}
                      </button>
                    ))}
                  </div>
                ) : null}

                {item.pairings ? (
                  <div style={{ marginTop: 12 }} className="panel">
                    <div style={{ padding: 12 }}>
                      <div className="small" style={{ opacity:.9, marginBottom: 6 }}>Pairings</div>
                      <div className="small">
                        <b>{lang==="de" ? "Wein" : "Wine"}:</b> {item.pairings.wine.name} {item.pairings.wine.vintage} — {item.pairings.wine.producer}
                      </div>
                      <div className="small muted">{item.pairings.wine.note_en}</div>
                      <div className="small" style={{ marginTop: 6 }}>
                        <b>{lang==="de" ? "Bier" : "Beer"}:</b> {item.pairings.beer.name}
                      </div>
                      <div className="small">
                        <b>{lang==="de" ? "Saft" : "Juice"}:</b> {item.pairings.juice.name}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}

      {activeIngredient && (
        <>
          <div className="drawerBackdrop" onClick={()=>setActiveIngredient(null)} />
          <div className="panel drawer">
            <div className="drawerHeader">
              <div>
                <div style={{ fontSize: 14, letterSpacing:".08em", textTransform:"uppercase" }}>
                  {ingredientInfo?.title?.[lang] || ingredientInfo?.title?.en || titleize(activeIngredient)}
                </div>
                <div className="small muted">{activeIngredient}</div>
              </div>
              <button className="btn ghost" onClick={()=>setActiveIngredient(null)}>Close</button>
            </div>
            <div className="drawerBody">
              <div className="muted">
                {ingredientInfo?.description?.[lang] || ingredientInfo?.description?.en || "EDIT_ME ingredient info."}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
