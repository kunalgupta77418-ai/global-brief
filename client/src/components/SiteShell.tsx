import { Link, useLocation } from "wouter";
import { ArrowUpRight, Menu, Search, X, LogOut } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSupabaseAuth } from "@/lib/supabaseAuth";

const navItems = [
  { href: "/experience", label: "The experience" },
  { href: "/front-page", label: "The front page" },
  { href: "/analyse", label: "Analyse a story" },
  { href: "/about", label: "About the brief" },
];
export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState({ x: 0, y: 0, w: 0 });
  const { user, isDemoMode, signOut } = useSupabaseAuth();

  // The opening masthead sequence plays once per browser session.
  const [intro] = useState(() => { try { return typeof window !== "undefined" && !window.sessionStorage.getItem("gb-intro"); } catch { return false; } });
  useEffect(() => { try { window.sessionStorage.setItem("gb-intro", "1"); } catch { /* storage unavailable */ } }, []);
  // A single underline slides between the navigation items.
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const active = nav.querySelector<HTMLElement>("a.active");
      setIndicator(active ? { x: active.offsetLeft, y: active.offsetTop + active.offsetHeight - 1, w: active.offsetWidth } : { x: 0, y: 0, w: 0 });
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [location, open]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className={`site-frame ${intro ? "gb-intro" : ""}`}>
      <motion.div key={location} className="route-sweep" aria-hidden="true" initial={reducedMotion ? false : { scaleX: 0, opacity: 1 }} animate={{ scaleX: 1, opacity: 0 }} transition={{ scaleX: { duration: .55, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: .3, delay: .5 } }} />
      <div className="demo-ribbon">
        <span>PHASE 1 / DEMO EDITION {isDemoMode ? "· DEMO AUTH" : ""}</span>
        <span>Seeded stories · {isDemoMode ? "Local memory auth" : "Supabase connected"}</span>
      </div>
      <header className="masthead-wrap">
        <div className="masthead-meta">
          <span>India / Global context</span>
          <span>Saturday, 07 November 2026</span>
          <span className="masthead-meta-right">Edition 01 · Reading is open</span>
        </div>
        <div className="masthead-main">
          <button className="mobile-nav-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href={user ? "/front-page" : "/experience"} className="wordmark" onClick={() => setOpen(false)}>
            <span className="wordmark-mark" aria-hidden="true"><i /><i /></span>
            <span className="wordmark-text"><b>GLOBAL</b><em>BRIEF</em></span>
          </Link>
          <div className="masthead-tagline">Beyond the headline:<br /><span>understand the story behind the story.</span></div>
          <div className="masthead-tools">
            <button className="icon-button" aria-label="Search (coming later)" onClick={() => alert("Search is part of the next edition.")}><Search size={17} /></button>
            {user ? (
              <div className="masthead-auth-user">
                <span className="masthead-user-greeting">Signed in as <b>{user.firstName}</b></span>
                <button type="button" onClick={handleSignOut} className="login-link masthead-signout-btn" aria-label="Sign out">
                  Sign out
                </button>
              </div>
            ) : (
              <Link href="/" className="login-link">Sign in <ArrowUpRight size={14} /></Link>
            )}
          </div>
        </div>
        <nav ref={navRef} className={`main-nav ${open ? "is-open" : ""}`} aria-label="Primary navigation">
          <span className="nav-indicator" aria-hidden="true" style={{ transform: `translate3d(${indicator.x}px, ${indicator.y}px, 0) scaleX(${indicator.w / 100})`, opacity: indicator.w ? 1 : 0 }} />
          {navItems.map(item => <Link key={item.href} href={item.href} className={location === item.href ? "active" : ""} onClick={() => setOpen(false)}>{item.label}</Link>)}
          <span className="nav-rule" />
          <span className="nav-note">Evidence before certainty</span>
        </nav>
      </header>
      <main className="site-main-transition"><AnimatePresence mode="wait" initial={false}><motion.div key={location} initial={reducedMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: reducedMotion ? 0 : .42, ease: [0.16, 1, 0.3, 1] }}>{children}</motion.div></AnimatePresence></main>
      <footer className="site-footer">
        <div className="footer-mark"><span className="wordmark-mark" aria-hidden="true"><i /><i /></span><span>GLOBAL BRIEF</span></div>
        <p>A second read for the news — built to show the context, not just the headline.</p>
        <div className="footer-links"><Link href="/about">How it works</Link><Link href="/front-page">Front page</Link><Link href="/experience">The experience</Link><span>Phase 1 / demo edition</span></div>
      </footer>
    </div>
  );
}

export function SectionLabel({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "research" | "discussion" }) {
  return <div className={`section-label ${tone}`}><span className="label-dot" />{children}</div>;
}

export function RuleHeading({ eyebrow, children, action }: { eyebrow: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <div className="rule-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{children}</h2></div>{action}</div>;
}
