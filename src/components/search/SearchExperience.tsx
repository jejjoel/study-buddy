"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import ProfileDetail, {
  type ProfileDetailData,
} from "@/components/profile/ProfileDetail";
import { useCurrentUser } from "@/hooks/use-current-user";
import { supabase } from "@/lib/supabase/client";
import styles from "./SearchExperience.module.css";

type FilterKey = "semua" | "teman" | "mentor" | "topik";

type Person = {
  id: number;
  name: string;
  avatar: string;
  major: string;
  semester: string;
  faculty: string;
  university: string;
};

type DiscussionHit = {
  id: number;
  title: string;
  tag: string;
  hostName: string;
  startsAt: string;
};

type GroupHit = {
  id: number;
  name: string;
  avatarUrl: string;
};

const FALLBACK_AVATAR = "/images/figma/arya.png";
const RESULT_LIMIT = 30;
const DEBOUNCE_MS = 300;

// Data mentor rekomendasi (statis)
const mentor: ProfileDetailData = {
  name: "Frenki Herlambang",
  role: "Mentor Web & UI/UX Designer",
  avatar: "/images/figma/frenki.png",
  bio: "Full Stack Frontend Developer, five experiences in public entertainment and international Certificate",
  followers: "1500 Pengikut",
};

const mentorKeywords =
  "frenki herlambang ui/ux mentor web designer frontend developer";

const filters: { key: FilterKey; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "teman", label: "Teman" },
  { key: "mentor", label: "Mentor" },
  { key: "topik", label: "Topik" },
];

function str(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

function sanitizeForOr(value: string): string {
  return value.replace(/[\\%_*,()]/g, " ").replace(/\s+/g, " ").trim();
}

function toPerson(row: Record<string, unknown>): Person {
  const semester = str(row.semester);
  return {
    id: Number(row.id),
    name: str(row.name) || "Pengguna StudyBuddy",
    avatar: str(row.avatar_url) || FALLBACK_AVATAR,
    major: str(row.major) || str(row.prodi) || str(row.jurusan),
    semester: semester ? `Semester ${semester}` : "",
    faculty: str(row.faculty) || str(row.fakultas),
    university: str(row.university) || str(row.universitas),
  };
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function PersonAvatar({
  src,
  className,
}: {
  src: string;
  className: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={56}
      height={56}
      className={className}
      onError={(event) => {
        const img = event.currentTarget;
        if (!img.src.endsWith(FALLBACK_AVATAR)) img.src = FALLBACK_AVATAR;
      }}
    />
  );
}

export default function SearchExperience({
  onClose,
  enterOffset = 0,
}: {
  onClose?: () => void;
  enterOffset?: number;
}) {
  const { dbUser: me, loading: meLoading, error: meError } = useCurrentUser();

  const [activeTab, setActiveTab] = useState<FilterKey>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionHit[]>([]);
  const [groups, setGroups] = useState<GroupHit[]>([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState<number[]>([]);
  const [friendIds, setFriendIds] = useState<number[]>([]);
  const [searching, setSearching] = useState(true);
  const [notice, setNotice] = useState("");

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showMentorDetail, setShowMentorDetail] = useState(false);
  const [quickPerson, setQuickPerson] = useState<Person | null>(null);
  const [sheetClosing, setSheetClosing] = useState(false);
  const [closing, setClosing] = useState(false);

  const sheetCloseTimer = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeFallback = useRef<number | null>(null);
  const closeDone = useRef(false);
  const requestId = useRef(0);

  const meId = me?.id ?? null;

  /* ---------------- Daftar teman & grup milik saya ---------------- */

  useEffect(() => {
    if (meId === null) return;
    const myId: number = meId;
    let cancelled = false;

    async function loadUserData() {
      // Load Teman
      const { data: friendData } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", myId);

      // Load Grup tempat saya bergabung
      const { data: memberData } = await supabase
        .from("chat_group_members")
        .select("group_id")
        .eq("user_id", myId);

      if (cancelled) return;

      setFriendIds((friendData ?? []).map((row) => Number(row.friend_id)));
      setJoinedGroupIds((memberData ?? []).map((row) => Number(row.group_id)));
    }

    loadUserData();
    return () => {
      cancelled = true;
    };
  }, [meId]);

  /* ---------------- Pencarian (debounce, ke database) ---------------- */

  useEffect(() => {
    if (meId === null) return;
    const myId: number = meId;

    const rawTerm = searchQuery.trim();
    const currentRequest = ++requestId.current;
    const wantPeople = activeTab === "semua" || activeTab === "teman";
    const wantDiscussions = activeTab === "semua" || activeTab === "topik";

    async function run() {
      setSearching(true);

      // A. Cari pengguna lain berdasarkan nama
      let nextPeople: Person[] = [];
      if (wantPeople) {
        let query = supabase
          .from("users")
          .select("*")
          .neq("id", myId)
          .order("name", { ascending: true })
          .limit(RESULT_LIMIT);

        if (rawTerm) {
          query = query.ilike("name", `%${escapeLike(rawTerm)}%`);
        }

        const { data, error } = await query;
        if (!error) {
          nextPeople = (data ?? []).map((row) =>
            toPerson(row as Record<string, unknown>)
          );
        }
      }

      // B. Cari diskusi
      let nextDiscussions: DiscussionHit[] = [];
      if (wantDiscussions) {
        let query = supabase
          .from("discussions")
          .select("id, title, tag, host_name, starts_at")
          .gte("ends_at", new Date().toISOString())
          .order("starts_at", { ascending: true })
          .limit(RESULT_LIMIT);

        const orTerm = sanitizeForOr(rawTerm);
        if (orTerm) {
          query = query.or(
            `title.ilike.*${orTerm}*,tag.ilike.*${orTerm}*,description.ilike.*${orTerm}*`
          );
        }

        const { data, error } = await query;
        if (!error) {
          nextDiscussions = (data ?? []).map((row) => ({
            id: Number(row.id),
            title: str(row.title),
            tag: str(row.tag) || "Diskusi",
            hostName: str(row.host_name),
            startsAt: str(row.starts_at),
          }));
        }
      }

      // C. [TAMBAHAN] Cari grup dari chat_groups
      let nextGroups: GroupHit[] = [];
      if (activeTab === "semua" || activeTab === "topik") {
        let groupQuery = supabase
          .from("chat_groups")
          .select("id, name, avatar_url")
          .limit(RESULT_LIMIT);

        if (rawTerm) {
          groupQuery = groupQuery.ilike("name", `%${escapeLike(rawTerm)}%`);
        }

        const { data: groupData, error: groupErr } = await groupQuery;
        if (!groupErr) {
          nextGroups = (groupData ?? []).map((g) => ({
            id: Number(g.id),
            name: str(g.name),
            avatarUrl: str(g.avatar_url) || "/images/figma/ilham.png",
          }));
        }
      }

      if (currentRequest !== requestId.current) return;

      setPeople(nextPeople);
      setDiscussions(nextDiscussions);
      setGroups(nextGroups);
      setSearching(false);
    }

    const timer = window.setTimeout(run, rawTerm ? DEBOUNCE_MS : 0);
    return () => window.clearTimeout(timer);
  }, [searchQuery, activeTab, meId]);

  /* ---------------- Gabung Grup ---------------- */

  async function joinGroup(groupId: number) {
    if (meId === null || joinedGroupIds.includes(groupId)) return;

    setJoinedGroupIds((prev) => [...prev, groupId]);

    const { error } = await supabase
      .from("chat_group_members")
      .insert([{ group_id: groupId, user_id: meId }]);

    if (error) {
      console.error("Gagal bergabung ke grup:", error.message);
      setJoinedGroupIds((prev) => prev.filter((id) => id !== groupId));
      setNotice("Gagal bergabung ke grup. Coba lagi nanti.");
    } else {
      setNotice("Berhasil bergabung! Grup sudah tersedia di menu Chat.");
      setTimeout(() => setNotice(""), 3000);
    }
  }

  /* ---------------- Tambah / hapus teman ---------------- */

  function isFriend(personId: number) {
    return friendIds.includes(personId);
  }

  async function addFriend(person: Person) {
    if (meId === null || isFriend(person.id)) return;

    setNotice("");
    setFriendIds((prev) => [...prev, person.id]);

    const { error } = await supabase
      .from("friends")
      .insert([{ user_id: meId, friend_id: person.id }]);

    if (error) {
      console.error("Gagal menambah teman:", error.message);
      setFriendIds((prev) => prev.filter((id) => id !== person.id));
      setNotice("Gagal menambah teman. Coba lagi nanti.");
    }
  }

  async function removeFriend(person: Person) {
    if (meId === null || !isFriend(person.id)) return;

    setNotice("");
    setFriendIds((prev) => prev.filter((id) => id !== person.id));

    const { error } = await supabase
      .from("friends")
      .delete()
      .eq("user_id", meId)
      .eq("friend_id", person.id);

    if (error) {
      console.error("Gagal menghapus teman:", error.message);
      setFriendIds((prev) => [...prev, person.id]);
      setNotice("Gagal menghapus teman. Coba lagi nanti.");
    }
  }

  function toggleFriend(person: Person) {
    return isFriend(person.id) ? removeFriend(person) : addFriend(person);
  }

  /* ---------------- Animasi tutup panel ---------------- */

  function requestClose() {
    if (closing || !onClose) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }

    closeDone.current = false;
    setClosing(true);
    closeFallback.current = window.setTimeout(finishClose, 700);
  }

  function finishClose() {
    if (closeDone.current) return;
    closeDone.current = true;

    if (closeFallback.current !== null) {
      window.clearTimeout(closeFallback.current);
      closeFallback.current = null;
    }

    onClose?.();
  }

  useEffect(() => {
    return () => {
      if (closeFallback.current !== null) {
        window.clearTimeout(closeFallback.current);
        closeFallback.current = null;
      }
    };
  }, []);

  /* ---------------- Bottom sheet profil singkat ---------------- */

  function openSheet(person: Person) {
    setSheetClosing(false);
    setQuickPerson(person);
  }

  function closeSheet() {
    if (sheetCloseTimer.current !== null) return;

    setSheetClosing(true);
    sheetCloseTimer.current = window.setTimeout(() => {
      sheetCloseTimer.current = null;
      setQuickPerson(null);
      setSheetClosing(false);
    }, 240);
  }

  useEffect(() => {
    if (!quickPerson) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeSheet();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;

      if (sheetCloseTimer.current !== null) {
        window.clearTimeout(sheetCloseTimer.current);
        sheetCloseTimer.current = null;
      }
    };
  }, [quickPerson]);

  /* ---------------- Render ---------------- */

  const isEntering = enterOffset > 0 && !closing;

  const panelClass = `${styles.panel}${
    isEntering ? ` ${styles.panelEnter}` : ""
  }${closing ? ` ${styles.panelClosing}` : ""}`;

  const detailClass = `${styles.panel} ${styles.panelFade}`;

  const panelStyle = {
    "--enter-offset": `${enterOffset}px`,
  } as CSSProperties;

  if (selectedPerson) {
    return (
      <div className={detailClass}>
        <ProfileDetail
          variant="user"
          onBack={() => setSelectedPerson(null)}
          connected={isFriend(selectedPerson.id)}
          onToggleConnect={() => toggleFriend(selectedPerson)}
          data={{
            name: selectedPerson.name,
            role: selectedPerson.major || "Pengguna StudyBuddy",
            avatar: selectedPerson.avatar,
            bio: "Mari belajar dan berdiskusi bersama di StudyBuddy!",
            followers: "0 Pengikut",
            following: "0 Mengikuti",
            facultyTitle: selectedPerson.faculty || "StudyBuddy",
            facultySub: selectedPerson.major || "-",
          }}
        />
      </div>
    );
  }

  if (showMentorDetail) {
    return (
      <div className={detailClass}>
        <ProfileDetail
          variant="mentor"
          data={mentor}
          onBack={() => setShowMentorDetail(false)}
        />
      </div>
    );
  }

  const lowerQuery = searchQuery.trim().toLowerCase();
  const showMentor =
    (activeTab === "semua" || activeTab === "mentor") &&
    (!lowerQuery || mentorKeywords.includes(lowerQuery));

  const visiblePeople =
    activeTab === "semua" || activeTab === "teman" ? people : [];
  const visibleDiscussions =
    activeTab === "semua" || activeTab === "topik" ? discussions : [];
  const visibleGroups =
    activeTab === "semua" || activeTab === "topik" ? groups : [];

  const hasResults =
    showMentor ||
    visiblePeople.length > 0 ||
    visibleDiscussions.length > 0 ||
    visibleGroups.length > 0;

  const isLoading = meLoading || (meId !== null && searching);

  return (
    <div
      ref={panelRef}
      className={panelClass}
      style={panelStyle}
      onAnimationEnd={(event) => {
        if (closing && event.target === panelRef.current) finishClose();
      }}
    >
      {/* Top Bar */}
      <div className={styles.topBar}>
        {onClose ? (
          <button
            type="button"
            className={styles.backArrow}
            onClick={requestClose}
            aria-label="Kembali"
          >
            <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
              <path
                d="M10 2L2 10L10 18"
                stroke="#070707"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <a href="/home" className={styles.backArrow} aria-label="Kembali">
            <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
              <path
                d="M10 2L2 10L10 18"
                stroke="#070707"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        )}

        <div className={styles.searchBar}>
          <input
            type="search"
            placeholder="Cari teman, mentor, grup atau topik"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            autoFocus
          />

          <button
            type="button"
            className={styles.searchButton}
            aria-label="Cari"
          >
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
          </button>
        </div>
      </div>

      <div className={styles.panelBody}>
        {/* Filter Tabs */}
        <div className={styles.tabsRow}>
          <div className={styles.tabs}>
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={`${styles.tab}${
                  activeTab === filter.key ? ` ${styles.tabActive}` : ""
                }`}
                onClick={() => setActiveTab(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {meError && (
          <p className={styles.emptyText} style={{ color: "#d93025" }}>
            {meError} Pencarian teman dan topik belum bisa dipakai.
          </p>
        )}

        {notice && (
          <p className={styles.emptyText} style={{ color: "#0066cc", fontWeight: "bold" }}>
            {notice}
          </p>
        )}

        {isLoading && !hasResults ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>Mencari...</p>
          </div>
        ) : !hasResults ? (
          <div className={styles.empty}>
            <Image
              src="/images/figma/empty_illustration.png"
              alt="Data Tidak Ditemukan"
              width={180}
              height={180}
              className={styles.emptyImg}
            />
            <p className={styles.emptyText}>Data Tidak Ditemukan</p>
          </div>
        ) : (
          <div className={styles.list}>
            {/* Rekomendasi Mentor */}
            {showMentor && (
              <div
                className={styles.mentorCard}
                onClick={() => setShowMentorDetail(true)}
              >
                <Image
                  src={mentor.avatar}
                  alt={mentor.name}
                  width={60}
                  height={60}
                  className={styles.mentorAvatar}
                />
                <div className={styles.mentorInfo}>
                  <div className={styles.mentorTop}>
                    <h3 className={styles.mentorName}>{mentor.name}</h3>
                    <span className={styles.mentorRating}>★ 4.9</span>
                  </div>
                  <p className={styles.mentorRole}>Web &amp; UI/UX Designer</p>
                  <div className={styles.mentorBottom}>
                    <button
                      type="button"
                      className={styles.trialBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMentorDetail(true);
                      }}
                    >
                      Free Study Trial 3 days
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Hasil Grup Komunitas */}
            {visibleGroups.map((group) => (
              <div key={`group-${group.id}`} className={styles.card}>
                <div className={styles.cardLeft}>
                  <PersonAvatar src={group.avatarUrl} className={styles.avatar} />
                  <div className={styles.cardInfo}>
                    <h4 className={styles.name}>{group.name}</h4>
                    <p className={styles.major}>Grup Komunitas</p>
                  </div>
                </div>

                <div className={styles.cardRight}>
                  <button
                    type="button"
                    className={styles.addBtn}
                    onClick={() => joinGroup(group.id)}
                  >
                    {joinedGroupIds.includes(group.id) ? "Bergabung ✓" : "Gabung"}
                  </button>
                </div>
              </div>
            ))}

            {/* Hasil Pengguna / Teman */}
            {visiblePeople.map((person) => (
              <div
                key={`user-${person.id}`}
                className={styles.card}
                onClick={() => setSelectedPerson(person)}
              >
                <div className={styles.cardLeft}>
                  <PersonAvatar src={person.avatar} className={styles.avatar} />
                  <div className={styles.cardInfo}>
                    <h4 className={styles.name}>{person.name}</h4>
                    {person.major && (
                      <p className={styles.major}>{person.major}</p>
                    )}
                    {person.semester && (
                      <p className={styles.sem}>{person.semester}</p>
                    )}
                  </div>
                </div>

                <div className={styles.cardRight}>
                  {person.faculty && (
                    <span className={styles.category}>{person.faculty}</span>
                  )}

                  <button
                    type="button"
                    className={styles.addBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      openSheet(person);
                    }}
                  >
                    {isFriend(person.id) ? "Tersambung ✓" : "Tambah Teman"}
                  </button>
                </div>
              </div>
            ))}

            {/* Hasil Diskusi Topik */}
            {visibleDiscussions.map((item) => (
              <div
                key={`discussion-${item.id}`}
                className={styles.card}
                style={{ cursor: "default" }}
              >
                <div className={styles.cardLeft}>
                  <div className={styles.cardInfo}>
                    <h4 className={styles.name}>{item.title}</h4>
                    <p className={styles.major}>
                      {item.hostName ? `Host: ${item.hostName}` : "Diskusi"}
                    </p>
                    <p className={styles.sem}>{formatDate(item.startsAt)}</p>
                  </div>
                </div>

                <div className={styles.cardRight}>
                  <span className={styles.category}>{item.tag}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet - Profil singkat */}
      {quickPerson && (
        <div
          className={`${styles.overlay}${
            sheetClosing ? ` ${styles.overlayClosing}` : ""
          }`}
          onClick={closeSheet}
        >
          <div
            className={`${styles.sheet}${
              sheetClosing ? ` ${styles.sheetClosing}` : ""
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={`Profil singkat ${quickPerson.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <span className={styles.handle} aria-hidden="true" />

            <div className={styles.sheetBody}>
              <PersonAvatar
                src={quickPerson.avatar}
                className={styles.sheetAvatar}
              />
              <h3 className={styles.sheetName}>{quickPerson.name}</h3>
              <p className={styles.sheetBio}>
                {quickPerson.major
                  ? `${quickPerson.name} adalah mahasiswa ${quickPerson.major}.`
                  : "Mari belajar dan berdiskusi bersama di StudyBuddy!"}
              </p>

              <div className={styles.infoBox}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Universitas</span>
                  <span className={styles.infoValue}>
                    {quickPerson.university || "-"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Jurusan</span>
                  <span className={styles.infoValue}>
                    {quickPerson.major || "-"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Semester</span>
                  <span className={styles.infoValue}>
                    {quickPerson.semester.replace("Semester ", "") || "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.sheetActions}>
              <button
                type="button"
                className={styles.addFriendBtn}
                onClick={() => {
                  toggleFriend(quickPerson);
                  closeSheet();
                }}
              >
                {isFriend(quickPerson.id) ? "Tersambung ✓" : "Add Friend"}
              </button>

              <Link
                href="/chat"
                className={styles.chatBtn}
                aria-label="Kirim pesan"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}