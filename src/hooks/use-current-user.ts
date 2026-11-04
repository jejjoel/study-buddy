"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { DbUser } from "@/types/user";

/**
 * Mengambil baris tabel `users` milik akun yang sedang login.
 * Akun Supabase Auth dicocokkan ke tabel `users` lewat email.
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

      if (!user || !user.email) {
        if (!cancelled) setLoading(false);
        return;
      }

      // Karakter khusus LIKE di-escape supaya email dicocokkan apa adanya
      const emailPattern = user.email.replace(/[\\%_]/g, "\\$&");
      const { data, error: queryError } = await supabase
        .from("users")
        .select("id, name, avatar_url")
        .ilike("email", emailPattern)
        .limit(1)
        .maybeSingle();

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
