# Global Brief

> **News is the first draft. Context is the second.**

Global Brief is a high-craft, editorial intelligence platform designed to cut through sensationalism and breaking-news hysteria. By pairing serverless web extraction with Google Gemini AI models and Supabase Authentication, Global Brief provides readers with structured background briefs:
- **Calm, neutral summaries** at three comprehension tiers (Simple, Student, Expert)
- **Claim verification** with evidence tags (Confirmed by multiple sources, Single source, Disputed, Unverified)
- **Dated timelines** mapped to verified public records
- **Five editorial lenses** (Political, Economic, Social, Environmental, Global/India)
- **Future trajectories** explicitly tagged *"Speculation, not prediction"*

---

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Wouter, Framer Motion, GSAP, Lenis Smooth Scroll, Three.js
- **Backend:** Vercel Serverless Functions (`/api/feed`, `/api/analyse`) in TypeScript
- **AI Intelligence:** Google Gemini API (`gemini-2.5-flash`, `gemini-1.5-flash`) with structured schema generation and rate-limit backoff
- **Authentication:** Supabase Auth (Email & Password + Google OAuth)
- **Deployment:** Vercel Hobby Tier (`dist/public` SPA build)

---

## 🚀 Live Production URL

- **Production App:** [https://global-brief-jade.vercel.app](https://global-brief-jade.vercel.app)

---

## 💻 Local Setup & Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kunalgupta77418-ai/global-brief.git
   cd global-brief
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   GEMINI_API_KEY=<your-gemini-api-key>
   ```

4. **Run the local development server:**
   ```bash
   pnpm dev:static
   ```
   Open `http://localhost:3000` in your browser.

5. **Typecheck & Build:**
   ```bash
   pnpm check
   pnpm build:static
   ```
