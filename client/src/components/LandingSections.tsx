import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Check, CircleHelp, ExternalLink, MessageCircle, Quote, Send } from "lucide-react";
import { Link, useLocation } from "wouter";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { stories } from "@/data/news";
import { SectionLabel } from "@/components/SiteShell";
import { CountUp, RisingWordmark, useTypewriter, WordRise } from "@/components/motionKit";

gsap.registerPlugin(ScrollTrigger);
const Constellation3D = lazy(() => import("@/components/Constellation3D"));

const story = stories[0];
const ease = [0.16, 1, 0.3, 1] as const;

function SectionIntro({ eyebrow, title, dek, tone = "neutral" }: { eyebrow: string; title: string; dek: string; tone?: "neutral" | "research" | "discussion" }) {
  return <div className={`landing-section-intro ${tone}`}><SectionLabel tone={tone}>{eyebrow}</SectionLabel><WordRise text={title} /><p>{dek}</p></div>;
}

const pasteExamples = ["A court order on city water supply", "A budget decision on rural health care", "A protest over a new labour rule", "A minister's statement on school curriculum"];
const stageLines = ["Finding sources…", "Building the timeline…", "Checking the evidence…"];

export function PasteCard({ final = false }: { final?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.3 });
  const [, setLocation] = useLocation();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [stage, setStage] = useState<number | null>(null);
  const placeholder = useTypewriter(pasteExamples, inView && !focused && value === "" && stage === null, "https://… or type a headline");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (stage !== null) return;
    if (reduce) { setLocation("/analyse"); return; }
    setStage(0);
    stageLines.forEach((_, index) => window.setTimeout(() => setStage(index), index * 800));
    window.setTimeout(() => setLocation("/analyse"), stageLines.length * 800 + 150);
  };
  return <div ref={ref} className={`landing-paste-card ${final ? "landing-paste-card-final" : ""}`}>
    <div className="landing-card-top"><SectionLabel tone="research">Start a research brief</SectionLabel><span>For your next rabbit hole</span></div>
    <h3>Paste a link or headline.<br /><em>We’ll do the background work.</em></h3>
    <form className="landing-input" onSubmit={submit}><input aria-label="Paste a link or headline" placeholder={placeholder} value={value} onChange={event => setValue(event.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} /><button type="submit" data-magnetic aria-label="Analyse link" disabled={stage !== null}><ArrowRight size={18} /></button></form>
    <p className={stage !== null ? "is-working" : ""} aria-live="polite">{stage === null ? <><CircleHelp size={13} /> In this edition, analysis is shown from cached demo research.</> : <span key={stage} className="stage-line"><i className="stage-dot" />{stageLines[stage]}</span>}</p>
  </div>;
}

export function HeroSection() {
  return <section className="landing-hero landing-section" data-section-index="1">
    <div className="landing-hero-copy"><span className="landing-kicker">THE USEFUL BIT / TODAY</span><h1 aria-label="News is the first draft. Context is the second."><span className="hl hl-1" aria-hidden="true"><span className="hl-in">News is the first draft.</span></span><span className="hl hl-2" aria-hidden="true"><span className="hl-in">Context is the second.</span></span></h1><p>Global Brief follows the thread behind a story — what led here, who is affected, and what the evidence can actually support.</p></div>
    <PasteCard />
  </section>;
}

export function ProblemSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const headlineOpacity = useTransform(scrollYProgress, [0.25, 0.58], [1, 0.34]);
  const cards = [
    ["2018", "Planning maps show the gap between new built-up areas and dependable piped supply."],
    ["2023", "Groundwater depletion becomes a public issue rather than a private worry."],
    ["May 2026", "A dry season exposes neighbourhoods still relying on tankers."],
    ["June 2026", "Reuse projects enter the conversation, but connections remain uneven."],
    ["October 2026", "Demand management joins emergency supply in the proposal."],
    ["Now", "The question shifts from a summer crisis to who gets to plan the next decade."],
  ];
  return <section ref={ref} className="landing-problem landing-section landing-pinned-section" data-section-index="2">
    <div className="landing-pin-inner"><SectionIntro eyebrow="THE PROBLEM / DEMO" title="A headline tells you what happened. It rarely tells you why." dek="A story becomes legible when the dates, decisions, and consequences around it have somewhere to settle." />
      <div className="problem-stage"><motion.div style={{ opacity: headlineOpacity }} className="problem-headline"><span>GOVERNANCE / INDIA</span><strong>{story.title}</strong><small>Demo headline · The Public Ledger</small></motion.div><div className="problem-cards">{cards.map(([date, text], index) => <div className="problem-context-card" data-context-card key={date}><span>{date}</span><p>{text}</p><b>Demo</b></div>)}</div></div>
    </div>
  </section>;
}

const steps = [
  ["01", "Paste", "A link or headline gives the desk a starting point."],
  ["02", "Trace", "The story is placed in a timeline with its source trail visible."],
  ["03", "Weigh", "Claims receive literal evidence tags, including uncertainty."],
  ["04", "Discuss", "People argue and respond below the research, in their own room."],
] as const;

function StepVisual({ active }: { active: number }) {
  const visuals = [
    <div className="how-visual-input"><span>https://… or type a headline</span><i><ArrowRight size={15} /></i></div>,
    <div className="how-visual-timeline"><span>2018</span><i /><div><b>A city grows around its water map</b><small>Planning documents begin to show a widening gap.</small></div><span>2026</span></div>,
    <div className="how-visual-evidence"><p>The measure will end seasonal shortages this year.</p><span className="tag-unverified">Unverified</span><p>Reuse projects combine with monitoring.</p><span className="tag-confirmed">Confirmed by multiple sources</span></div>,
    <div className="how-visual-post"><div className="mini-avatar">RK</div><div><b>Evidence-backed argument</b><p>The board’s own brief shows that distribution is the problem.</p><small><Check size={12} /> Source checked: supports the claim</small></div></div>,
  ];
  return <div className="how-visual-wrap"><div className="how-visual-label">Demo view / {steps[active][1]}</div>{visuals.map((visual, index) => <motion.div key={index} className="how-visual-layer" animate={{ opacity: index === active ? 1 : 0, y: index === active ? 0 : 10 }} transition={{ duration: .42, ease }}>{visual}</motion.div>)}</div>;
}

export function HowWorksSection() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", value => setActive(reduce ? 0 : Math.min(3, Math.floor(value * 4))));
  return <section ref={ref} className="landing-how landing-section landing-pinned-section" data-section-index="3"><div className="landing-pin-inner"><SectionIntro eyebrow="THE METHOD / DEMO" title="Paste. Trace. Weigh. Discuss." dek="The process is deliberately plain: each step leaves a visible trace and keeps opinion separate from the research." /><div className="how-grid"><div className="how-steps">{steps.map(([number, label, text], index) => <div className={`how-step ${active === index ? "is-active" : ""}`} key={label}><span>{number}</span><div><b>{label}</b><p>{text}</p></div></div>)}</div><StepVisual active={active} /></div></div></section>;
}

const constellationNodes = [
  [50, 50, 13, "Story"], [21, 27, 7, "Court order"], [79, 23, 6, "Minister"], [17, 67, 7, "Protest"], [82, 65, 7, "City"], [48, 16, 6, "Policy"], [56, 82, 6, "Earlier ruling"], [34, 74, 4, "Budget"], [66, 31, 4, "Agency"], [30, 42, 4, "Report"], [72, 72, 4, "Households"],
] as const;
const constellationLines = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 5], [1, 7], [2, 5], [2, 8], [3, 7], [3, 9], [4, 6], [4, 10], [5, 8], [6, 7], [6, 10]];

export function ConstellationSection() {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [wide] = useState(() => typeof window !== "undefined" && window.innerWidth >= 900);
  const use3D = wide && !reduce && !failed;
  return <section className="landing-constellation landing-section" data-section-index="4"><SectionIntro eyebrow="CONNECTIONS / DEMO" title="Nothing happens alone." dek="A source trail is not a theory of everything. It is a way to see which people, places, institutions, and events share a line." /><div className={`constellation-stage ${use3D ? "is-3d" : ""}`}>{use3D ? <Suspense fallback={<div className="c3d-loading">Loading the constellation…</div>}><Constellation3D onFallback={() => setFailed(true)} /></Suspense> : <svg viewBox="0 0 100 100" role="img" aria-label="A static constellation of demo story connections" className={reduce ? "is-static" : ""}>{constellationLines.map(([from, to], index) => { const a = constellationNodes[from]; const b = constellationNodes[to]; const isHot = hovered === from || hovered === to; return <line key={index} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className={isHot ? "is-hot" : hovered !== null ? "is-dim" : ""} />; })}{constellationNodes.map(([x, y, radius, label], index) => <g key={label} className={`constellation-node ${index === 0 ? "is-core" : ""} ${hovered === index ? "is-hovered" : ""}`} onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)}><circle cx={x} cy={y} r={radius / 2.4} /><text x={x + radius / 1.5} y={y + 1.4}>{label}</text></g>)}</svg>}<div className="constellation-note"><span>{use3D ? "LIVE 3D / DEMO" : "STATIC FALLBACK / DEMO"}</span><p>{use3D ? "Scroll to fly through the connections. Hover a point to follow its links." : "WebGL is skipped here. The constellation stays crisp, lightweight, and readable at any frame rate."}</p></div></div></section>;
}

export function TimelineDepthSection() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const root = ref.current;
    if (reduce || !root) return;
    const context = gsap.context(() => {
      const line = root.querySelector<HTMLElement>(".depth-line");
      const stage = root.querySelector<HTMLElement>(".depth-stage");
      if (line && stage) gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, transformOrigin: "top center", ease: "none", scrollTrigger: { trigger: stage, start: "top 70%", end: "bottom 60%", scrub: 0.6 } });
      gsap.utils.toArray<HTMLElement>(".depth-sheet", root).forEach(sheet => {
        gsap.from(sheet, { opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: sheet, start: "top 90%", once: true } });
      });
    }, root);
    return () => context.revert();
  }, [reduce]);
  const timeline = story.timeline.concat([{ date: "Next", title: "The next useful question", text: "What would make the plan visible to the people asked to trust it?", source: "Open question / Demo" }]);
  return <section ref={ref} className="landing-depth landing-section" data-section-index="5"><SectionIntro eyebrow="TIMELINE IN DEPTH / DEMO" title="Every story has a past." dek="Move through seven dated sheets. The oldest record stays behind; the question in front gets sharper." /><div className="depth-stage"><div className="depth-line" />{timeline.map((item, index) => <article className="depth-sheet" style={{ ["--sheet-index" as string]: index }} key={item.date}><span>{item.date}</span><div><h3>{item.title}</h3><p>{item.text}</p><small>{item.source}</small></div></article>)}</div></section>;
}

const lensExamples = ["Who gets to make the rule?", "Who pays for the fix?", "Who feels the change first?", "What happens to the place itself?", "What is local, and what is shared?"];
export function LensesSection() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const root = ref.current;
    if (reduce || !root) return;
    const context = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".landing-lens-card", root);
      cards.forEach((card, index) => {
        const next = cards[index + 1];
        if (!next) return;
        gsap.to(card, { scale: 0.94, opacity: 0.5, transformOrigin: "center top", ease: "none", scrollTrigger: { trigger: next, start: "top 85%", end: "top 25%", scrub: true } });
      });
    }, root);
    return () => context.revert();
  }, [reduce]);
  return <section ref={ref} className="landing-lenses landing-section" data-section-index="6"><SectionIntro eyebrow="FIVE LENSES / DEMO" title="One story. Five consequences." dek="A useful explanation changes shape when you ask who decides, who pays, who is affected, and what remains unresolved." /><div className="lens-stack">{story.lenses.map((lens, index) => <article className="landing-lens-card" style={{ top: `calc(15vh + ${index * 24}px)`, zIndex: index + 1 }} key={lens.label}><div><span>0{index + 1}</span><small>{lens.label}</small></div><h3>{lens.text}</h3><p>{lensExamples[index]}</p><footer><span>Affected</span><strong>{lens.affected}</strong></footer></article>)}</div></section>;
}

const evidenceClaims: { text: string; label: string; className: string }[] = [
  { text: "The city is combining new reuse projects with stricter groundwater monitoring.", label: "Confirmed by multiple sources", className: "tag-confirmed" },
  { text: "Household demand has grown faster than the main distribution network in several zones.", label: "Single source", className: "tag-single" },
  { text: "The measures will end seasonal shortages this year.", label: "Disputed", className: "tag-disputed" },
];
export function EvidenceSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 45%"] });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", value => setActive(Math.min(2, Math.max(0, Math.floor(value * 3.1)))));
  return <section ref={ref} className="landing-evidence landing-section" data-section-index="7"><SectionIntro eyebrow="EVIDENCE / DEMO" title="Evidence before certainty." dek="The labels describe the source record, not how confident a model sounds." /><div className="evidence-demo"><span className="demo-stamp">Demo</span>{evidenceClaims.map((claim, index) => <div className={`evidence-claim ${index <= active ? "is-revealed" : ""}`} key={claim.text}><p>{claim.text}</p><motion.span className={`evidence-stamp ${claim.className}`} animate={{ opacity: index <= active ? 1 : 0, scale: index <= active ? 1 : .86, y: index <= active ? 0 : 8 }} transition={{ duration: .34, ease }}>{claim.label}</motion.span></div>)}</div></section>;
}

function PrincipleWord({ word, index, total, progress }: { word: string; index: number; total: number; progress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const opacity = useTransform(progress, [Math.max(0, index / total - .16), Math.min(1, index / total + .2)], [.28, 1]);
  return <motion.span style={{ opacity }}>{word} </motion.span>;
}

export function PrincipleSection() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 35%"] });
  useEffect(() => {
    const root = ref.current;
    if (reduce || !root) return;
    const split = root.querySelector<HTMLElement>(".principle-split");
    const divider = root.querySelector<HTMLElement>(".principle-divider");
    if (!split) return;
    const proxy = { shift: 0 };
    const tint = gsap.to(proxy, { shift: 1, ease: "none", onUpdate: () => root.style.setProperty("--shift", proxy.shift.toFixed(3)), scrollTrigger: { trigger: split, start: "top 85%", end: "bottom 35%", scrub: true } });
    const media = gsap.matchMedia();
    if (divider) {
      media.add("(min-width: 681px)", () => { gsap.fromTo(divider, { scaleY: 0, transformOrigin: "top center" }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: split, start: "top 80%", end: "top 35%", scrub: true } }); });
      media.add("(max-width: 680px)", () => { gsap.fromTo(divider, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: split, start: "top 80%", end: "top 40%", scrub: true } }); });
    }
    return () => { tint.scrollTrigger?.kill(); tint.kill(); media.revert(); root.style.removeProperty("--shift"); };
  }, [reduce]);
  const words = "AI explains and cites. People argue and respond. The research is the machine's. The opinion is yours.".split(" ");
  return <section ref={ref} className="landing-principle landing-section" data-section-index="8"><SectionIntro eyebrow="THE CORE PRINCIPLE / DEMO" title="The research is the machine's. The opinion is yours." dek="The boundary is the point: a clear explanation above, a human conversation below." /><p className="principle-copy">{words.map((word, index) => reduce ? <span key={`${word}-${index}`}>{word} </span> : <PrincipleWord key={`${word}-${index}`} word={`${word} `} index={index} total={words.length} progress={scrollYProgress} />)}</p><div className="principle-split"><div className="principle-research"><SectionLabel tone="research">AI Research</SectionLabel><p>The AI explains and cites. Timeline, lenses, source comparisons, and scenarios stay inside the evidence shown.</p></div><div className="principle-divider" /><div className="principle-discussion"><SectionLabel tone="discussion">Public Discussion</SectionLabel><p>People argue and respond. Names stay visible. AI can check a link, but it never judges who is right.</p></div></div></section>;
}

const previewPosts = [
  ["AM", "Asha Menon", "Opinion", "The useful shift is asking institutions to show the full map. A household cannot conserve its way out of a missing pipe.", "18", "3"],
  ["RK", "Rohan Kulkarni", "Evidence-backed argument", "The board’s own brief shows that some zones have capacity while others depend on tankers.", "22", "5"],
  ["NR", "Nandita Rao", "Question", "What would a resident actually be able to check in the next six months to know whether this plan is working?", "9", "1"],
] as const;
export function DiscussionPreviewSection() {
  const reduce = useReducedMotion();
  return <section className="landing-discussion landing-section" data-section-index="9"><SectionIntro eyebrow="DISCUSSION PREVIEW / DEMO" title="Argue with sources." dek="Everything below is written by people. The labels stay visible so the room remains useful." /><div className="preview-posts">{previewPosts.map(([initials, author, type, body, agree, disagree], index) => <motion.article className="preview-post" initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={reduce ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .55, delay: index * .1, ease }} key={author}><div className="preview-avatar">{initials}</div><div><div className="preview-meta"><b>{author}</b><span>Demo</span><small>{type}</small></div><p>{body}</p>{index === 1 && <span className="checked-source"><Check size={12} /> Source checked: supports the claim</span>}<div className="preview-actions"><button><span>Agree</span> <CountUp value={Number(agree)} /></button><button><span>Disagree</span> <CountUp value={Number(disagree)} /></button><button><MessageCircle size={13} /> Reply</button><Quote size={13} /></div></div></motion.article>)}</div></section>;
}

export function FinalSection() {
  return <section className="landing-final landing-section" data-section-index="10"><SectionIntro eyebrow="THE NEXT READ / DEMO" title="Start with the story you can't stop thinking about." dek="Bring the headline. Keep the source trail. Let the context take its time." /><PasteCard final /><Link href="/front-page" className="landing-enter-button" data-magnetic>Enter the front page <ArrowRight size={16} /></Link><RisingWordmark /><div className="landing-final-footer"><Link href="/about">About</Link><Link href="/front-page">Front page</Link><Link href="/login">Sign in</Link><span>Demo edition</span><ExternalLink size={13} /></div></section>;
}
