"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

/**
 * Pembatas untuk seluruh rute pada grup (app).
 */
export default function AuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    function toLogin() {
      setAllowed(false);
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }

    // Cek sesi saat halaman dibuka
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (session) setAllowed(true);
      else toLogin();
    });

    // Kalau user logout / sesi habis di tengah jalan, tendang ke login
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session) toLogin();
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (!allowed) return null; // atau ganti dengan spinner/loading

  return <>{children}</>;
}
