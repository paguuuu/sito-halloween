"use client";
import { useState } from "react";
const T = { ingresso: { n: "Ingresso", p: 20, d: "Ingresso normale con 2 drink omaggio." }, openbar: { n: "Open Bar", p: 30, d: "Open bar per tutta la sera." } };
const blank = (type) => ({ type, name: "", surname: "", birth: "", buffet: false });

export default function Home() {
  const [people, setPeople] = useState([]);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const count = (t) => people.filter((p) => p.type === t).length;
  const add = (t) => people.length < 10 && setPeople([...people, blank(t)]);
  const rem = (t) => { const i = people.map((p) => p.type).lastIndexOf(t); if (i >= 0) setPeople(people.filter((_, k) => k !== i)); };
  const set = (i, k, v) => setPeople(people.map((p, j) => (j === i ? { ...p, [k]: v } : p)));
  const total = people.reduce((s, p) => s + T[p.type].p, 0);

  async function pay() {
    setErr("");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Inserisci un'email valida: ci arriveranno i biglietti.");
    for (const p of people) {
      const y = Number(p.birth);
      if (!p.name.trim() || !p.surname.trim()) return setErr("Compila nome e cognome di ogni biglietto.");
      if (!(y >= 1930 && y <= 2008)) return setErr("Anno di nascita non valido: l'evento è riservato ai maggiorenni (nati nel 2008 o prima).");
    }
    setBusy(true);
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, people }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Errore");
      location.href = j.url;
    } catch (e) { setErr(e.message); setBusy(false); }
  }

  return (
    <>
      <header className="hero">
        <div className="moon" /><div className="fog" />
        <svg className="drip" viewBox="0 0 1200 90" preserveAspectRatio="none"><g fill="#c0071f"><rect width="1200" height="18" /><path d="M80 16h14v50a7 7 0 0 1-14 0zM230 16h10v34a5 5 0 0 1-10 0zM420 16h16v66a8 8 0 0 1-16 0zM610 16h10v28a5 5 0 0 1-10 0zM790 16h14v58a7 7 0 0 1-14 0zM960 16h10v36a5 5 0 0 1-10 0zM1110 16h14v46a7 7 0 0 1-14 0z" /></g></svg>
        <p className="date">31 OTTOBRE 2026 — DALLE 23:00</p>
        <h1>RIFELLOWEEN</h1>
        <p className="tag">Una notte di Halloween in stile americano. Vestiti da incubo, il posto lo scopri poco prima.</p>
        <a className="btn" href="#biglietti">Acquista Biglietti</a>
      </header>

      <main>
        <h2>La notte</h2>
        <p className="lead">È una festa, non una discoteca. Come un house party americano: gente travestita, snack tutta la sera, beer pong.</p>
        <div className="facts">
          <div><b>Quando</b><span>Sabato 31.10.26, dalle 23:00 in poi</span></div>
          <div><b>Dove</b><span>Il luogo viene svelato pochi giorni prima, via email a chi ha il biglietto</span></div>
          <div><b>Dress code</b><span>Vestirsi è consigliato. Il costume più folle vince la serata.</span></div>
          <div><b>Cosa c'è</b><span>Snack per tutta la sera e beer pong</span></div>
          <div><b>Cena</b><span>Buffet su richiesta, pochissimi posti: la richiedi in fase di acquisto</span></div>
          <div><b>Biglietti</b><span>Nominativi. Ti arriva un QR per email, lo scansioniamo all'ingresso con un documento.</span></div>
        </div>

        <h2 id="biglietti">Scegli</h2>
        <div className="stubs">
          {Object.entries(T).map(([k, t]) => (
            <div className="stub" key={k}>
              <h3>{t.n}</h3><div className="price">{t.p}€</div><p>{t.d}</p>
              <div className="qty"><button aria-label="Meno" onClick={() => rem(k)}>−</button><span>{count(k)}</span><button aria-label="Più" onClick={() => add(k)}>+</button></div>
            </div>
          ))}
        </div>

        {people.length > 0 && (
          <>
            <h2>A chi li intestiamo?</h2>
            <p className="lead">Ogni biglietto è personale: servono i dati di chi entra.</p>
            {people.map((p, i) => (
              <div className="who" key={i}>
                <h4>Biglietto {i + 1} — {T[p.type].n}</h4>
                <input type="text" placeholder="Nome" value={p.name} onChange={(e) => set(i, "name", e.target.value)} />
                <input type="text" placeholder="Cognome" value={p.surname} onChange={(e) => set(i, "surname", e.target.value)} />
                <input type="number" placeholder="Anno nascita" value={p.birth} onChange={(e) => set(i, "birth", e.target.value)} />
                <label className="chk"><input type="checkbox" checked={p.buffet} onChange={(e) => set(i, "buffet", e.target.checked)} />Richiedo anche la cena a buffet (posti limitati)</label>
              </div>
            ))}
            <div className="pay">
              <input type="email" placeholder="La tua email (qui ricevi i biglietti)" value={email} onChange={(e) => setEmail(e.target.value)} />
              <div className="tot"><span>Totale</span><span>{total}€</span></div>
              {err && <p className="err">{err}</p>}
              <button className="btn" disabled={busy} onClick={pay}>{busy ? "Un attimo…" : "Paga e ricevi il QR"}</button>
              <p className="small">Pagamento sicuro con Stripe: carta, Apple Pay e Google Pay. Il biglietto arriva per email subito dopo il pagamento. La richiesta buffet è confermata dagli organizzatori in base ai posti.</p>
            </div>
          </>
        )}
      </main>
      <footer>RIFELLOWEEN · 31.10.26 · Evento privato riservato ai maggiorenni</footer>
    </>
  );
}
