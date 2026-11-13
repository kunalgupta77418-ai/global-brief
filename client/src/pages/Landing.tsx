import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { useEditorialMotion } from "@/hooks/useEditorialMotion";
import { HeadlineTicker } from "@/components/motionKit";
import { ConstellationSection, DiscussionPreviewSection, EvidenceSection, FinalSection, HeroSection, HowWorksSection, LensesSection, PrincipleSection, ProblemSection, TimelineDepthSection } from "@/components/LandingSections";

const sectionNames = ["Hero", "The problem", "How it works", "Connections", "Timeline", "Five lenses", "Evidence", "The principle", "Discussion", "Final CTA"];

export default function Landing() {
  const { reducedMotion, activeSection } = useEditorialMotion();
  useEffect(() => {
    document.documentElement.classList.toggle("motion-reduced", reducedMotion);
    return () => document.documentElement.classList.remove("motion-reduced");
  }, [reducedMotion]);
  return <div id="landing-page" className="landing-page">
    <div className="landing-progress-track" aria-hidden="true"><span data-scroll-progress /></div>
    <aside className="landing-section-index" aria-label="Landing page sections">{sectionNames.map((name, index) => <a href={`#landing-section-${index + 1}`} className={activeSection === index + 1 ? "is-active" : ""} key={name}><span>0{index + 1}</span><em>{name}</em></a>)}</aside>
    <div className="landing-topline"><span>SCROLL TO TRACE THE STORY</span><Link href="/front-page">Front page <ArrowUpRight size={13} /></Link></div>
    <div id="landing-section-1"><HeroSection /></div>
    <HeadlineTicker />
    <div id="landing-section-2"><ProblemSection /></div>
    <div id="landing-section-3"><HowWorksSection /></div>
    <div id="landing-section-4"><ConstellationSection /></div>
    <div id="landing-section-5"><TimelineDepthSection /></div>
    <div id="landing-section-6"><LensesSection /></div>
    <div id="landing-section-7"><EvidenceSection /></div>
    <div id="landing-section-8"><PrincipleSection /></div>
    <div id="landing-section-9"><DiscussionPreviewSection /></div>
    <div id="landing-section-10"><FinalSection /></div>
  </div>;
}
