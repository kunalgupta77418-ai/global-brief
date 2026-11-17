# Global Brief — 5-Minute Presentation Script & Contingency Plan

**Product:** Global Brief  
**Live URL:** [https://global-brief-jade.vercel.app](https://global-brief-jade.vercel.app)  
**Target Duration:** 5 minutes

---

## ⏱️ Minute-by-Minute Demo Flow

### 0:00 – 1:00: Problem & Philosophy
- **Action:** Open `https://global-brief-jade.vercel.app` on a clean browser.
- **Narrative:**
  > *"Modern news feeds optimize for urgency and emotional escalation. Global Brief is designed around a different premise: **News is the first draft; context is the second.** We don't take sides, we don't host clickbait, and we separate verified reporting from public opinion."*
- **Visuals:** Showcase the dark editorial newspaper aesthetic, typography, and live greeting strip.

### 1:00 – 2:00: Live Headline Feed & Exploration
- **Action:** Scroll to **"What has moved today"** (Live Headline Feed).
- **Narrative:**
  > *"Every 15 minutes, our serverless engine ingests verified reports from international and national outlets (BBC, NPR, Times of India, Al Jazeera). Each item contains the source, publication timestamp, and verified link."*
- **Click:** Select one of the stories (e.g. *The water question is no longer a summer story*).

### 2:00 – 3:30: The Intelligence Engine (Lenses, Timeline, & Evidence Tags)
- **Action:** On the Story page:
  1. Toggle **Explain as:** `Simple` ➔ `Student` ➔ `Expert`. Show how the text adapts to the reader's needs.
  2. Point out the **Evidence Tags**: *Confirmed by multiple sources*, *Single source*, *Disputed*, *Unverified*.
  3. Switch between tabs: **Timeline** (chronological verified milestones) and **Five Lenses** (Political, Economic, Social, Environmental, Global/India).
  4. Open **What might happen next**: Highlight the label *"Speculation, not prediction"*.

### 3:30 – 4:30: Live Research Brief (/analyse)
- **Action:** Navigate to **A New Brief** (`/analyse`).
- **Input:** Paste a real headline (e.g., *"India expanding semiconductor manufacturing ecosystem"*).
- **Execution:** Click **"Begin the brief"**.
- **Narrative:**
  > *"The engine moves through three stages: Finding sources, Building the timeline, and Checking the evidence. It structures raw information directly into our editorial framework."*

### 4:30 – 5:00: Public Discussion & Wrap-up
- **Action:** Show the bottom of the story page.
- **Key Takeaway:**
  > *"AI generates the neutral facts above the fold. Humans share perspectives below. That separation is what makes Global Brief a calm, dependable daily habit."*

---

## 🛡️ Contingency & Safety Plan (If Live Network / AI Fails)

| Scenario | What Happens | Immediate Action |
|---|---|---|
| **Slow or dropping Wi-Fi during presentation** | Feed or Gemini API call times out | The system automatically falls back to **cached local research** and pre-bundled stories in `client/src/data/news.ts`. |
| **API Rate Limit / Quota Exceeded (429)** | Server automatically retries with backoff | The UI cleanly informs the user: *"High demand right now, displaying cached research edition."* |
| **Guest is not signed in** | `/api/analyse` requires auth | The front page and all 5 complete story dossiers are open to read immediately without authentication. |
| **Complete Internet Blackout** | No connection to Vercel | Run `pnpm dev:static` locally from PowerShell (`http://localhost:3000`). All client routes, animations, and bundled stories function 100% offline. |
