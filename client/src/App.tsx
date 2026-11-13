import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import SiteShell from "./components/SiteShell";
import Home from "./pages/Home";
import StoryPage from "./pages/Story";
import Analyse from "./pages/Analyse";
import About from "./pages/About";
import LoginGateway from "./pages/LoginGateway";
import { AuthProvider, useSupabaseAuth } from "./lib/supabaseAuth";
import { lazy, Suspense } from "react";

const Landing = lazy(() => import("./pages/Landing"));

function LandingRoute() {
  return (
    <Suspense fallback={<div className="landing-loading">Loading the experience…</div>}>
      <Landing />
    </Suspense>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="auth-loading-screen" role="status">
        <span className="wordmark-mark" aria-hidden="true">
          <i />
          <i />
        </span>
        <p>Reading edition access…</p>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function RootRoute() {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="auth-loading-screen" role="status">
        <span className="wordmark-mark" aria-hidden="true">
          <i />
          <i />
        </span>
        <p>Reading edition access…</p>
      </div>
    );
  }

  if (user) {
    return <Redirect to="/front-page" />;
  }

  // First-time or logged-out visitor sees ONLY the Login Gateway
  return <LoginGateway initialMode="login" />;
}

function Router() {
  return (
    <Switch>
      {/* Root: Gateway for logged-out visitors, Redirect for logged-in readers */}
      <Route path="/" component={RootRoute} />

      {/* Direct auth links */}
      <Route path="/login">
        <LoginGateway initialMode="login" />
      </Route>
      <Route path="/signup">
        <LoginGateway initialMode="signup" />
      </Route>

      {/* Public Pages */}
      <Route path="/experience">
        <SiteShell>
          <LandingRoute />
        </SiteShell>
      </Route>
      <Route path="/about">
        <SiteShell>
          <About />
        </SiteShell>
      </Route>

      {/* Protected Pages (Route guarded) */}
      <Route path="/front-page">
        <ProtectedRoute>
          <SiteShell>
            <Home />
          </SiteShell>
        </ProtectedRoute>
      </Route>
      <Route path="/story/:id">
        <ProtectedRoute>
          <SiteShell>
            <StoryPage />
          </SiteShell>
        </ProtectedRoute>
      </Route>
      <Route path="/analyse">
        <ProtectedRoute>
          <SiteShell>
            <Analyse />
          </SiteShell>
        </ProtectedRoute>
      </Route>

      {/* 404 Pages */}
      <Route path="/404">
        <SiteShell>
          <NotFound />
        </SiteShell>
      </Route>
      <Route>
        <SiteShell>
          <NotFound />
        </SiteShell>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <AuthProvider>
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
