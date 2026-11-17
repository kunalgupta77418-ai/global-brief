import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "wouter";
import { SectionLabel } from "@/components/SiteShell";

export default function NotFound() {
  return (
    <div className="page-container not-found-page" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem 1rem" }}>
      <div style={{ maxWidth: "540px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: "1.5rem", color: "var(--color-accent, #d97706)" }}>
          <Compass size={40} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <SectionLabel tone="neutral">Edition Index / 404</SectionLabel>
        </div>
        <h1 style={{ fontSize: "2.5rem", fontFamily: "var(--font-serif, serif)", fontWeight: 700, margin: "0.5rem 0 1rem", letterSpacing: "-0.02em" }}>
          This page is off the record.
        </h1>
        <p style={{ fontSize: "1.05rem", opacity: 0.8, lineHeight: 1.6, marginBottom: "2rem" }}>
          The requested brief or dispatch could not be found. It may have been archived or the URL might be misfiled.
        </p>
        <div>
          <Link href="/front-page" className="warm-button" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem" }}>
            <ArrowLeft size={16} /> Return to the front page
          </Link>
        </div>
      </div>
    </div>
  );
}
