"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase/client";
import styles from "./StorySection.module.css";

type StoryRow = {
  id: string;
  user_id: number;
  media_url: string;
  media_path: string;
  caption: string | null;
  created_at: string;
};

type StoryGroup = {
  userId: number;
  name: string;
  avatar: string | null;
  isMine: boolean;
  stories: StoryRow[];
};

const MAX_FILE_MB = 5;
const STORY_DURATION_MS = 5000;

function timeAgo(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  return `${hours} jam lalu`;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function StorySection() {
  const [userId, setUserId] = useState<number | null>(null);
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Viewer
  const [viewerGroup, setViewerGroup] = useState<number | null>(null);
  const [viewerIndex, setViewerIndex] = useState(0);

  const loadStories = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      setLoading(false);
      return;
    }

    // Cocokkan akun yang login (Supabase Auth) ke baris tabel `users` lewat email.
    // Karakter khusus LIKE di-escape supaya email dicocokkan apa adanya.
    const emailPattern = user.email.replace(/[\\%_]/g, "\\$&");
    const { data: me, error: meError } = await supabase
      .from("users")
      .select("id, name, avatar_url")
      .ilike("email", emailPattern)
      .limit(1)
      .maybeSingle();

    if (meError || !me) {
      console.error("Akun belum ada di tabel users:", meError?.message);
      setError(
        "Akun kamu belum terdaftar di tabel users, jadi Story belum bisa dipakai."
      );
      setLoading(false);
      return;
    }
    setUserId(me.id);

    // Hanya story yang belum expired (RLS juga memfilter ini)
    const { data: rows, error: storiesError } = await supabase
      .from("stories")
      .select("id, user_id, media_url, media_path, caption, created_at")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });

    if (storiesError) {
      console.error("Gagal memuat story:", storiesError.message);
      setLoading(false);
      return;
    }

    const storyRows = (rows ?? []) as StoryRow[];
    const ids = Array.from(new Set([...storyRows.map((r) => r.user_id), me.id]));

    const { data: people } = await supabase
      .from("users")
      .select("id, name, avatar_url")
      .in("id", ids);

    const profileMap = new Map<
      number,
      { name: string; avatar: string | null }
    >();
    (people ?? []).forEach((p) => {
      profileMap.set(p.id, {
        name: p.name || "Pengguna StudyBuddy",
        avatar: p.avatar_url || null,
      });
    });

    const byUser = new Map<number, StoryRow[]>();
    storyRows.forEach((row) => {
      byUser.set(row.user_id, [...(byUser.get(row.user_id) ?? []), row]);
    });

    const built: StoryGroup[] = Array.from(byUser.entries()).map(
      ([uid, list]) => ({
        userId: uid,
        name:
          uid === me.id
            ? "Story kamu"
            : profileMap.get(uid)?.name ?? "Pengguna StudyBuddy",
        avatar: profileMap.get(uid)?.avatar ?? null,
        isMine: uid === me.id,
        stories: list,
      })
    );

    // Story milik sendiri di depan, sisanya dari yang terbaru
    built.sort((a, b) => {
      if (a.isMine) return -1;
      if (b.isMine) return 1;
      const lastA = a.stories[a.stories.length - 1].created_at;
      const lastB = b.stories[b.stories.length - 1].created_at;
      return lastB.localeCompare(lastA);
    });

    setGroups(built);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  // Bersihkan object URL preview
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* ---------------- Upload ---------------- */

  function onPickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (userId === null) {
      setError("Akun kamu belum terdaftar di tabel users.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`Ukuran gambar maksimal ${MAX_FILE_MB} MB.`);
      return;
    }

    setError("");
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCaption("");
  }

  function cancelUpload() {
    if (uploading) return;
    setPendingFile(null);
    setPreviewUrl(null);
    setCaption("");
    setError("");
  }

  async function submitStory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pendingFile || !userId || uploading) return;

    setUploading(true);
    setError("");

    const ext = pendingFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("stories")
      .upload(path, pendingFile, {
        contentType: pendingFile.type,
        upsert: false,
      });

    if (uploadError) {
      setError(`Gagal mengunggah gambar: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: publicData } = supabase.storage
      .from("stories")
      .getPublicUrl(path);

    const { error: insertError } = await supabase.from("stories").insert({
      user_id: userId,
      media_url: publicData.publicUrl,
      media_path: path,
      caption: caption.trim() || null,
    });

    if (insertError) {
      // Rollback file supaya tidak jadi sampah di bucket
      await supabase.storage.from("stories").remove([path]);
      setError(`Gagal menyimpan story: ${insertError.message}`);
      setUploading(false);
      return;
    }

    setUploading(false);
    setPendingFile(null);
    setPreviewUrl(null);
    setCaption("");
    await loadStories();
  }

  /* ---------------- Viewer ---------------- */

  const activeGroup = viewerGroup !== null ? groups[viewerGroup] : null;
  const activeStory = activeGroup?.stories[viewerIndex] ?? null;

  function openViewer(groupIndex: number) {
    setViewerGroup(groupIndex);
    setViewerIndex(0);
  }

  const closeViewer = useCallback(() => {
    setViewerGroup(null);
    setViewerIndex(0);
  }, []);

  const goNext = useCallback(() => {
    if (viewerGroup === null) return;
    const group = groups[viewerGroup];
    if (!group) return;

    if (viewerIndex < group.stories.length - 1) {
      setViewerIndex(viewerIndex + 1);
    } else if (viewerGroup < groups.length - 1) {
      setViewerGroup(viewerGroup + 1);
      setViewerIndex(0);
    } else {
      closeViewer();
    }
  }, [viewerGroup, viewerIndex, groups, closeViewer]);

  function goPrev() {
    if (viewerGroup === null) return;
    if (viewerIndex > 0) {
      setViewerIndex(viewerIndex - 1);
    } else if (viewerGroup > 0) {
      const prev = groups[viewerGroup - 1];
      setViewerGroup(viewerGroup - 1);
      setViewerIndex(prev.stories.length - 1);
    }
  }

  // Auto-lanjut ke story berikutnya
  useEffect(() => {
    if (!activeStory) return;
    const timer = window.setTimeout(goNext, STORY_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [activeStory, goNext]);

  // Kunci scroll body & dukung tombol Esc saat viewer terbuka
  useEffect(() => {
    if (viewerGroup === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowRight") goNext();
    }
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [viewerGroup, closeViewer, goNext]);

  async function deleteStory(story: StoryRow) {
    if (!window.confirm("Hapus story ini?")) return;

    const { error: deleteError } = await supabase
      .from("stories")
      .delete()
      .eq("id", story.id);

    if (deleteError) {
      alert(`Gagal menghapus story: ${deleteError.message}`);
      return;
    }

    await supabase.storage.from("stories").remove([story.media_path]);
    closeViewer();
    await loadStories();
  }

  /* ---------------- Render ---------------- */

  return (
    <section className="story-section home-reveal">
      <div className="section-title-row">
        <h2>Story</h2>
        {groups.length > 4 && (
          <button
            type="button"
            className="text-link"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Ringkas ←" : "Lihat semua →"}
          </button>
        )}
      </div>

      <div className={expanded ? styles.listExpanded : "story-list"}>
        <button
          type="button"
          className="story-item"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Tambah story"
        >
          <span className="story-add">+</span>
          <span>Tambah</span>
        </button>

        {loading && <span className={styles.hint}>Memuat story...</span>}

        {!loading && groups.length === 0 && (
          <span className={styles.hint}>
            Belum ada story. Jadi yang pertama!
          </span>
        )}

        {groups.map((group, index) => (
          <button
            type="button"
            key={group.userId}
            className="story-item"
            onClick={() => openViewer(index)}
          >
            <span className={styles.avatarRing}>
              {group.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={group.avatar} alt={group.name} />
              ) : (
                <span className={styles.avatarFallback}>
                  {initials(group.name) || "?"}
                </span>
              )}
            </span>
            <span className={styles.name}>{group.name}</span>
          </button>
        ))}
      </div>

      {error && !pendingFile && <p className={styles.error}>{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onPickFile}
      />

      {/* Modal preview + caption sebelum upload */}
      {pendingFile && previewUrl && createPortal(
        <div className="modal-backdrop" onClick={cancelUpload}>
          <form
            className={styles.uploadModal}
            onClick={(event) => event.stopPropagation()}
            onSubmit={submitStory}
          >
            <h2>Tambah Story</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview story" className={styles.preview} />

            <label htmlFor="storyCaption">Caption (opsional)</label>
            <input
              id="storyCaption"
              value={caption}
              maxLength={120}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Lagi belajar apa hari ini?"
            />

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <button
                type="button"
                className="btn"
                onClick={cancelUpload}
                disabled={uploading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploading}
              >
                {uploading ? "Mengunggah..." : "Bagikan"}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Viewer fullscreen */}
      {activeGroup && activeStory && createPortal(
        <div className={styles.viewer} role="dialog" aria-modal="true">
          <div className={styles.progressRow}>
            {activeGroup.stories.map((story, index) => (
              <span key={story.id} className={styles.progressTrack}>
                <span
                  className={
                    index < viewerIndex
                      ? styles.progressDone
                      : index === viewerIndex
                      ? styles.progressActive
                      : styles.progressFill
                  }
                />
              </span>
            ))}
          </div>

          <div className={styles.viewerHeader}>
            <span className={styles.viewerAvatar}>
              {activeGroup.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeGroup.avatar} alt="" />
              ) : (
                initials(activeGroup.name) || "?"
              )}
            </span>
            <div>
              <strong>{activeGroup.name}</strong>
              <small>{timeAgo(activeStory.created_at)}</small>
            </div>
            {activeGroup.isMine && (
              <button
                type="button"
                className={styles.viewerButton}
                onClick={() => deleteStory(activeStory)}
                aria-label="Hapus story"
              >
                🗑
              </button>
            )}
            <button
              type="button"
              className={styles.viewerButton}
              onClick={closeViewer}
              aria-label="Tutup story"
            >
              ×
            </button>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={activeStory.id}
            src={activeStory.media_url}
            alt={activeStory.caption ?? "Story"}
            className={styles.viewerImage}
          />

          {activeStory.caption && (
            <p className={styles.viewerCaption}>{activeStory.caption}</p>
          )}

          <button
            type="button"
            className={styles.tapLeft}
            onClick={goPrev}
            aria-label="Story sebelumnya"
          />
          <button
            type="button"
            className={styles.tapRight}
            onClick={goNext}
            aria-label="Story berikutnya"
          />
        </div>,
        document.body
      )}
    </section>
  );
}
