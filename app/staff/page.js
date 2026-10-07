"use client";
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
export default function Staff() {
  const [pin, setPin] = useState("");
  const [on, setOn] = useState(false);
  const [res, setRes] = useState(null);
  const [man, setMan] = useState("");
  const [msg, setMsg] = useState("");
  const v = useRef(), c = useRef(), busy = useRef(false);

  async function call(code, enter) {
    const r = await fetch("/api/checkin", { method: "POST", headers: { "Content-Type": "application/json", "x-pin": pin }, body: JSON.stringify({ code, enter }) });
    if (r.status === 401) { setMsg("PIN errato"); setOn(false); return null; }
    return r.json();
  }
  async function lookup(code) { const j = await call(code, false); if (j) setRes({ ...j, code }); }
  async function enter() { const j = await call(res.code, true); if (j) setRes({ ...j, code: res.code }); }
  const next = () => { setRes(null); setMan(""); busy.current = false; };

  useEffect(() => {
    if (!on) return;
    let stream, raf;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        v.current.srcObject = stream; await v.current.play();
        const loop = () => {
          const el = v.current, cv = c.current;
          if (el && el.readyState === 4 && !busy.current) {
            cv.width = el.videoWidth; cv.height = el.videoHeight;
            const x = cv.getContext("2d"); x.drawImage(el, 0, 0);
            const q = jsQR(x.getImageData(0, 0, cv.width, cv.height).data, cv.width, cv.height);
            if (q?.data) { busy.current = true; lookup(q.data); }
          }
          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch { setMsg("Fotocamera non disponibile: usa il codice manuale."); }
    })();
    return () => { cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()); };
  }, [on]);

  const t = res?.ticket;
  return (
    <main style={{ paddingTop: 30 }}>
      <h2 style={{ marginTop: 0 }}>Ingressi</h2>
      {!on ? (
        <div className="pay">
          <input type="password" placeholder="PIN staff" value={pin} onChange={(e) => setPin(e.target.value)} />
          {msg && <p className="err">{msg}</p>}
          <button className="btn" onClick={() => { setMsg(""); setOn(true); }}>Apri scanner</button>
        </div>
      ) : (
        <>
          <video ref={v} playsInline muted /><canvas ref={c} hidden />
          <div className="pay" style={{ marginTop: 14 }}>
            <input type="text" placeholder="Codice manuale (RFL…)" value={man} onChange={(e) => setMan(e.target.value)} />
            <button className="btn" style={{ fontSize: 16, padding: 14 }} onClick={() => { busy.current = true; lookup(man); }}>Cerca</button>
          </div>
          {msg && <p className="err">{msg}</p>}
          {res && (
            <div className={"card " + (res.status === "invalid" || res.status === "used" ? "ko" : "ok")}>
              {res.status === "invalid" ? <h3>Biglietto NON valido</h3> : (
                <>
                  <h3 style={{ fontSize: 28 }}>{t.name} {t.surname}</h3>
                  <p>Nato nel <b>{t.birth}</b><br />{t.formula}{t.buffet ? " · BUFFET richiesto" : ""}<br />{t.email}<br /><small>{t.code}</small></p>
                  <p style={{ marginTop: 10 }}><b>{res.status === "valid" ? "VALIDO — controlla il documento" : res.status === "entered" ? "INGRESSO REGISTRATO" : "GIÀ USATO il " + t.usedAt}</b></p>
                </>
              )}
              <div className="pay">
                {res.status === "valid" && <button className="btn" onClick={enter}>Fai entrare</button>}
                <button className="btn" style={{ background: "#333" }} onClick={next}>Prossimo</button>
              </div>
              <p className="small">Entrati {res.entered} / Venduti {res.sold}</p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
