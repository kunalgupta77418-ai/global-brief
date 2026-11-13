import React, { useState, useId } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, ShieldCheck, Check, Sparkles } from "lucide-react";
import QuietConstellation from "@/components/QuietConstellation";
import { useSupabaseAuth } from "@/lib/supabaseAuth";

const easeExpo = [0.16, 1, 0.3, 1] as const;

interface LoginGatewayProps {
  initialMode?: "login" | "signup";
}

function calculatePasswordStrength(pass: string): {
  score: number;
  label: string;
  colorClass: string;
} {
  if (!pass) return { score: 0, label: "", colorClass: "" };
  if (pass.length < 8) {
    return { score: 1, label: "Minimum 8 characters", colorClass: "text-[#c88577]" };
  }
  let strength = 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) strength += 1;
  if (/[0-9]/.test(pass)) strength += 1;
  if (/[^A-Za-z0-9]/.test(pass) || pass.length >= 12) strength += 1;

  if (strength === 2) return { score: 2, label: "Fair · Add numbers or mixed case", colorClass: "text-[#d9a441]" };
  if (strength === 3) return { score: 3, label: "Good · Strong password", colorClass: "text-[#93a8b7]" };
  return { score: 4, label: "Editorial grade · Excellent strength", colorClass: "text-[#8eac8c]" };
}

export default function LoginGateway({ initialMode = "login" }: LoginGatewayProps) {
  const [, navigate] = useLocation();
  const reducedMotion = useReducedMotion();
  const { user, isDemoMode, signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useSupabaseAuth();

  const [tab, setTab] = useState<"login" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successRedirecting, setSuccessRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const emailId = useId();
  const passwordId = useId();
  const nameId = useId();

  // If already logged in, redirect to front page
  React.useEffect(() => {
    if (user && !successRedirecting) {
      navigate("/front-page");
    }
  }, [user, successRedirecting, navigate]);

  const strength = calculatePasswordStrength(password);

  const handleTabChange = (nextTab: "login" | "signup") => {
    setTab(nextTab);
    setErrorMsg(null);
    setResetStatus(null);
  };

  const handleSuccessfulAuth = () => {
    setSuccessRedirecting(true);
    // 0.8s transition window for top amber line sweep & opening message
    window.setTimeout(() => {
      navigate("/front-page");
    }, 850);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResetStatus(null);

    if (tab === "signup") {
      if (!fullName.trim()) {
        setErrorMsg("Please enter your full real name.");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setErrorMsg("Please provide a valid email address.");
        return;
      }
      if (password.length < 8) {
        setErrorMsg("Password must contain at least 8 characters.");
        return;
      }

      setSubmitting(true);
      const res = await signUpWithEmail(fullName, email, password);
      setSubmitting(false);

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        handleSuccessfulAuth();
      }
    } else {
      if (!email.trim() || !email.includes("@")) {
        setErrorMsg("Please enter your email address.");
        return;
      }
      if (!password) {
        setErrorMsg("Please enter your password.");
        return;
      }

      setSubmitting(true);
      const res = await signInWithEmail(email, password);
      setSubmitting(false);

      if (res.error) {
        setErrorMsg(res.error);
      } else {
        handleSuccessfulAuth();
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    // Directly authenticate as Google user profile in local demo/app session
    const res = await signInWithGoogle();
    setSubmitting(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      handleSuccessfulAuth();
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes("@")) {
      setErrorMsg("Please provide a valid email for the reset instructions.");
      return;
    }
    setForgotSubmitting(true);
    const res = await resetPassword(forgotEmail);
    setForgotSubmitting(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setResetStatus(res.message || "A password reset link has been dispatched.");
      setShowForgotModal(false);
    }
  };

  return (
    <div className="gateway-container">
      {/* Top Sweep Line on Successful Login */}
      <motion.div
        className="gateway-success-sweep"
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: successRedirecting ? 1 : 0 }}
        transition={{ duration: 0.75, ease: easeExpo }}
      />

      {/* Masthead Strip */}
      <header className="gateway-masthead">
        <div className="gateway-masthead-inner">
          <div className="gateway-masthead-meta">
            <span>India / Global context</span>
            <span>Saturday, 07 November 2026</span>
            <span className="gateway-meta-edition">Edition 01 · Access Gate</span>
            {isDemoMode && (
              <span className="gateway-demo-badge" title="No Supabase environment variables detected; running local memory demo session.">
                Demo mode
              </span>
            )}
          </div>

          <div className="gateway-masthead-bar">
            <div className="wordmark">
              <span className="wordmark-mark" aria-hidden="true">
                <i />
                <i />
              </span>
              <span className="wordmark-text">
                <b>GLOBAL</b>
                <em>BRIEF</em>
              </span>
            </div>
            <div className="gateway-masthead-right">
              <Link href="/about" className="gateway-masthead-link">
                About the brief
              </Link>
              <Link href="/experience" className="gateway-masthead-link">
                Explore the experience <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Viewport Body */}
      <main className="gateway-main">
        <div className="gateway-body-inner">
          {/* Left Column (~60%): Editorial Statement & Background Constellation */}
          <section className="gateway-left">
            <QuietConstellation />

            <div className="gateway-editorial-copy">
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: easeExpo, delay: 0.1 }}
                className="gateway-eyebrow"
              >
                <span className="label-dot" />
                <span>Editorial Intelligence</span>
              </motion.div>

              <h1 className="gateway-headline" aria-label="Beyond the headline: understand the story behind the story.">
                <span className="gateway-line-mask">
                  <motion.span
                    className="gateway-line-inner"
                    initial={reducedMotion ? false : { y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.85, ease: easeExpo, delay: 0.2 }}
                  >
                    Beyond the headline:
                  </motion.span>
                </span>
                <span className="gateway-line-mask">
                  <motion.span
                    className="gateway-line-inner"
                    initial={reducedMotion ? false : { y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.85, ease: easeExpo, delay: 0.32 }}
                  >
                    understand the story
                  </motion.span>
                </span>
                <span className="gateway-line-mask">
                  <motion.span
                    className="gateway-line-inner gateway-headline-serif-em"
                    initial={reducedMotion ? false : { y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.85, ease: easeExpo, delay: 0.44 }}
                  >
                    behind the story.
                  </motion.span>
                </span>
              </h1>

              <motion.p
                className="gateway-supporting"
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, ease: easeExpo, delay: 0.55 }}
              >
                Sign in to trace the background of any news story, with sources.
              </motion.p>

              <motion.div
                className="gateway-editorial-proof"
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <div className="gateway-proof-item">
                  <span className="gateway-proof-number">01</span>
                  <span>Verified timelines & cross-checked source chains</span>
                </div>
                <div className="gateway-proof-item">
                  <span className="gateway-proof-number">02</span>
                  <span>Separation of sourced evidence from human discussion</span>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Right Column (~40%): Editorial Auth Card */}
          <section className="gateway-right">
            <motion.div
              className={`gateway-card ${successRedirecting ? "is-redirecting" : ""}`}
              initial={reducedMotion ? false : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, ease: easeExpo, delay: 0.25 }}
            >
              {/* Card Left Amber Border Accent */}
              <div className="gateway-card-amber-edge" aria-hidden="true" />

              {/* Successful login message takeover */}
              {successRedirecting ? (
                <div className="gateway-redirect-pane" role="status">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="gateway-redirect-content"
                  >
                    <span className="wordmark-mark" aria-hidden="true">
                      <i />
                      <i />
                    </span>
                    <h2>Opening your brief…</h2>
                    <p>Preparing edition dispatches and custom research tools.</p>
                  </motion.div>
                </div>
              ) : (
                <>
                  <div className="gateway-card-header">
                    <span className="gateway-card-label">Enter the brief</span>
                    <span className="gateway-edition-pill">Edition 01</span>
                  </div>

                  {/* Tabs: Sign in & Create account with sliding underline */}
                  <div className="gateway-tabs-wrap" role="tablist" aria-label="Authentication modes">
                    <button
                      type="button"
                      role="tab"
                      id="tab-signin"
                      aria-selected={tab === "login"}
                      aria-controls="panel-signin"
                      className={`gateway-tab-btn ${tab === "login" ? "is-active" : ""}`}
                      onClick={() => handleTabChange("login")}
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      role="tab"
                      id="tab-signup"
                      aria-selected={tab === "signup"}
                      aria-controls="panel-signup"
                      className={`gateway-tab-btn ${tab === "signup" ? "is-active" : ""}`}
                      onClick={() => handleTabChange("signup")}
                    >
                      Create account
                    </button>
                    {/* Sliding indicator */}
                    <motion.span
                      className="gateway-tab-slider"
                      layoutId="gateway-tab-slider"
                      transition={{ type: "spring", stiffness: 450, damping: 38 }}
                      style={{
                        left: tab === "login" ? "0%" : "50%",
                        width: "50%",
                      }}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Reset Password Feedback */}
                  {resetStatus && (
                    <div className="gateway-alert gateway-alert-info" role="status">
                      <Check size={14} />
                      <span>{resetStatus}</span>
                    </div>
                  )}

                  {/* Error Notification */}
                  {errorMsg && (
                    <div className="gateway-alert gateway-alert-error" role="alert" aria-live="polite">
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Form Container with crossfade and vertical shift */}
                  <form onSubmit={handleSubmit} noValidate className="gateway-form">
                    <AnimatePresence mode="wait" initial={false}>
                      {tab === "signup" ? (
                        <motion.div
                          key="signup-pane"
                          role="tabpanel"
                          id="panel-signup"
                          aria-labelledby="tab-signup"
                          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                          transition={{ duration: 0.35, ease: easeExpo }}
                          className="gateway-field-stack"
                        >
                          {/* Full Name */}
                          <div className="gateway-field">
                            <label htmlFor={nameId} className="gateway-field-label">
                              Full real name
                            </label>
                            <div className="gateway-input-wrap">
                              <input
                                id={nameId}
                                type="text"
                                required
                                placeholder="e.g. Ananya Rao"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="gateway-input"
                                autoComplete="name"
                              />
                              <span className="gateway-input-focus-line" aria-hidden="true" />
                            </div>
                            <span className="gateway-field-hint">
                              Your real name appears on discussion posts.
                            </span>
                          </div>

                          {/* Email */}
                          <div className="gateway-field">
                            <label htmlFor={emailId} className="gateway-field-label">
                              Email address
                            </label>
                            <div className="gateway-input-wrap">
                              <input
                                id={emailId}
                                type="email"
                                required
                                placeholder="name@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="gateway-input"
                                autoComplete="email"
                              />
                              <span className="gateway-input-focus-line" aria-hidden="true" />
                            </div>
                          </div>

                          {/* Password */}
                          <div className="gateway-field">
                            <label htmlFor={passwordId} className="gateway-field-label">
                              Password (minimum 8 characters)
                            </label>
                            <div className="gateway-input-wrap password-wrap">
                              <input
                                id={passwordId}
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Choose a secure password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="gateway-input"
                                autoComplete="new-password"
                              />
                              <button
                                type="button"
                                className="gateway-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                              >
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                              <span className="gateway-input-focus-line" aria-hidden="true" />
                            </div>

                            {/* Password strength indicator */}
                            {password.length > 0 && (
                              <div className="gateway-strength-meter">
                                <div className="gateway-strength-bars" aria-hidden="true">
                                  {[1, 2, 3, 4].map((level) => (
                                    <span
                                      key={level}
                                      className={`gateway-strength-bar ${
                                        strength.score >= level ? "is-filled" : ""
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className={`gateway-strength-label ${strength.colorClass}`}>
                                  {strength.label}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="login-pane"
                          role="tabpanel"
                          id="panel-signin"
                          aria-labelledby="tab-signin"
                          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                          transition={{ duration: 0.35, ease: easeExpo }}
                          className="gateway-field-stack"
                        >
                          {/* Email */}
                          <div className="gateway-field">
                            <label htmlFor={emailId} className="gateway-field-label">
                              Email address
                            </label>
                            <div className="gateway-input-wrap">
                              <input
                                id={emailId}
                                type="email"
                                required
                                placeholder="name@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="gateway-input"
                                autoComplete="email"
                              />
                              <span className="gateway-input-focus-line" aria-hidden="true" />
                            </div>
                          </div>

                          {/* Password */}
                          <div className="gateway-field">
                            <div className="gateway-field-header-row">
                              <label htmlFor={passwordId} className="gateway-field-label">
                                Password
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setForgotEmail(email);
                                  setShowForgotModal(true);
                                }}
                                className="gateway-forgot-btn"
                              >
                                Forgot password?
                              </button>
                            </div>
                            <div className="gateway-input-wrap password-wrap">
                              <input
                                id={passwordId}
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="gateway-input"
                                autoComplete="current-password"
                              />
                              <button
                                type="button"
                                className="gateway-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                              >
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                              <span className="gateway-input-focus-line" aria-hidden="true" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting || successRedirecting}
                      className="gateway-submit-btn"
                    >
                      {submitting ? (
                        <span>{tab === "signup" ? "Creating your account…" : "Signing you in…"}</span>
                      ) : (
                        <>
                          <span>{tab === "signup" ? "Create your account" : "Sign in to the brief"}</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>

                    <div className="gateway-or-divider" aria-hidden="true">
                      <span>or continue with</span>
                    </div>

                    {/* Google OAuth Button */}
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={submitting || successRedirecting}
                      className="gateway-google-btn"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </form>

                  {/* Editorial Note & Standards */}
                  <div className="gateway-footer-note">
                    <p>
                      Global Brief adheres to rigorous sourcing standards. Your full name is associated with contributed commentary.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </section>
        </div>
      </main>

      {/* Extended Informative Scrollable Sections with Scroll-Triggered Animation */}
      <section className="gateway-extended-editorial">
        <div className="gateway-extended-inner">
          <motion.div
            className="gateway-section-divider"
            initial={reducedMotion ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: easeExpo }}
          />
          
          <motion.div
            className="gateway-editorial-chapter"
            initial={reducedMotion ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: easeExpo }}
          >
            <span className="eyebrow">EDITORIAL MANIFESTO / CHAPTER I</span>
            <h2>Why the first draft of news is never enough.</h2>
            <p className="gateway-chapter-text">
              In an era of instant dispatches and cascading notifications, headlines capture the moment of disruption but rarely the structure of the event. Global Brief was built for readers who require depth before certainty. We trace legislative histories, budgetary trajectories, and institutional precedents so you can see the complete picture.
            </p>
          </motion.div>

          <motion.div
            className="gateway-feature-grid"
            initial={reducedMotion ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: easeExpo, staggerChildren: 0.15 }}
          >
            <div className="gateway-feature-card">
              <span className="gateway-feature-num">01</span>
              <h3>The Second Read</h3>
              <p>News is reported as events unfold. Global Brief connects the background — mapping government policies, court orders, and economic forces over time.</p>
            </div>
            <div className="gateway-feature-card">
              <span className="gateway-feature-num">02</span>
              <h3>Verified Source Trails</h3>
              <p>Every claim is tied to verifiable primary documents, official committee records, and institutional data without speculation or bias.</p>
            </div>
            <div className="gateway-feature-card">
              <span className="gateway-feature-num">03</span>
              <h3>Civic Discussion</h3>
              <p>Join a community of readers and domain experts where real names ensure thoughtful, evidence-grounded debate on matters of public consequence.</p>
            </div>
          </motion.div>

          <motion.div
            className="gateway-section-divider"
            initial={reducedMotion ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: easeExpo }}
          />

          <motion.div
            className="gateway-editorial-chapter"
            initial={reducedMotion ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: easeExpo }}
          >
            <span className="eyebrow">EDITORIAL MANIFESTO / CHAPTER II</span>
            <h2>Evidence before certainty.</h2>
            <p className="gateway-chapter-text">
              Our analysis distinguishes strictly between verified facts, ongoing inquiries, and unverified claims. When evidence is inconclusive, Global Brief explicitly reports &ldquo;Could not verify&rdquo; rather than speculating. Sign in to unlock full source breakdowns and interact with the editorial room.
            </p>
          </motion.div>

          <motion.div
            className="gateway-stats-row"
            initial={reducedMotion ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: easeExpo }}
          >
            <div className="gateway-stat-box">
              <strong>100%</strong>
              <span>Sourced & Cited Research</span>
            </div>
            <div className="gateway-stat-box">
              <strong>7+</strong>
              <span>Dated Timeline Sheets per Story</span>
            </div>
            <div className="gateway-stat-box">
              <strong>Real</strong>
              <span>Names in Discussion Rooms</span>
            </div>
          </motion.div>

          <motion.div
            className="gateway-bottom-cta"
            initial={reducedMotion ? false : { opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: easeExpo }}
          >
            <p>Ready to explore today&apos;s edition?</p>
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                const emailInput = document.getElementById(emailId);
                emailInput?.focus();
              }}
              className="gateway-submit-btn gateway-cta-pill"
            >
              Sign in to the brief <ArrowRight size={15} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Forgot Password Inline Modal / Drawer */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div
            className="gateway-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForgotModal(false)}
          >
            <motion.div
              className="gateway-modal-card"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="gateway-modal-top">
                <span className="gateway-card-label">Reset credentials</span>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="gateway-modal-close"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <h3>Request a password reset</h3>
              <p>
                Enter your email address and we will dispatch instructions to restore your account.
              </p>
              <form onSubmit={handleResetPasswordSubmit}>
                <div className="gateway-field">
                  <label className="gateway-field-label">Email address</label>
                  <div className="gateway-input-wrap">
                    <input
                      type="email"
                      required
                      placeholder="name@domain.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="gateway-input"
                    />
                    <span className="gateway-input-focus-line" aria-hidden="true" />
                  </div>
                </div>
                <div className="gateway-modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="gateway-cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="gateway-submit-btn gateway-modal-submit"
                  >
                    {forgotSubmitting ? "Dispatching…" : "Send reset link"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
