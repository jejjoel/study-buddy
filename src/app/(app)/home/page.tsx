"use client";

import { useRef, useState, type FormEvent, type MouseEvent } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import SearchExperience from "@/components/search/SearchExperience";
import StorySection from "@/components/home/StorySection";
import DiscussionSection from "@/components/home/DiscussionSection";
import { supabase } from "@/lib/supabase/client";

export default function HomePage() {
  const [groups, setGroups] = useState<string[]>([]);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  /** Jarak search box Home ke posisi akhir top bar di view pencarian. */
  const [searchEnterOffset, setSearchEnterOffset] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  /**
   * Ukur posisi search box saat ditekan, supaya view pencarian bisa
   * menganimasikan search box ini "naik" ke atas (bukan pop-up baru).
   */
  function openSearch(event: MouseEvent<HTMLButtonElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const content = contentRef.current;

    if (content) {
      const contentRect = content.getBoundingClientRect();
      const paddingTop = parseFloat(getComputedStyle(content).paddingTop) || 0;
      // Jangan dibulatkan: selisih 0.5px saja terlihat sebagai "loncatan"
      // kecil saat search box mendarat kembali di posisinya.
      setSearchEnterOffset(
        Number((box.top - contentRect.top - paddingTop).toFixed(2))
      );
    }

    setShowSearch(true);
  }

async function createGroup(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const name = groupName.trim();
  if (!name) return;

  try {
    // 1. Ambil user yang sedang login
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      alert("Silakan login terlebih dahulu.");
      return;
    }

    // 2. Cari ID user di tabel `users` berdasarkan firebase_uid atau email
    let { data: me } = await supabase
      .from("users")
      .select("id")
      .eq("firebase_uid", user.id)
      .limit(1)
      .maybeSingle();

    if (!me && user.email) {
      const emailPattern = user.email.replace(/[\\%_]/g, "\\$&");
      const fallback = await supabase
        .from("users")
        .select("id")
        .ilike("email", emailPattern)
        .limit(1)
        .maybeSingle();
      me = fallback.data;
    }

    if (!me) {
      alert("Akun belum terdaftar di tabel users.");
      return;
    }

    // 3. Masukkan data grup baru ke tabel `chat_groups`
    const { data: newGroup, error: groupError } = await supabase
      .from("chat_groups")
      .insert([{ name: name, avatar_url: "/images/figma/ilham.png" }])
      .select()
      .single();

    if (groupError || !newGroup) {
      console.error("Gagal membuat grup:", groupError?.message);
      alert("Gagal membuat grup. Coba lagi.");
      return;
    }

    // 4. Masukkan pembuat grup sebagai anggota di tabel `chat_group_members`
    const { error: memberError } = await supabase
      .from("chat_group_members")
      .insert([{ group_id: newGroup.id, user_id: me.id }]);

    if (memberError) {
      console.error("Gagal menambahkan anggota grup:", memberError.message);
    }

    // 5. Perbarui state lokal, reset form, dan tutup modal
    setGroups((previous) => [...previous, name]);
    setGroupName("");
    setShowGroupForm(false);

    alert("Grup berhasil dibuat! Grup sekarang tersedia di halaman Chat.");
  } catch (err) {
    console.error("Terjadi kesalahan:", err);
  }
}

  return (
    <main className="app-shell">
      {/* Header dengan Logo & Tombol Aksi yang Diperbarui */}
      <header className="home-header">
        <a href="/home" className="brand home-brand flex items-center gap-2">
          <Image
            src="/images/logo study buddy 2.png"
            alt="Study Buddy Logo"
            width={86}
            height={70}
            className="object-contain"
          />
          <span>
            StudyBuddy
            <small>Belajar bersama, tumbuh bersama</small>
          </span>
        </a>

        <div className="header-actions flex items-center gap-2">
          {/* Tombol Buat Grup (Menggunakan gambar tambah grup.jpg) */}
          <button
            className="icon-button flex items-center justify-center"
            aria-label="Buat grup"
            onClick={() => setShowGroupForm(true)}
          >
            <Image
              src="/images/tambah grup.jpg"
              alt="Tambah Grup"
              width={22}
              height={22}
              className="object-contain"
            />
          </button>

          {/* Tombol Notifikasi */}
          <button
            className="icon-button flex items-center justify-center"
            aria-label="Notifikasi"
            onClick={() => alert("Belum ada notifikasi baru.")}
          >
            <Image
              src="/images/Notification.png"
              alt="Notifikasi"
              width={22}
              height={22}
              className="object-contain"
            />
          </button>
        </div>
      </header>

      <div className="home-content" ref={contentRef}>
        {showSearch ? (
          <SearchExperience
            enterOffset={searchEnterOffset}
            onClose={() => setShowSearch(false)}
          />
        ) : (
          <>
        <div className="greeting home-reveal">
          <h1>Halo, Sobat Belajar! 👋</h1>
          <p>Siap berkembang bersama hari ini?</p>
        </div>

        <button
          type="button"
          className="search-box"
          onClick={openSearch}
          aria-label="Cari teman atau mentor"
        >
          <span className="search-box-placeholder">
            Cari komunitas, teman dan topik...
          </span>
          <span className="search-submit" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M6.5 11C8.98528 11 11 8.98528 11 6.5C11 4.01472 8.98528 2 6.5 2C4.01472 2 2 4.01472 2 6.5C2 8.98528 4.01472 11 6.5 11Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 13L9.67 9.67"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        <StorySection />

        <DiscussionSection />

        <section className="add-section home-reveal">
          <button
            className="add-page-card"
            onClick={() => setShowGroupForm(true)}
          >
            <span className="add-circle">+</span>
            <strong>Tambah halaman sesuai keinginanmu</strong>
            <small>Buat ruang belajar baru bersama temanmu</small>
          </button>
        </section>

        {groups.length > 0 && (
          <section className="my-groups home-reveal">
            <h2>Grup Saya</h2>
            {groups.map((group, index) => (
              <div
                className="group-item"
                key={`${group}-${index}`}
              >
                <span>👥</span>
                <strong>{group}</strong>
                <span className="group-status">Grup dibuat</span>
              </div>
            ))}
          </section>
        )}
          </>
        )}
      </div>

      {showGroupForm && (
        <div className="modal-backdrop">
          <form className="group-modal" onSubmit={createGroup}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowGroupForm(false)}
              aria-label="Tutup"
            >
              ×
            </button>

            <div className="feature-icon">👥</div>
            <h2>Buat Grup Belajar</h2>
            <p>
              Buat ruang untuk belajar bersama teman-temanmu.
            </p>

            <label htmlFor="groupName">Nama grup</label>
            <input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Contoh: Belajar UI/UX"
              required
            />

            <button
              type="submit"
              className="btn btn-primary login-submit"
            >
              Buat Grup
            </button>
          </form>
        </div>
      )}

      <Navbar />
    </main>
  );
}
