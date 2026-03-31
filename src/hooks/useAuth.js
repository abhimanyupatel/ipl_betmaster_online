import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { ensureProfile, getMyProfile } from "../lib/api";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [message, setMessage] = useState("");

  const withTimeout = useCallback((promise, ms, label) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = window.setTimeout(() => {
        reject(new Error(`${label} timed out after ${ms}ms`));
      }, ms);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
      if (timeoutId) window.clearTimeout(timeoutId);
    });
  }, []);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      setProfileError("");
      return null;
    }

    setProfileLoading(true);
    setProfileError("");
    try {
      const row = await withTimeout(getMyProfile(userId), 10_000, "profile lookup");
      setProfile(row);
      return row;
    } catch (err) {
      console.error("Profile load failed:", err);
      setProfile(null);
      setProfileError(err?.message || "Could not load profile");
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, [withTimeout]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        setMessage("");
        const { data, error } = await withTimeout(
          supabase.auth.getSession(),
          10_000,
          "supabase.auth.getSession"
        );
        if (error) throw error;
        if (!mounted) return;

        const nextSession = data.session ?? null;
        setSession(nextSession);

        if (nextSession?.user?.id) {
          // Don't block auth gate UI on profile lookup.
          // `auth.profileLoading` / `auth.profileError` will reflect the real status.
          loadProfile(nextSession.user.id);
        } else {
          setProfile(null);
          setProfileError("");
        }
      } catch (err) {
        console.error("Auth bootstrap failed:", err);
        if (mounted) {
          setSession(null);
          setProfile(null);
          setProfileError("");
          setMessage(err?.message || "Could not load session. Please sign in again.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      try {
        setSession(nextSession ?? null);

        if (nextSession?.user?.id) {
          // Don't block the auth state change handler on profile lookup.
          loadProfile(nextSession.user.id);
        } else {
          setProfile(null);
          setProfileError("");
        }
      } catch (err) {
        console.error("Auth state change handler failed:", err);
        setSession(nextSession ?? null);
        setProfile(null);
        setProfileError("");
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [loadProfile]);

  const signInWithOtp = useCallback(async (email) => {
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) throw error;
    setMessage("Check your email for the login link.");
  }, []);

  const signInWithPassword = useCallback(async (email, password) => {
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const bootstrapProfile = useCallback(async ({ username, displayName }) => {
    setProfileLoading(true);
    try {
      const row = await ensureProfile({ username, displayName });
      const normalized = Array.isArray(row) ? row[0] : row;
      setProfile(normalized);
      return normalized;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  return useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      profileLoading,
      profileError,
      message,
      setMessage,
      signInWithOtp,
      signInWithPassword,
      signOut,
      bootstrapProfile,
      refreshProfile: () => loadProfile(session?.user?.id),
    }),
    [
      session,
      profile,
      loading,
      profileLoading,
      profileError,
      message,
      signInWithOtp,
      signInWithPassword,
      signOut,
      bootstrapProfile,
      loadProfile,
    ]
  );
}
