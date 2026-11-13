import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";
import { useSupabaseAuth } from "@/lib/supabaseAuth";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { user: supabaseUser, signOut: supabaseSignOut } = useSupabaseAuth();
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};

  const logout = useCallback(async () => {
    try {
      await supabaseSignOut();
    } catch (error: unknown) {
      throw error;
    }
  }, [supabaseSignOut]);

  const state = useMemo(() => {
    return {
      user: supabaseUser ?? null,
      loading: false,
      error: null,
      isAuthenticated: Boolean(supabaseUser),
    };
  }, [supabaseUser]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;

    if (redirectPath) {
      window.location.href = redirectPath;
    } else {
      startLogin();
    }
  }, [redirectOnUnauthenticated, redirectPath, state.user]);

  return {
    ...state,
    refresh: async () => {},
    logout,
  };
}
