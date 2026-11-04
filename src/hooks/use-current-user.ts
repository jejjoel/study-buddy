"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { DbUser } from "@/types/user";

/**
 * Mengambil baris tabel `users` milik akun yang sedang login.
 * Akun Supabase Auth dicocokkan lewat `firebase_uid` (UUID Auth) atau `email`.
 */
export function useCurrentUser() {
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }

      // 1. Cari berdasarkan firebase_uid (UUID Supabase Auth)
      let { data, error: queryError } = await supabase
        .from("users")
        .select("id, name, avatar_url")
        .eq("firebase_uid", user.id)
        .limit(1)
        .maybeSingle();

      // 2. Fallback: cari berdasarkan email jika belum ketemu lewat firebase_uid
      if (!data && user.email) {
        const emailPattern = user.email.replace(/[\\%_]/g, "\\$&");
        const fallback = await supabase
          .from("users")
          .select("id, name, avatar_url")
          .ilike("email", emailPattern)
          .limit(1)
          .maybeSingle();

        data = fallback.data;
        queryError = fallback.error;
      }

      if (cancelled) return;

      if (queryError || !data) {
        setError("Akun kamu belum terdaftar di tabel users.");
      } else {
        setDbUser(data as DbUser);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { dbUser, loading, error };
}
