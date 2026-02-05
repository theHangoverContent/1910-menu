import React, { useEffect, useMemo, useRef, useState } from "react";
import { HOTSPOT_LAYOUTS, titleize } from "../hotspots/layouts.js";

function clamp01(n){ return Math.max(0, Math.min(1, n)); }

export default function DishMediaHotspots({
  dishId,
  media,
  lang,
  ingredientIds = [],
  onHotspotClick,
  isAdmin,
  onSaveMedia,
  adminToken,
  menu = "tasting",
  stage = "published"
}) {
  const wrapRef = useRef(null);
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState(media || null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(null);
  const [drag, setDrag] = useState(null);
  const [strategy, setStrategy] = useState("auto");
  const [seed, setSeed] = useState(1910);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    setDraft(media || null);
    setLoaded(false);
  }, [media]);

  const hasImage = !!(media?.imageUrl);
  const hotspots = (draft?.hotspots || media?.hotspots || []);
  const blur = media?.blurDataURL || "";

  const alt = useMemo(() => {
    const a = media?.alt || {};
    return a[lang] || a.en || "Dish image";
  }, [media, lang]);

  function getRelXY(e){
    const el = wrapRef.current;
    if (!el) return { x: 0.5, y: 0.5 };
    const r = el.getBoundingClientRect();
    return {
      x: clamp01((e.clientX - r.left) / r.width),
      y: clamp01((e.clientY - r.top) / r.height)
    };
  }

  function onImgClick(e){
    if (!isAdmin || !edit) return;
    const { x, y } = getRelXY(e);
    const next = [
      ...hotspots,
      {
        x,
        y,
        ingredientId: ingredientIds?.[0] || "EDIT_ME_INGREDIENT_ID",
        role: "component",
        label: {
          en: ingredientIds?.[0] ? titleize(ingredientIds[0]) : "EDIT_ME",
          de: ingredientIds?.[0] ? titleize(ingredientIds[0]) : "EDIT_ME"
        }
      }
    ];
    setDraft({ ...(draft || media || {}), hotspots: next });
  }

  function removeAt(idx){
    setDraft({ ...(draft || media), hotspots: hotspots.filter((_,i)=>i!==idx) });
  }

  async function save(){
    if (!draft) return;
    setSaving(true);
    try{
      await onSaveMedia(draft);
      setEdit(false);
    } finally {
      setSaving(false);
    }
  }

  async function autogenBackend(){
    if (!isAdmin) return;
    setSaving(true);
    try{
      const res = await fetch(`/api/media/autogen`, {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          ...(adminToken ? { "Authorization": `Bearer ${adminToken}` } : {})
        },
        body: JSON.stringify({
          menu,
          stage,
          dishId,
          strategy,
          seed
        })
      });
      const out = await res.json();
      if (!out.ok) {
        alert(out.error || "Autogen failed");
        return;
      }
      // refresh happens via parent after save; quick local update:
      setDraft(out.saved);
    } finally {
      setSaving(false);
    }
  }

  function onPointerDown(ev, idx){
    if (!isAdmin || !edit) return;
    ev.preventDefault();
    ev.stopPropagation();
    ev.currentTarget.setPointerCapture?.(ev.pointerId);
    setDrag({ idx });
  }

  function onPointerMove(ev){
    if (!isAdmin || !edit) return;
    if (!drag) return;
    const { x, y } = getRelXY(ev);
    const next = [...hotspots];
    next[drag.idx] = { ...next[drag.idx], x, y };
    setDraft({ ...(draft || media), hotspots: next });
  }

  function onPointerUp(){
    if (!drag) return;
    setDrag(null);
  }

  if (!hasImage) {
    return (
      <div style={{
        border:"1px solid rgba(244,239,231,.08)",
        borderRadius:16,
        background:"linear-gradient(180deg, rgba(255,207,125,.06), rgba(0,0,0,.10))",
        padding:12,
        marginTop:10
      }}>
        <div style={{ opacity:.8, fontSize:12 }}>
          {lang==="de" ? "Bild folgt (Hotspots bereit)." : "Image coming (hotspots-ready)."}
        </div>
      </div>
    );
  }

  const tooltipTitle = (idx) => {
    const h = hotspots[idx];
    if (!h) return "";
    return h?.label?.[lang] || h?.label?.en || h.ingredientId;
  };

  const dotStyle = (h, idx) => {
    const isHero = h?.role === "hero" || idx === 0;
    const isHovered = hoverIdx === idx;
    const size = isHero ? 18 : 14;
    const halo = isHero ? 9 : 7;
    const scale = isHovered ? 1.06 : 1.0;
    const box = isHovered ? (halo + 3) : halo;

    return {
      position:"absolute",
      left:`${(h.x||0)*100}%`,
      top:`${(h.y||0)*100}%`,
      transform:`translate(-50%,-50%) scale(${scale})`,
      width: size,
      height: size,
      borderRadius: 999,
      border:"1px solid rgba(255,207,125,.85)",
      background: isHovered ? "rgba(255,207,125,.22)" : "rgba(255,207,125,.18)",
      boxShadow:`0 0 0 ${box}px rgba(255,207,125,.09)`,
      cursor: (isAdmin && edit) ? "grab" : "pointer",
      transition: "transform .12s ease, box-shadow .16s ease, background .16s ease, border-color .16s ease"
    };
  };

  return (
    <div style={{ marginTop: 10 }}>
      <style>{`
        .hotspotTooltip{
          pointer-events:none;
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(244,239,231,.10);
          background: rgba(10,9,7,.92);
          color: rgba(244,239,231,.88);
          font-size: 12px;
          backdrop-filter: blur(10px);
          box-shadow: 0 18px 60px rgba(0,0,0,.45);
          white-space: nowrap;
        }
        .hotspotControls label{
          font-size: 12px;
          opacity: .85;
        }
        .hotspotControls input, .hotspotControls select{
          padding: 10px 10px;
          border-radius: 12px;
          border: 1px solid rgba(244,239,231,.10);
          background: rgba(0,0,0,.20);
          color: rgba(244,239,231,.92);
        }
      `}</style>

      <div
        ref={wrapRef}
        onClick={onImgClick}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position:"relative",
          width:"100%",
          borderRadius:16,
          overflow:"hidden",
          border:"1px solid rgba(244,239,231,.08)",
          background:"#0b0907",
          cursor: (isAdmin && edit) ? "crosshair" : "default"
        }}
      >
        {blur && (
          <img
            src={blur}
            alt=""
            aria-hidden="true"
            style={{
              position:"absolute",
              inset:0,
              width:"100%",
              height:"100%",
              objectFit:"cover",
              filter:"blur(16px)",
              transform:"scale(1.10)",
              opacity: loaded ? 0 : 1,
              transition:"opacity .25s ease"
            }}
          />
        )}

        <img
          src={media.imageUrl}
          alt={alt}
          style={{
            width:"100%",
            display:"block",
            opacity: loaded ? .94 : (blur ? 0 : .94),
            transition:"opacity .25s ease",
            transform: "translateZ(0)"
          }}
          loading="lazy"
          onLoad={()=>setLoaded(true)}
          onDoubleClick={() => setLightbox(true)}
        />

        {(hotspots || []).map((h, idx) => {
          const title = tooltipTitle(idx);
          return (
            <button
              key={`${h.ingredientId}-${idx}`}
              onPointerDown={(ev)=>onPointerDown(ev, idx)}
              onMouseEnter={()=>setHoverIdx(idx)}
              onMouseLeave={()=>setHoverIdx(null)}
              onFocus={()=>setHoverIdx(idx)}
              onBlur={()=>setHoverIdx(null)}
              onClick={(ev)=>{
                ev.stopPropagation();
                if (isAdmin && edit) return;
                onHotspotClick?.(h.ingredientId);
              }}
              aria-label={title}
              style={dotStyle(h, idx)}
              type="button"
            />
          );
        })}

        {hoverIdx !== null && hotspots[hoverIdx] && (
          <div
            className="hotspotTooltip"
            style={{
              position:"absolute",
              left:`${(hotspots[hoverIdx]?.x||0.5)*100}%`,
              top:`${((hotspots[hoverIdx]?.y||0.5)*100) - 8}%`,
              transform:"translate(-50%,-110%)"
            }}
          >
            {tooltipTitle(hoverIdx)}
          </div>
        )}
      </div>

      {isAdmin && (
        <div style={{ marginTop: 8, display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
          <button className="btn ghost" onClick={()=>{ setEdit(!edit); setDraft(media); }}>
            {edit ? "Exit Edit" : "Edit Hotspots"}
          </button>

          {edit && (
            <div className="hotspotControls" style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
              <div className="field" style={{ minWidth: 240 }}>
                <label>Auto-layout</label>
                <select value={strategy} onChange={(e)=>setStrategy(e.target.value)}>
                  {HOTSPOT_LAYOUTS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              <div className="field" style={{ minWidth: 140 }}>
                <label>Seed</label>
                <input value={String(seed)} onChange={(e)=>setSeed(parseInt(e.target.value||"1910",10))} />
              </div>

              <button className="btn ghost" disabled={saving} onClick={autogenBackend}>
                Auto-generate (backend)
              </button>

              <button className="btn" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</button>
              <span className="small" style={{ opacity:.8 }}>Drag points. Click image to add points. Double-click to zoom.</span>
            </div>
          )}
        </div>
      )}

      {isAdmin && edit && (
        <div style={{ marginTop: 10 }}>
          <div className="small" style={{ opacity:.85, marginBottom: 6 }}>Hotspots</div>

          {(hotspots||[]).map((h, idx) => (
            <div key={idx} className="panel" style={{ padding:10, marginBottom:8 }}>
              <div className="row" style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
                <div className="field" style={{ minWidth: 240, flex:1 }}>
                  <label>ingredientId</label>
                  <input
                    value={h.ingredientId}
                    onChange={(e)=>{
                      const next = [...hotspots];
                      next[idx] = { ...h, ingredientId: e.target.value };
                      setDraft({ ...(draft||media||{}), hotspots: next });
                    }}
                  />
                </div>

                <div className="field" style={{ minWidth: 160 }}>
                  <label>role</label>
                  <select
                    value={h.role || "component"}
                    onChange={(e)=>{
                      const next = [...hotspots];
                      next[idx] = { ...h, role: e.target.value };
                      setDraft({ ...(draft||media||{}), hotspots: next });
                    }}
                  >
                    {["hero","sauce","garnish","crunch","accent","component"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <button className="btn danger" onClick={()=>removeAt(idx)}>Remove</button>
              </div>

              <div className="row" style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:10 }}>
                <div className="field" style={{ flex:1, minWidth: 220 }}>
                  <label>label (EN)</label>
                  <input
                    value={(h.label?.en || titleize(h.ingredientId))}
                    onChange={(e)=>{
                      const next = [...hotspots];
                      next[idx] = { ...h, label: { ...(h.label||{}), en: e.target.value } };
                      setDraft({ ...(draft||media||{}), hotspots: next });
                    }}
                  />
                </div>

                <div className="field" style={{ flex:1, minWidth: 220 }}>
                  <label>label (DE)</label>
                  <input
                    value={(h.label?.de || titleize(h.ingredientId))}
                    onChange={(e)=>{
                      const next = [...hotspots];
                      next[idx] = { ...h, label: { ...(h.label||{}), de: e.target.value } };
                      setDraft({ ...(draft||media||{}), hotspots: next });
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <>
          <div
            onClick={()=>setLightbox(false)}
            style={{
              position:"fixed",
              inset:0,
              background:"rgba(0,0,0,.72)",
              backdropFilter:"blur(6px)",
              zIndex: 1000
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position:"fixed",
              left:"50%",
              top:"50%",
              transform:"translate(-50%,-50%)",
              width:"min(1024px, 92vw)",
              borderRadius: 18,
              overflow:"hidden",
              border:"1px solid rgba(244,239,231,.10)",
              boxShadow:"0 40px 120px rgba(0,0,0,.60)",
              zIndex: 1001
            }}
          >
            <img src={media.imageUrl} alt={alt} style={{ width:"100%", display:"block" }} />
          </div>
        </>
      )}
    </div>
  );
}
