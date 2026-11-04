"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { fetchAgendas } from "@/lib/services/agenda";
import type { Agenda } from "@/types/agenda";
import { useCurrentUser } from "./useCurrentUser";

type DiscussionRow = {
  id: number;
  title: string;
  description: string | null;
  tag: string;
  category: string | null;
  host_id: number | null;
  host_name: string | null;
  host_role: string | null;
  starts_at: string;
  ends_at: string;
};

type Host = { name: string; avatar: string | null };

// Gabungan diskusi publik + agenda pribadi (dari halaman Jadwal), diurutkan per waktu mulai
type FeedItem =
  | { kind: "discussion"; start: number; data: DiscussionRow }
  | { kind: "agenda"; start: number; data: Agenda };

function agendaStart(a: Agenda) {
  return new Date(`${a.tanggal}T${a.jamMulai}:00`);
}

function agendaEnd(a: Agenda) {
  return new Date(`${a.tanggal}T${a.jamSelesai}:00`);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// schedules.scheduled_at bertipe `timestamp` (tanpa zona waktu), jadi dikirim
// sebagai jam lokal apa adanya: YYYY-MM-DDTHH:mm:ss
function toLocalTimestamp(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatClock(iso: string) {
  const date = new Date(iso);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export default function DiscussionSection() {
  const { dbUser } = useCurrentUser();

  const [discussions, setDiscussions] = useState<DiscussionRow[]>([]);
  const [hosts, setHosts] = useState<Map<number, Host>>(new Map());
  const [counts, setCounts] = useState<Map<number, number>>(new Map());
  const [joined, setJoined] = useState<Set<number>>(new Set());
  const [pending, setPending] = useState<Set<number>>(new Set());
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    // Hanya diskusi yang belum selesai
    const { data: rows, error: discussionError } = await supabase
      .from("discussions")
      .select(
        "id, title, description, tag, category, host_id, host_name, host_role, starts_at, ends_at"
      )
      .gte("ends_at", new Date().toISOString())
      .order("starts_at", { ascending: true });

    if (discussionError) {
      console.warn("Gagal memuat diskusi:", discussionError.message);
      setError("Diskusi belum bisa dimuat. Coba lagi nanti.");
      setLoading(false);
      return;
    }

    const list = (rows ?? []) as DiscussionRow[];
    setDiscussions(list);

    if (list.length > 0) {
      const discussionIds = list.map((item) => item.id);

      // Peserta: untuk hitung jumlah dan tahu mana yang sudah di-join
      const { data: participants } = await supabase
        .from("discussion_participants")
        .select("discussion_id, user_id")
        .in("discussion_id", discussionIds);

      const nextCounts = new Map<number, number>();
      (participants ?? []).forEach((p) => {
        nextCounts.set(p.discussion_id, (nextCounts.get(p.discussion_id) ?? 0) + 1);
      });
      setCounts(nextCounts);

      // Nama & foto host yang terdaftar sebagai user
      const hostIds = Array.from(
        new Set(list.map((item) => item.host_id).filter((id): id is number => id !== null))
      );
      if (hostIds.length > 0) {
        const { data: hostRows } = await supabase
          .from("users")
          .select("id, name, avatar_url")
          .in("id", hostIds);

        const nextHosts = new Map<number, Host>();
        (hostRows ?? []).forEach((h) => {
          nextHosts.set(h.id, { name: h.name, avatar: h.avatar_url || null });
        });
        setHosts(nextHosts);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Ambil agenda milik user dari Jadwal, hanya yang belum selesai
  useEffect(() => {
    let cancelled = false;

    fetchAgendas()
      .then((list) => {
        if (cancelled) return;
        const now = Date.now();
        setAgendas(list.filter((a) => agendaEnd(a).getTime() >= now));
      })
      .catch((err) => {
        console.warn("Gagal memuat jadwal:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const feed = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [
      ...discussions.map(
        (d): FeedItem => ({
          kind: "discussion",
          start: new Date(d.starts_at).getTime(),
          data: d,
        })
      ),
      ...agendas.map(
        (a): FeedItem => ({
          kind: "agenda",
          start: agendaStart(a).getTime(),
          data: a,
        })
      ),
    ];
    return items.sort((x, y) => x.start - y.start);
  }, [discussions, agendas]);

  // Tandai diskusi yang sudah di-join oleh user yang sedang login
  useEffect(() => {
    if (!dbUser) return;
    let cancelled = false;

    async function loadJoined() {
      const { data } = await supabase
        .from("discussion_participants")
        .select("discussion_id")
        .eq("user_id", dbUser!.id);

      if (!cancelled) {
        setJoined(new Set((data ?? []).map((row) => row.discussion_id)));
      }
    }

    loadJoined();
    return () => {
      cancelled = true;
    };
  }, [dbUser]);

  function setPendingFlag(id: number, on: boolean) {
    setPending((previous) => {
      const next = new Set(previous);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function adjustCount(id: number, delta: number) {
    setCounts((previous) => {
      const next = new Map(previous);
      next.set(id, Math.max(0, (next.get(id) ?? 0) + delta));
      return next;
    });
  }

  async function toggleJoin(discussionId: number) {
    if (!dbUser) {
      setError("Akun kamu belum terdaftar di tabel users, jadi belum bisa Join.");
      return;
    }
    if (pending.has(discussionId)) return;

    setError("");
    setPendingFlag(discussionId, true);

    const alreadyJoined = joined.has(discussionId);

    if (alreadyJoined) {
      const { error: leaveError } = await supabase
        .from("discussion_participants")
        .delete()
        .eq("discussion_id", discussionId)
        .eq("user_id", dbUser.id);

      if (leaveError) {
        setError(`Gagal keluar dari diskusi: ${leaveError.message}`);
      } else {
        setJoined((previous) => {
          const next = new Set(previous);
          next.delete(discussionId);
          return next;
        });
        adjustCount(discussionId, -1);

        // Hapus juga dari Jadwal user
        const { error: scheduleError } = await supabase
          .from("schedules")
          .delete()
          .eq("user_id", dbUser.id)
          .eq("discussion_id", discussionId);

        if (scheduleError) {
          setError(
            `Kamu sudah keluar, tapi jadwalnya belum terhapus: ${scheduleError.message}`
          );
        }
      }
    } else {
      const { error: joinError } = await supabase
        .from("discussion_participants")
        .insert({ discussion_id: discussionId, user_id: dbUser.id });

      // 23505 = sudah pernah join (unique), anggap berhasil
      if (joinError && joinError.code !== "23505") {
        setError(`Gagal join diskusi: ${joinError.message}`);
      } else {
        setJoined((previous) => new Set(previous).add(discussionId));
        if (!joinError) adjustCount(discussionId, 1);

        // Tambahkan ke Jadwal user
        const item = discussions.find((d) => d.id === discussionId);
        if (item) {
          const { error: scheduleError } = await supabase
            .from("schedules")
            .insert({
              user_id: dbUser.id,
              title: item.title,
              interest_field: item.category || item.tag,
              scheduled_at: toLocalTimestamp(item.starts_at),
              discussion_id: item.id,
            });

          // 23505 = jadwal sudah ada (unique), anggap berhasil
          if (scheduleError && scheduleError.code !== "23505") {
            setError(
              `Kamu sudah join, tapi gagal menambahkan ke Jadwal: ${scheduleError.message}`
            );
          }
        }
      }
    }

    setPendingFlag(discussionId, false);
  }

  return (
    <section className="discussion-section home-reveal">
      <div className="section-title-row">
        <h2>Up Coming Discussion</h2>
        <Link href="/rooms" className="text-link">
          Lihat semuanya ›
        </Link>
      </div>

      {loading ? (
        <div className="empty-state">Memuat diskusi...</div>
      ) : feed.length === 0 ? (
        <div className="empty-state">
          Belum ada diskusi yang akan datang.
        </div>
      ) : (
        <div className="discussion-list">
          {feed.map((entry) => {
            if (entry.kind === "agenda") {
              const a = entry.data;
              return (
                <article className="discussion-card" key={`agenda-${a.id}`}>
                  <div className="discussion-tags">
                    <span className="tag tag-blue">
                      ◷ {formatDate(`${a.tanggal}T${a.jamMulai}:00`)}
                    </span>
                    <span className="tag">{a.kategori}</span>
                  </div>

                  <h3>{a.judul}</h3>
                  {a.catatan && (
                    <p className="discussion-description">{a.catatan}</p>
                  )}

                  <div className="discussion-author">
                    <div className="author-avatar">🗓️</div>
                    <div className="author-info">
                      <strong>Jadwal kamu</strong>
                      {a.kodeRoom && <span>Code Room : {a.kodeRoom}</span>}
                    </div>
                    <Link href="/schedule" className="btn btn-primary join-button">
                      Lihat
                    </Link>
                  </div>

                  <div className="discussion-meta">
                    <span>
                      ◷ {a.jamMulai} - {a.jamSelesai}
                    </span>
                  </div>
                </article>
              );
            }

            const item = entry.data;
            const isJoined = joined.has(item.id);
            const host = item.host_id !== null ? hosts.get(item.host_id) : undefined;
            const hostName = item.host_name || host?.name || "Host StudyBuddy";

            return (
              <article className="discussion-card" key={item.id}>
                <div className="discussion-tags">
                  <span className="tag tag-blue">
                    ◷ {formatDate(item.starts_at)}
                  </span>
                  <span className="tag">{item.tag}</span>
                </div>

                <h3>{item.title}</h3>
                {item.description && (
                  <p className="discussion-description">{item.description}</p>
                )}

                <div className="discussion-author">
                  <div className="author-avatar">
                    {host?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={host.avatar}
                        alt={hostName}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      "👨🏻‍💻"
                    )}
                  </div>
                  <div className="author-info">
                    <strong>{hostName}</strong>
                    {item.host_role && <span>{item.host_role}</span>}
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary join-button"
                    disabled={pending.has(item.id)}
                    onClick={() => toggleJoin(item.id)}
                    aria-pressed={isJoined}
                  >
                    {pending.has(item.id)
                      ? "..."
                      : isJoined
                      ? "Joined ✓"
                      : "Join"}
                  </button>
                </div>

                <div className="discussion-meta">
                  <span>👥 {counts.get(item.id) ?? 0} peserta</span>
                  <span>
                    ◷ {formatClock(item.starts_at)} - {formatClock(item.ends_at)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {error && (
        <p style={{ margin: "10px 0 0", color: "#d93b3b", fontSize: 11 }}>
          {error}
        </p>
      )}
    </section>
  );
}
