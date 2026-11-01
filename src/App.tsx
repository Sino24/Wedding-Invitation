import { useEffect, useState, type CSSProperties } from "react";
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
        {e.schedule.map(([t, w], i) => (
          <li key={t + w} style={{ "--i": i } as CSSProperties}><b>{t}</b><span>{w}</span></li>
        ))}
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

  useEffect(() => { document.documentElement.dataset.theme = C.theme; }, []);
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
      document.querySelectorAll("section").forEach((sec) =>
        sec.querySelectorAll<HTMLElement>(".rv,.draw").forEach((el, i) => {
          el.style.transitionDelay = Math.min(i, 4) * 0.13 + "s";
          io!.observe(el);
        })
      );
    }, 600);
    return () => { clearTimeout(t); io?.disconnect(); };
  }, [opened]);

  const open = () => { setOpened(true); music.play(); };

  return (
    <>
      {opened && (
        <button className={"mus " + (music.on ? "on" : "off")} onClick={music.toggle} aria-label="Toggle music" aria-pressed={music.on}>♫</button>
      )}

      <div className={"cover" + (opened ? " open" : "")} role="dialog" aria-label="Wedding invitation cover">
        <div className="door l" />
        <div className="door r" />
        <div className="cover-in">
          <div className="kick">The wedding of</div>
          <div className="cnames shimmer" role="heading" aria-level={1}>
            <span>{C.groom}</span><i>&amp;</i><span>{C.bride}</span>
          </div>
          <button className="seal" onClick={open} aria-label="Open invitation">
            <span>{C.groom[0]}&amp;{C.bride[0]}</span>
          </button>
          <div className="tap">Tap to open</div>
          <div className="cdate">{dl(wed.start, { day: "numeric", month: "long", year: "numeric" })} &nbsp;·&nbsp; {C.city}</div>
        </div>
      </div>

      <main>
        <section className={"hero" + (opened ? " go" : "")}>
          <div className="kick fu k1">Together with their families</div>
          <h1 className="hn">
            <span className="wipe w1">{C.groom}</span>
            <i className="amp fu k2">&amp;</i>
            <span className="wipe w2">{C.bride}</span>
          </h1>
          <div className="hline fu k3" />
          <p className="hdate fu k3">{dl(wed.start, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          <div className="cue fu k4"><span>Scroll</span><em /></div>
        </section>

        <section className="invite">
          <div className="kick rv">With joy in our hearts</div>
          <h2 className="rv">You are invited</h2>
          <div className="draw" />
          <p className="lead rv">{C.message}</p>
          <div className="count rv">
            {count.map(([l, v]) => (<div key={l}><b>{v}</b><span>{l}</span></div>))}
          </div>
        </section>

        <section className="duo tint">
          <div className="kick rv">The couple</div>
          <h2 className="rv">Two hearts, one story</h2>
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

        <section className="rsvp">
          <div className="kick rv">Kindly reply</div>
          <h2 className="rv">Will you join us?</h2>
          <p className="rv">Your presence will make our day complete.</p>
          <a className="btn fill rv" target="_blank" rel="noopener noreferrer"
             href={`https://wa.me/${C.rsvpPhone}?text=${encodeURIComponent(C.rsvpText)}`}>RSVP on WhatsApp</a>
          <div className="draw" />
          <div className="sign shimmer rv">{names}</div>
          <small className="rv">With love, and with blessings from both our families</small>
        </section>
      </main>
    </>
  );
}
