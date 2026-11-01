import { useEffect, useState } from "react";
import { C, type EventItem } from "./config";
import { useMusic } from "./useMusic";
import "./styles.css";

const dl = (d: string, o: Intl.DateTimeFormatOptions) => new Date(d).toLocaleDateString("en-IN", { ...o, timeZone: C.tz });
const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: C.tz }).toUpperCase();
const gcal = (e: EventItem) => {
  const s = new Date(e.start);
  const f = new Date(s.getTime() + e.hours * 3600e3);
  const z = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  return (
    "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" +
    encodeURIComponent(`${e.name} — ${C.groom} & ${C.bride}`) +
    `&dates=${z(s)}/${z(f)}&location=` + encodeURIComponent(`${e.venue}, ${e.address}`)
  );
};
const wed = C.events.find((e) => e.key === "wedding") ?? C.events[C.events.length - 1];

function useCountdown(target: number) {
  const [s, setS] = useState(() => Math.max(0, Math.floor((target - Date.now()) / 1000)));
  useEffect(() => {
    const id = setInterval(() => setS(Math.max(0, Math.floor((target - Date.now()) / 1000))), 1000);
    return () => clearInterval(id);
  }, [target]);
  const p = (n: number) => String(n).padStart(2, "0");
  return [
    ["Days", String(Math.floor(s / 86400))],
    ["Hours", p(Math.floor((s % 86400) / 3600))],
    ["Mins", p(Math.floor((s % 3600) / 60))],
    ["Secs", p(s % 60)],
  ];
}

/* thin botanical line-art divider */
function Sprig() {
  const leaf = (x: number) => `M${x},12 C${x + 2},5 ${x + 9},2 ${x + 14},4 C${x + 12},10 ${x + 6},12 ${x},12Z`;
  const xs = [22, 42, 62, 82];
  return (
    <svg className="sprig" viewBox="0 0 130 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
      <path d="M6 12H112" />
      {xs.map((x) => <path key={"u" + x} d={leaf(x)} />)}
      <g transform="translate(0,24) scale(1,-1)">{xs.map((x) => <path key={"d" + x} d={leaf(x + 8)} />)}</g>
      <path d="M112 12 C116 6 122 6 126 9 C122 15 116 15 112 12Z" />
    </svg>
  );
}

function Portrait(p: { role: string; name: string; photo: string; parents: string }) {
  return (
    <figure className="fig rv">
      <div className="pic">{p.photo ? <img src={p.photo} alt={p.name} loading="lazy" /> : <span className="init">{p.name[0]}</span>}</div>
      <figcaption>
        <small>{p.role}</small>
        <b>{p.name}</b>
        <span>{p.parents}</span>
      </figcaption>
    </figure>
  );
}

function Day({ e }: { e: EventItem }) {
  return (
    <article className="day rv">
      <div className="kick">{e.name}</div>
      <h3>{dl(e.start, { day: "numeric", month: "long" })}</h3>
      <p className="when">{dl(e.start, { weekday: "long" })} &nbsp;·&nbsp; {fmtTime(e.start)}</p>
      <p className="venue"><b>{e.venue}</b><br />{e.address}</p>
      <p className="note">{e.note}</p>
      <ul className="sch">
        {e.schedule.map(([t, w]) => (<li key={t + w}><b>{t}</b><span>{w}</span></li>))}
      </ul>
      <div className="acts">
        <a className="btn fill" href={e.map} target="_blank" rel="noopener noreferrer">View location</a>
        <a className="btn" href={gcal(e)} target="_blank" rel="noopener noreferrer">Add to calendar</a>
      </div>
    </article>
  );
}

export default function App() {
  const [opened, setOpened] = useState(false);
  const music = useMusic(C.musicUrl);
  const count = useCountdown(new Date(wed.start).getTime());
  const names = `${C.groom} & ${C.bride}`;

  useEffect(() => { document.title = `${names} — Wedding Invitation`; }, [names]);
  useEffect(() => { document.body.classList.toggle("locked", !opened); }, [opened]);
  useEffect(() => {
    if (!opened) return;
    let io: IntersectionObserver | undefined;
    const t = setTimeout(() => {
      io = new IntersectionObserver(
        (es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add("in"); io?.unobserve(x.target); } }),
        { threshold: 0.15 }
      );
      document.querySelectorAll<HTMLElement>(".rv").forEach((el) => io!.observe(el));
    }, 400);
    return () => { clearTimeout(t); io?.disconnect(); };
  }, [opened]);

  const open = () => { setOpened(true); music.play(); };

  return (
    <>
      {opened && (
        <button className={"mus " + (music.on ? "on" : "off")} onClick={music.toggle} aria-label="Toggle music" aria-pressed={music.on}>♫</button>
      )}

      <div className={"cover" + (opened ? " open" : "")} role="dialog" aria-label="Wedding invitation cover">
        <div className="cover-in">
          <div className="kick">We’re getting married</div>
          <h1><span>{C.groom}</span><i>and</i><span>{C.bride}</span></h1>
          <Sprig />
          <p className="cdate">{dl(wed.start, { day: "numeric", month: "long", year: "numeric" })} &nbsp;·&nbsp; {C.city}</p>
          <button className="btn fill" onClick={open}>Open invitation</button>
        </div>
      </div>

      <main>
        <section className="intro">
          <div className="kick rv">Together with their families</div>
          <h2 className="rv">You are warmly invited</h2>
          <p className="lead rv">{C.message}</p>
          <div className="dateblock rv">
            <span>{dl(wed.start, { weekday: "long" })}</span>
            <b>{dl(wed.start, { day: "numeric" })}</b>
            <span>{dl(wed.start, { month: "long", year: "numeric" })}</span>
          </div>
          <div className="count rv">
            {count.map(([l, v]) => (<div key={l}><b>{v}</b><span>{l}</span></div>))}
          </div>
        </section>

        <section className="duo tint">
          <div className="kick rv">The couple</div>
          <h2 className="rv">{C.groom} <i>&amp;</i> {C.bride}</h2>
          <div className="pair">
            <Portrait role="The Groom" name={C.groom} photo={C.groomPhoto} parents={C.groomParents} />
            <Portrait role="The Bride" name={C.bride} photo={C.bridePhoto} parents={C.brideParents} />
          </div>
        </section>

        <section className="days">
          <div className="kick rv">The celebrations</div>
          <h2 className="rv">Join us</h2>
          {C.events.map((e) => <Day key={e.key} e={e} />)}
        </section>

        <section className="rsvp tint">
          <Sprig />
          <h2 className="rv">Will you join us?</h2>
          <p className="rv">Your presence will make our day complete.</p>
          <a className="btn fill rv" target="_blank" rel="noopener noreferrer"
             href={`https://wa.me/${C.rsvpPhone}?text=${encodeURIComponent(C.rsvpText)}`}>RSVP on WhatsApp</a>
          <div className="sign rv">{names}</div>
          <small>With love, and with blessings from both our families</small>
        </section>
      </main>
    </>
  );
}
