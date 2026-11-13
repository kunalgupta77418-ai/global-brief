import { useLayoutEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ExternalLink, Flag, MessageCircle, Plus, Quote, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { Link, useParams } from "wouter";
import { stories, type Evidence, type Story } from "@/data/news";
import { RuleHeading, SectionLabel } from "@/components/SiteShell";
import { ReadingProgress } from "@/components/motionKit";

const tabs = ["Timeline", "Five Lenses", "Connections", "Perspectives", "What might happen next"];
const evidenceClass: Record<Evidence, string> = { "Confirmed by multiple sources": "confirmed", "Single source": "single", "Disputed": "disputed", "Unverified": "unverified" };

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const story = stories.find(item => item.id === id) ?? stories[0];
  const [tab, setTab] = useState("Timeline");
  const [level, setLevel] = useState<"Simple" | "Student" | "Expert">("Student");
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState("");
  const [reacted, setReacted] = useState<Record<string, "agree" | "disagree">>({});
  const tabsRef = useRef<HTMLDivElement>(null);
  const [tabIndicator, setTabIndicator] = useState({ x: 0, w: 0 });
  useLayoutEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const measure = () => {
      const active = el.querySelector<HTMLElement>("button.active");
      if (active) setTabIndicator({ x: active.offsetLeft, w: active.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [tab]);

  return <div className="page-container story-page">
    <ReadingProgress />
    <Link href="/front-page" className="back-link"><ArrowLeft size={15} /> Back to the front page</Link>
    <header className="story-header">
      <div className="story-header-kicker"><SectionLabel>{story.kicker}</SectionLabel><span className="story-place">Filed from {story.place}</span></div>
      <h1>{story.title}</h1>
      <p className="story-dek">{story.dek}</p>
      <div className="story-byline"><span>Reported by <b>Global Brief desk</b></span><span>Source: <a href="#source">{story.source}</a></span><span>{story.published}</span><span>{story.readingTime}</span><a href="#source" className="original-link">Open source <ExternalLink size={13} /></a></div>
    </header>

    <section className="what-happened">
      <div className="summary-head"><SectionLabel tone="research">AI Research / What happened</SectionLabel><div className="explain-control"><span>Explain as</span>{(["Simple", "Student", "Expert"] as const).map(option => <button key={option} onClick={() => setLevel(option)} className={level === option ? "active" : ""}>{option}</button>)}</div></div>
      <div className="summary-grid"><div><p className="summary-lead">{level === "Simple" ? "A new set of decisions has brought an old problem back into focus. The immediate proposals are different, but the bigger issue is that plans have not kept up with how people live now." : level === "Expert" ? `${story.summary} The available record supports the central development while leaving the distributional effects and implementation sequence open to further evidence.` : story.summary}</p><p className="cached-note">Cached research · generated and cited · last checked for this demo edition</p></div><EvidenceLegend /></div>
      <div className="claims-list">{story.claims.map((claim, index) => <div className="claim-row" key={claim.text}><span className="claim-number">0{index + 1}</span><p>{claim.text}</p><EvidenceTag value={claim.evidence} sources={claim.sources} /></div>)}</div>
    </section>

    <section className="research-zone">
      <div className="zone-heading"><div><SectionLabel tone="research">AI Research</SectionLabel><h2>Open the story up.</h2><p>Five ways to understand what sits behind the headline. The writing above and below this line follows the sources listed.</p></div><span className="zone-stamp">RESEARCH / 01</span></div>
      <div ref={tabsRef} className="research-tabs" role="tablist" aria-label="Story research sections">{tabs.map(item => <button role="tab" aria-selected={tab === item} key={item} onClick={() => setTab(item)} className={tab === item ? "active" : ""}>{item}</button>)}<span className="tab-indicator" aria-hidden="true" style={{ transform: `translate3d(${tabIndicator.x}px, 0, 0) scaleX(${tabIndicator.w / 100})` }} /></div>
      <div key={tab} className="tab-panel-in"><ResearchPanel story={story} tab={tab} /></div>
    </section>

    <Discussion story={story} draft={draft} setDraft={setDraft} replying={replying} setReplying={setReplying} reacted={reacted} setReacted={setReacted} />
  </div>;
}

function ResearchPanel({ story, tab }: { story: Story; tab: string }) {
  if (tab === "Five Lenses") return <div className="lenses-grid">{story.lenses.map(lens => <article className="lens-card" key={lens.label}><span className="lens-num">{lens.label === "Global / India-specific" ? "05" : String(story.lenses.indexOf(lens) + 1).padStart(2, "0")}</span><h3>{lens.label}</h3><p>{lens.text}</p><div><span>Who is affected</span><strong>{lens.affected}</strong></div></article>)}</div>;
  if (tab === "Connections") return <div className="connections-panel"><div className="connection-map"><div className="map-center"><span>THE STORY</span><strong>{story.title}</strong></div><div className="orbit orbit-one"><span>people</span></div><div className="orbit orbit-two"><span>institutions</span></div><div className="orbit orbit-three"><span>place</span></div><div className="orbit orbit-four"><span>past events</span></div></div><div className="connection-note"><SectionLabel tone="research">Sourced connections</SectionLabel><h3>Not every link is a conclusion.</h3><p>This Phase 1 graph is a visual placeholder for sourced relationships. In the full edition, each node opens a short description and a verified source.</p><ul><li><b>People</b> — named actors and affected groups</li><li><b>Institutions</b> — agencies, schools, firms, courts</li><li><b>Events</b> — dated steps in the story’s lead-up</li></ul></div></div>;
  if (tab === "Perspectives") return <div className="perspectives-list">{story.perspectives.map((item, index) => <article key={item.outlet}><span className="perspective-number">0{index + 1}</span><div><div className="perspective-top"><h3>{item.outlet}</h3><span>{item.frame}</span></div><p>{item.note}</p></div><ExternalLink size={15} /></article>)}</div>;
  if (tab === "What might happen next") return <div className="scenario-grid">{story.scenarios.map(item => <article className="scenario-card" key={item.title}><div className="scenario-label">SPECULATION, NOT PREDICTION</div><h3>{item.title}</h3><p>{item.text}</p><div><span>What to watch</span><strong>{item.watch}</strong></div></article>)}</div>;
  return <div className="timeline-list">{story.timeline.map((item, index) => <article className="timeline-item" key={item.title}><div className="timeline-date">{item.date}</div><div className="timeline-dot"><span>{String(index + 1).padStart(2, "0")}</span></div><div className="timeline-copy"><h3>{item.title}</h3><p>{item.text}</p><a href="#source">{item.source} <ExternalLink size={12} /></a></div></article>)}</div>;
}

function EvidenceTag({ value, sources }: { value: Evidence; sources: string[] }) { return <button className={`evidence-tag ${evidenceClass[value]}`} title={`Sources: ${sources.join(", ")}`}><span />{value}<ChevronDown size={13} /></button>; }
function EvidenceLegend() { return <div className="evidence-legend"><span className="legend-title">Evidence strength</span><div><i className="confirmed" />Multiple sources</div><div><i className="single" />Single source</div><div><i className="disputed" />Disputed</div><div><i className="unverified" />Unverified</div></div>; }

function Discussion({ story, draft, setDraft, replying, setReplying, reacted, setReacted }: { story: Story; draft: string; setDraft: (value: string) => void; replying: boolean; setReplying: (value: boolean) => void; reacted: Record<string, "agree" | "disagree">; setReacted: Dispatch<SetStateAction<Record<string, "agree" | "disagree">>> }) {
  return <section className="discussion-zone"><div className="discussion-heading"><div><SectionLabel tone="discussion">Public Discussion by readers</SectionLabel><h2>Now, read the room.</h2><p>AI research above is generated and cited. Everything below is written by people.</p></div><div className="discussion-counts"><span><b>{story.posts.filter(p => p.type === "Opinion").length + 18}</b> opinions</span><span><b>{story.posts.filter(p => p.type === "Evidence-backed argument").length + 11}</b> evidence-backed</span></div></div><div className="discussion-actions"><span>Join in with your full name</span><Link href="/login" className="warm-button">Sign in to post <ArrowRight size={15} /></Link></div><div className="posts-list">{story.posts.map(post => <article className={`post ${post.reply ? "post-reply" : ""}`} key={post.id}><div className="avatar">{post.initials}</div><div className="post-content"><div className="post-meta"><b>{post.author}</b><span>{post.role}</span><span>{post.time}</span></div><div className={`post-type ${post.type === "Evidence-backed argument" ? "checked-type" : ""}`}>{post.type}{post.checked && <span><Check size={12} /> Source checked: supports the claim</span>}</div><p>{post.body}</p><div className="post-footer"><button onClick={() => setReacted(current => ({ ...current, [post.id]: "agree" }))} className={reacted[post.id] === "agree" ? "chosen" : ""}><ThumbsUp size={14} /> {post.agree + (reacted[post.id] === "agree" ? 1 : 0)}</button><button onClick={() => setReacted(current => ({ ...current, [post.id]: "disagree" }))} className={reacted[post.id] === "disagree" ? "chosen" : ""}><ThumbsDown size={14} /> {post.disagree + (reacted[post.id] === "disagree" ? 1 : 0)}</button><button onClick={() => setReplying(!replying)}><MessageCircle size={14} /> Reply</button><button className="report-button"><Flag size={13} /> Report</button></div></div></article>)}</div><div className="reply-box"><div className="avatar muted-avatar">GB</div><div className="reply-input-wrap"><textarea value={draft} onChange={event => setDraft(event.target.value)} placeholder="Have a source, question, or a different read?" /><div className="reply-bottom"><span><Quote size={13} /> Posts are moderated by people. Sources may be checked.</span><button onClick={() => { if (!draft) setReplying(true); else { setDraft(""); setReplying(false); } }}><Send size={14} /> {replying ? "Sign in to post" : "Preview post"}</button></div></div></div><p className="discussion-footer"><Plus size={13} /> Questions can receive one clearly labelled answer from this story’s stored research. No opinions from the AI.</p></section>;
}
