"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  plan: "free" | "pro";
  usageCount: number;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshPlan: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  plan: "free",
  usageCount: 0,
  loading: true,
  signOut: async () => {},
  refreshPlan: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [plan, setPlan] = useState<"free" | "pro">("free");
  const [usageCount, setUsageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPlanAndUsage = async (userId: string) => {
    const month = new Date().toISOString().slice(0, 7);
    const [profileRes, usageRes] = await Promise.all([
      supabase.from("profiles").select("plan").eq("id", userId).single(),
      supabase
        .from("usage")
        .select("count")
        .eq("user_id", userId)
        .eq("month", month)
        .single(),
    ]);
    setPlan((profileRes.data?.plan ?? "free") as "free" | "pro");
    setUsageCount(usageRes.data?.count ?? 0);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchPlanAndUsage(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) fetchPlanAndUsage(session.user.id);
        else { setPlan("free"); setUsageCount(0); }
      }
    );
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshPlan = async () => {
    if (user) await fetchPlanAndUsage(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, plan, usageCount, loading, signOut, refreshPlan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
