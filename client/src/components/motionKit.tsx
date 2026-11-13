import { Fragment, useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { Link } from "wouter";
import { stories } from "@/data/news";

/** Types example headlines into a placeholder. Stops when `active` is false. */
export function useTypewriter(examples: string[], active: boolean, fallback: string) {
  const reduce = useReducedMotion();
  const [text, setText] = useState(fallback);
  useEffect(() => {
    if (reduce || !active) { setText(fallback); return; }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let item = 0;
    let chars = 0;
    let deleting = false;
    const tick = () => {
      if (cancelled) return;
      const full = examples[item % examples.length];
      if (!deleting) {
        chars += 1;
        setText(full.slice(0, chars));
        if (chars >= full.length) { deleting = true; timer = setTimeout(tick, 1900); return; }
        timer = setTimeout(tick, 52);
      } else {
        chars -= 1;
        setText(full.slice(0, chars) || fallback);
        if (chars <= 0) { deleting = false; item += 1; timer = setTimeout(tick, 420); return; }
        timer = setTimeout(tick, 22);
      }
    };
    timer = setTimeout(tick, 900);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [active, reduce, fallback, examples]);
  return text;
}

/** Counts a number up once when it scrolls into view. */
export function CountUp({ value, duration = 1100 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [shown, setShown] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) { setShown(value); return; }
    if (!inView) return;
    let frame = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setShown(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduce, value, duration]);
  return <i ref={ref as React.RefObject<HTMLElement>} className="count-up">{shown}</i>;
}

/** Thin amber reading-progress line for long story pages. */
export function ReadingProgress() {
  const bar = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);
  return <div className="reading-progress" aria-hidden="true"><span ref={bar} /></div>;
}

/** Headline split into words that rise from behind a mask when scrolled into view. */
export function WordRise({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const words = text.split(" ");
  return <h2 ref={ref} className={`word-rise ${inView ? "is-in" : ""}`} aria-label={text}>
    {words.map((word, index) => <Fragment key={`${word}-${index}`}><span className="word-mask" aria-hidden="true"><span className="word-inner" style={{ ["--w" as string]: index }}>{word}</span></span>{index < words.length - 1 ? " " : ""}</Fragment>)}
  </h2>;
}

/** Slow headline ticker built from the seeded stories. */
export function HeadlineTicker() {
  const items = stories.map(story => ({ topic: story.topic, title: story.title, id: story.id }));
  const row = (suffix: string) => items.map(item => <Link href={`/story/${item.id}`} key={`${item.id}-${suffix}`}><em>{item.topic}</em><span>{item.title}</span></Link>);
  return <div className="headline-ticker" aria-label="Seeded headlines in this demo edition">
    <b>Demo desk</b>
    <div className="ticker-window"><div className="ticker-track">{row("a")}<span className="ticker-gap" aria-hidden="true" />{row("b")}<span className="ticker-gap" aria-hidden="true" /></div></div>
  </div>;
}

/** Wordmark where every letter rises from behind the mask once in view. */
export function RisingWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const letters = (word: string, offset: number) => word.split("").map((letter, index) => <i className="wm-letter" style={{ ["--i" as string]: index + offset }} key={`${word}-${index}`}>{letter}</i>);
  return <div ref={ref} className={`landing-wordmark-lockup ${inView ? "is-in" : ""}`} aria-label="Global Brief"><span aria-hidden="true">{letters("GLOBAL", 0)}</span><em aria-hidden="true">{letters("BRIEF", 6)}</em></div>;
}
