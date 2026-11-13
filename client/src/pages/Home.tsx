import { ArrowRight, ArrowUpRight, Bookmark, Clock3, ExternalLink, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { mostDiscussed, stories, topics } from "@/data/news";
import { RuleHeading, SectionLabel } from "@/components/SiteShell";
import { useState } from "react";
import { useSupabaseAuth } from "@/lib/supabaseAuth";

export default function Home() {
  const { user } = useSupabaseAuth();
  const [activeTopic, setActiveTopic] = useState("All stories");
  const filtered = activeTopic === "All stories" ? stories : stories.filter(story => story.topic === activeTopic);
  const lead = filtered[0] ?? stories[0];
  const secondary = filtered.slice(1, 3);

  const hour = new Date().getHours();
  const salutation = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return <div className="page-container home-page">
    <section className="front-intro">
      <div className="intro-copy">
        {user?.firstName && (
          <div className="editorial-greeting-strip" role="status">
            <span>{salutation}, <em>{user.firstName}</em>.</span>
          </div>
        )}
        <span className="eyebrow">THE USEFUL BIT / TODAY</span>
        <h1>News is the first draft.<br /><span>Context is the second.</span></h1>
        <p>Global Brief follows the thread behind a story — what led here, who is affected, and what the evidence can actually support.</p>
      </div>
      <div className="brief-entry">
        <div className="entry-top"><SectionLabel tone="research">Start a research brief</SectionLabel><span>For your next rabbit hole</span></div>
        <h3>Paste a link or headline.<br /><em>We’ll do the background work.</em></h3>
        <div className="entry-input"><input aria-label="Paste a link or headline" placeholder="https://… or type a headline" /><button aria-label="Analyse link" onClick={() => window.location.href = "/analyse"}><ArrowRight size={18} /></button></div>
        <p className="entry-note"><Sparkles size={13} /> In this edition, analysis is shown from cached demo research.</p>
      </div>
    </section>

    <div className="topic-bar">
      <span className="topic-caption">Browse the desk</span>
      {topics.map(topic => <button key={topic} className={activeTopic === topic ? "selected" : ""} onClick={() => setActiveTopic(topic)}>{topic}</button>)}
    </div>

    <section className="front-grid">
      <div className="front-lead">
        <SectionLabel>{lead.kicker}</SectionLabel>
        <Link href={`/story/${lead.id}`} className="lead-title">{lead.title}</Link>
        <p className="lead-dek">{lead.dek}</p>
        <div className="story-meta"><span>{lead.source}</span><span>{lead.published}</span><span>{lead.readingTime}</span></div>
        <div className="lead-summary"><span className="summary-kicker">WHAT HAPPENED</span><p>{lead.summary}</p><Link href={`/story/${lead.id}`} className="text-link">Read the brief <ArrowRight size={14} /></Link></div>
      </div>
      <aside className="front-rail">
        <RuleHeading eyebrow="On the record">A few things to keep in view</RuleHeading>
        <div className="rail-note"><span className="rail-number">01</span><div><h4>AI research is not opinion.</h4><p>It explains and cites. The discussion below each story is written by people.</p></div></div>
        <div className="rail-note"><span className="rail-number">02</span><div><h4>Evidence tags are literal.</h4><p>They reflect the sources found, not a model’s confidence.</p></div></div>
        <div className="rail-note"><span className="rail-number">03</span><div><h4>Uncertainty gets a label.</h4><p>“Could not verify” is a useful result, not a failure.</p></div></div>
        <Link href="/about" className="rail-link">See the editorial method <ArrowUpRight size={14} /></Link>
      </aside>
    </section>

    <section className="secondary-section">
      <RuleHeading eyebrow="Across the desk" action={<span className="quiet-note">Showing {filtered.length} stories</span>}>More context, in brief</RuleHeading>
      <div className="secondary-grid">
        {secondary.map((story, index) => <article className="brief-card" key={story.id}>
          <div className="card-index">0{index + 2}</div><SectionLabel>{story.kicker}</SectionLabel>
          <Link href={`/story/${story.id}`}><h3>{story.title}</h3></Link><p>{story.dek}</p>
          <div className="card-footer"><span>{story.source}</span><span>{story.readingTime}</span><Bookmark size={15} /></div>
        </article>)}
        <div className="brief-card feed-card"><div className="card-index">LIVE</div><SectionLabel>Headline feed</SectionLabel><h3>What has moved today</h3>
          <div className="feed-lines">{stories.slice(2, 5).map(story => <Link key={story.id} href={`/story/${story.id}`}><span>{story.topic}</span><strong>{story.title}</strong><small>{story.published}</small></Link>)}</div>
        </div>
      </div>
    </section>

    <section className="most-discussed">
      <div className="discussed-heading"><SectionLabel tone="discussion">Public discussion</SectionLabel><h2>Read the room.</h2><p>Three stories with the most thoughtful disagreement this week.</p></div>
      <div className="discussed-list">{mostDiscussed.map(item => <Link className="discussed-item" href={`/story/${item.id}`} key={item.id}><span>{item.label}</span><div><strong>{item.title}</strong><small><MessageCircle size={13} /> {item.count}</small></div><ArrowRight size={16} /></Link>)}</div>
    </section>

    <div className="home-footnote"><Clock3 size={14} /><span>Stories are seeded for this capstone edition. No full articles are stored here — only links, snippets, and our own explanations.</span><ExternalLink size={13} /></div>
  </div>;
}
