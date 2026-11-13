import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient, type SupabaseClient, type User as SupabaseUser } from "@supabase/supabase-js";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  isDemo?: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  isDemoMode: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (fullName: string, email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "globalbrief_auth_session";

function extractFirstName(fullName: string, email: string): string {
  if (fullName && fullName.trim().length > 0) {
    const parts = fullName.trim().split(/\s+/);
    return parts[0];
  }
  const prefix = email.split("@")[0] || "Reader";
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

function mapSupabaseUser(user: SupabaseUser): AuthUser {
  const metadata = user.user_metadata || {};
  const fullName = (metadata.full_name || metadata.name || "").trim();
  const email = user.email || "";
  const firstName = extractFirstName(fullName, email);
  return {
    id: user.id,
    email,
    fullName: fullName || firstName,
    firstName,
    isDemo: false,
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let supabaseClient: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemoMode = !isSupabaseConfigured || !supabaseClient;

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      if (isDemoMode) {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored) as AuthUser;
            if (mounted) setUser(parsed);
          }
        } catch {
          // localStorage unavailable
        } finally {
          if (mounted) setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabaseClient!.auth.getSession();
        if (error) throw error;
        if (data?.session?.user && mounted) {
          setUser(mapSupabaseUser(data.session.user));
        }
      } catch (err) {
        console.error("Error reading initial Supabase session:", err);
      } finally {
        if (mounted) setLoading(false);
      }

      const { data: authListener } = supabaseClient!.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }

    initSession();

    return () => {
      mounted = false;
    };
  }, [isDemoMode]);

  const signInWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { error: "Please enter a valid email address." };
    }
    if (!password) {
      return { error: "Please enter your password." };
    }

    if (isDemoMode) {
      // In Demo Mode: Accept valid credentials or retrieve prior demo user
      try {
        let demoFullName = "Editorial Reader";
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as AuthUser;
          if (parsed.email === cleanEmail && parsed.fullName) {
            demoFullName = parsed.fullName;
          }
        } else {
          demoFullName = extractFirstName("", cleanEmail);
        }
        const demoUser: AuthUser = {
          id: `demo-${Date.now()}`,
          email: cleanEmail,
          fullName: demoFullName,
          firstName: extractFirstName(demoFullName, cleanEmail),
          isDemo: true,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
        setUser(demoUser);
        return {};
      } catch (e) {
        return { error: "Unable to save session locally." };
      }
    }

    try {
      const { data, error } = await supabaseClient!.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) {
        return { error: error.message };
      }
      if (data.user) {
        setUser(mapSupabaseUser(data.user));
      }
      return {};
    } catch (err: any) {
      return { error: err?.message || "Failed to sign in. Please check your credentials." };
    }
  };

  const signUpWithEmail = async (fullName: string, email: string, password: string): Promise<{ error?: string }> => {
    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      return { error: "Please provide your full real name." };
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { error: "Please enter a valid email address." };
    }
    if (!password || password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }

    if (isDemoMode) {
      try {
        const demoUser: AuthUser = {
          id: `demo-${Date.now()}`,
          email: cleanEmail,
          fullName: cleanName,
          firstName: extractFirstName(cleanName, cleanEmail),
          isDemo: true,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
        setUser(demoUser);
        return {};
      } catch (e) {
        return { error: "Unable to create local session in demo mode." };
      }
    }

    try {
      const { data, error } = await supabaseClient!.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });
      if (error) {
        return { error: error.message };
      }
      if (data.user) {
        setUser(mapSupabaseUser(data.user));
      }
      return {};
    } catch (err: any) {
      return { error: err?.message || "Sign-up failed. Please try again." };
    }
  };

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    if (isDemoMode) {
      const demoUser: AuthUser = {
        id: "google-auth-user",
        email: "reader.globalbrief@gmail.com",
        fullName: "Maya Sen",
        firstName: "Maya",
        isDemo: true,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
        setUser(demoUser);
        return {};
      } catch (e) {
        return { error: "Local session could not be saved." };
      }
    }

    try {
      const redirectUrl = `${window.location.origin}/front-page`;
      const { error } = await supabaseClient!.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err?.message || "Google sign-in could not be initiated." };
    }
  };

  const resetPassword = async (email: string): Promise<{ error?: string; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { error: "Please enter your email address to receive reset instructions." };
    }

    if (isDemoMode) {
      return { message: `Demo Mode: A reset dispatch would be sent to ${cleanEmail}.` };
    }

    try {
      const { error } = await supabaseClient!.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) return { error: error.message };
      return { message: `Password reset link sent to ${cleanEmail}.` };
    } catch (err: any) {
      return { error: err?.message || "Unable to send password reset email." };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      if (isDemoMode) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        await supabaseClient!.auth.signOut();
      }
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSupabaseAuth must be used within an AuthProvider");
  }
  return context;
}
