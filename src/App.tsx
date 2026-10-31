import { useEffect, useRef, useState } from "react";
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

function Seal({ onOpen }: { onOpen: () => void }) {
  return (
    <button className="seal" onClick={onOpen} aria-label="Open invitation">
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <defs><path id="sp" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
        <text><textPath href="#sp" textLength="486" lengthAdjust="spacing">TAP TO OPEN · WITH LOVE · TAP TO OPEN · WITH LOVE ·</textPath></text>
      </svg>
      <span>{C.groom[0]}&amp;{C.bride[0]}</span>
    </button>
  );
}

function Portrait(p: { no: string; role: string; name: string; photo: string; parents: string; side: "l" | "r" }) {
  return (
    <figure className={"fig rv " + p.side}>
      <div className="mat">
        <div className="pic">{p.photo ? <img src={p.photo} alt={p.name} loading="lazy" /> : <span className="init">{p.name[0]}</span>}</div>
      </div>
      <figcaption>
        <small>{p.no} — {p.role}</small>
        <b>{p.name}</b>
        <span>{p.parents}</span>
      </figcaption>
    </figure>
  );
}

function Day({ e }: { e: EventItem }) {
  return (
    <article className="day rv">
      <div className="dn">
        <b>{dl(e.start, { day: "2-digit" })}</b>
        <span>{dl(e.start, { month: "short" })} · {dl(e.start, { weekday: "short" })}</span>
      </div>
      <div className="dd">
        <h3>{e.name}</h3>
        <p className="where"><strong>{e.venue}</strong><br />{e.address}</p>
        <p className="note">{e.note}</p>
        <ul className="menu">
          {e.schedule.map(([t, w]) => (<li key={t + w}><span>{w}</span><i /><b>{t}</b></li>))}
        </ul>
        <div className="acts">
          <a className="btn fill" href={e.map} target="_blank" rel="noopener noreferrer">View location</a>
          <a className="btn" href={gcal(e)} target="_blank" rel="noopener noreferrer">Add to calendar</a>
        </div>
      </div>
    </article>
  );
}

const PETALS = ["#d99a9f", "#c97a85", "#e8b8b4", "#d68b94"];

/* a few soft rose petals drifting down (change COUNT to show more or fewer) */
function Petals({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const cv = ref.current!;
    const cx = cv.getContext("2d")!;
    let W = 0, H = 0, raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = () => {
      W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    addEventListener("resize", size);
    const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    const COUNT = reduce ? 0 : innerWidth < 600 ? 8 : 14;
    const spawn = (first: boolean) => ({
      x: Math.random() * W,
      y: first ? Math.random() * H : -24,
      r: Math.random() * 5 + 9,
      vy: Math.random() * 0.3 + 0.22,
      amp: Math.random() * 0.6 + 0.25,
      ph: Math.random() * 6.28,
      sp: Math.random() * 0.012 + 0.006,
      rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.014,
      a: Math.random() * 0.3 + 0.5,
      col: PETALS[Math.floor(Math.random() * PETALS.length)],
    });
    const P = Array.from({ length: COUNT }, () => spawn(true));
    const draw = () => {
      cx.clearRect(0, 0, W, H);
      P.forEach((p, i) => {
        p.y += p.vy; p.ph += p.sp; p.rot += p.vr; p.x += Math.sin(p.ph) * p.amp;
        if (p.y > H + 30) P[i] = spawn(false);
        const r = p.r;
        cx.save();
        cx.translate(p.x, p.y);
        cx.rotate(p.rot);
        cx.scale(Math.cos(p.ph * 1.6) * 0.55 + 0.6, 1);
        cx.globalAlpha = p.a;
        cx.fillStyle = p.col;
        cx.beginPath();
        cx.moveTo(0, -r);
        cx.bezierCurveTo(r * 0.9, -r * 0.4, r * 0.7, r * 0.8, 0, r);
        cx.bezierCurveTo(-r * 0.7, r * 0.8, -r * 0.9, -r * 0.4, 0, -r);
        cx.fill();
        cx.restore();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }, [active]);
  return <canvas className="floaters" ref={ref} aria-hidden="true" />;
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
    }, 500);
    return () => { clearTimeout(t); io?.disconnect(); };
  }, [opened]);

  const open = () => { setOpened(true); music.play(); };

  return (
    <>
      <Petals active={opened} />
      {opened && (
        <button className={"mus " + (music.on ? "on" : "off")} onClick={music.toggle} aria-label="Toggle music" aria-pressed={music.on}>♫</button>
      )}

      <div className={"cover" + (opened ? " open" : "")} role="dialog" aria-label="Wedding invitation cover">
        <div className="cover-in">
          <div className="kick">The wedding of</div>
          <h1><span>{C.groom}</span><i>&amp;</i><span>{C.bride}</span></h1>
          <Seal onOpen={open} />
          <div className="cover-foot">{dl(wed.start, { day: "numeric", month: "long", year: "numeric" })} &nbsp;·&nbsp; {C.city}</div>
        </div>
      </div>

      <main>
        <section className="intro">
          <div className="kick rv">Save the date</div>
          <div className="bigdate rv">
            <b>{dl(wed.start, { day: "2-digit" })}</b>
            <span>{dl(wed.start, { month: "long" })}<br />{dl(wed.start, { year: "numeric" })}</span>
          </div>
          <p className="lead rv">{C.message}</p>
          <div className="count rv">
            {count.map(([l, v]) => (<div key={l}><b>{v}</b><span>{l}</span></div>))}
          </div>
        </section>

        <section className="duo">
          <div className="kick rv">Meet the couple</div>
          <h2 className="rv">Two families,<br /><em>one celebration</em></h2>
          <Portrait no="01" role="The Groom" name={C.groom} photo={C.groomPhoto} parents={C.groomParents} side="l" />
          <Portrait no="02" role="The Bride" name={C.bride} photo={C.bridePhoto} parents={C.brideParents} side="r" />
        </section>

        <section className="days">
          <div className="kick rv">The celebrations</div>
          <h2 className="rv">Join us on <em>the days</em></h2>
          {C.events.map((e) => <Day key={e.key} e={e} />)}
        </section>

        <div className="dark">
          <section className="rsvp">
            <div className="kick rv">Kindly reply</div>
            <h2 className="rv">Will you<br /><em>join us?</em></h2>
            <p className="rv">Your presence will make our day complete.</p>
            <a className="btn rv" target="_blank" rel="noopener noreferrer"
               href={`https://wa.me/${C.rsvpPhone}?text=${encodeURIComponent(C.rsvpText)}`}>RSVP on WhatsApp</a>
            <div className="sign rv">{names}</div>
            <small>With love, and with blessings from both our families</small>
          </section>
        </div>
      </main>
    </>
  );
}
