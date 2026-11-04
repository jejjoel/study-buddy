
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/lib/supabase/client";
import styles from "./chat.module.css";

interface ChatItem {
  id: string;
  name: string;
  role: "teman" | "mentor" | "komunitas";
  avatar: string;
  isGroup?: boolean;
  lastMessage: string;
  slug: string;
}

const filters = [
  { key: "semua", label: "Semua" },
  { key: "teman", label: "Teman" },
  { key: "mentor", label: "Mentor" },
  { key: "komunitas", label: "Komunitas" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

const DEFAULT_AVATAR = "/images/figma/ilham.png";

export default function ChatPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<FilterKey>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [chatList, setChatList] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchChatData() {
      try {
        setLoading(true);
        setErrorMsg("");

        // Mengambil pengguna yang sedang login
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        // Mengambil ID pengguna dari tabel users
        const { data: me, error: meError } = await supabase
          .from("users")
          .select("id")
          .eq("firebase_uid", user.id)
          .maybeSingle();

        if (meError) throw meError;

        if (!me) {
          throw new Error(
            "Akun kamu belum terdaftar di tabel users."
          );
        }

        const myId = Number(me.id);

        // Mengambil daftar teman
        const { data: friendRows, error: friendError } =
          await supabase
            .from("friends")
            .select("friend_id")
            .eq("user_id", myId);

        if (friendError) throw friendError;

        // Mengambil pesan pribadi
        const { data: messageRows, error: messageError } =
          await supabase
            .from("chat_messages")
            .select("sender_id, receiver_id, text, created_at")
            .or(
              `sender_id.eq.${myId},receiver_id.eq.${myId}`
            )
            .order("created_at", { ascending: false })
            .limit(500);

        if (messageError) throw messageError;

        // Menyimpan pesan terakhir setiap teman
        const lastByPartner = new Map<
          number,
          { text: string; mine: boolean; at: string }
        >();

        (messageRows ?? []).forEach((row) => {
          const mine = Number(row.sender_id) === myId;
          const partnerId = Number(
            mine ? row.receiver_id : row.sender_id
          );

          if (
            !Number.isFinite(partnerId) ||
            partnerId === myId
          ) {
            return;
          }

          if (!lastByPartner.has(partnerId)) {
            lastByPartner.set(partnerId, {
              text: String(row.text ?? ""),
              mine,
              at: String(row.created_at ?? ""),
            });
          }
        });

        const friendIds = (friendRows ?? []).map((row) =>
          Number(row.friend_id)
        );

        const allIds = Array.from(
          new Set([
            ...friendIds,
            ...Array.from(lastByPartner.keys()),
          ])
        ).filter(
          (id) => Number.isFinite(id) && id !== myId
        );

        // Mengambil data teman beserta foto profil
        let loadedChats: {
          item: ChatItem;
          at: string;
        }[] = [];

        if (allIds.length > 0) {
          const { data: people, error: peopleError } =
            await supabase
              .from("users")
              .select(
                "id, name, avatar_url, major, semester"
              )
              .in("id", allIds);

          if (peopleError) throw peopleError;

          loadedChats = (people ?? []).map((person) => {
            const last = lastByPartner.get(Number(person.id));

            const item: ChatItem = {
              id: String(person.id),
              name: person.name || "Pengguna StudyBuddy",
              role: "teman",

              // Mengambil URL foto profil dari database
              avatar:
                typeof person.avatar_url === "string" &&
                person.avatar_url.trim() !== ""
                  ? person.avatar_url.trim()
                  : DEFAULT_AVATAR,

              isGroup: false,

              lastMessage: last
                ? `${last.mine ? "Kamu: " : ""}${last.text}`
                : person.major
                  ? `Jurusan: ${person.major}`
                  : "Teman StudyBuddy",

              slug: String(person.id),
            };

            return {
              item,
              at: last?.at ?? "",
            };
          });
        }

        // Mengambil daftar anggota grup
        const {
          data: groupMemberRows,
          error: groupMemberError,
        } = await supabase
          .from("chat_group_members")
          .select("group_id")
          .eq("user_id", myId);

        if (groupMemberError) throw groupMemberError;

        const groupIds = (groupMemberRows ?? []).map((row) =>
          Number(row.group_id)
        );

        let groupChats: {
          item: ChatItem;
          at: string;
        }[] = [];

        // Mengambil data grup
        if (groupIds.length > 0) {
          const { data: groupsData, error: groupsError } =
            await supabase
              .from("chat_groups")
              .select("id, name, avatar_url")
              .in("id", groupIds);

          if (groupsError) throw groupsError;

          // Mengambil pesan terakhir grup
          const {
            data: groupMsgRows,
            error: groupMessageError,
          } = await supabase
            .from("chat_messages")
            .select("group_id, text, created_at")
            .in("group_id", groupIds)
            .order("created_at", { ascending: false });

          if (groupMessageError) throw groupMessageError;

          const lastByGroup = new Map<
            number,
            { text: string; at: string }
          >();

          (groupMsgRows ?? []).forEach((row) => {
            const groupId = Number(row.group_id);

            if (
              Number.isFinite(groupId) &&
              !lastByGroup.has(groupId)
            ) {
              lastByGroup.set(groupId, {
                text: String(row.text ?? ""),
                at: String(row.created_at ?? ""),
              });
            }
          });

          groupChats = (groupsData ?? []).map((group) => {
            const last = lastByGroup.get(Number(group.id));

            const item: ChatItem = {
              id: `group-${group.id}`,
              name: group.name || "Grup StudyBuddy",
              role: "komunitas",
              avatar:
                group.avatar_url?.trim() || DEFAULT_AVATAR,
              isGroup: true,
              lastMessage: last
                ? last.text
                : "Grup baru dibuat",
              slug: `group-${group.id}`,
            };

            return {
              item,
              at: last?.at ?? "",
            };
          });
        }

        // Menggabungkan dan mengurutkan daftar chat
        const allLoadedChats = [
          ...loadedChats,
          ...groupChats,
        ];

        allLoadedChats.sort((a, b) => {
          if (a.at && b.at) {
            return b.at.localeCompare(a.at);
          }

          if (a.at) return -1;
          if (b.at) return 1;

          return a.item.name.localeCompare(b.item.name);
        });

        if (isMounted) {
          setChatList(
            allLoadedChats.map((entry) => entry.item)
          );
        }
      } catch (error) {
        console.error("Gagal mengambil daftar chat:", error);

        if (isMounted) {
          setErrorMsg(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan saat mengambil daftar chat."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchChatData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Filter dan pencarian
  const filteredChats = chatList.filter((item) => {
    if (
      activeTab !== "semua" &&
      item.role !== activeTab
    ) {
      return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      return (
        item.name.toLowerCase().includes(query) ||
        item.lastMessage.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Tampilan loading
  if (loading) {
    return (
      <main className={styles.screen}>
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
          }}
        >
          Memuat daftar chat...
        </div>
        <Navbar />
      </main>
    );
  }

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <div className={styles.logoWrap}>
          <Image
            src="/logo/study buddy 1.png"
            alt="Study Buddy"
            width={200}
            height={80}
            priority
            style={{
              width: "150px",
              height: "auto",
            }}
          />
        </div>
      </header>

      <div className={styles.body}>
        {/* Pencarian */}
        <div className={styles.searchBar}>
          <input
            type="search"
            placeholder="Cari berdasarkan nama..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className={styles.searchInput}
          />
        </div>

        {/* Filter */}
        <div className={styles.tabs}>
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={`${styles.tab} ${
                activeTab === filter.key
                  ? styles.tabActive
                  : ""
              }`}
              onClick={() =>
                setActiveTab(filter.key)
              }
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Pesan error */}
        {errorMsg && (
          <p className={styles.errorMessage}>
            {errorMsg}
          </p>
        )}

        {/* Daftar chat */}
        <div className={styles.list}>
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.slug}`}
                className={styles.chatItem}
              >
                <div className={styles.avatarWrap}>
                  {chat.isGroup ? (
                    <div className={styles.groupAvatar}>
                      👥
                    </div>
                  ) : (
                    <Image
                      src={chat.avatar}
                      alt={chat.name}
                      width={48}
                      height={48}
                      className={styles.avatarImg}
                      unoptimized
                      onError={(event) => {
                        event.currentTarget.src =
                          DEFAULT_AVATAR;
                      }}
                    />
                  )}
                </div>

                <div className={styles.chatContent}>
                  <h3 className={styles.chatName}>
                    {chat.name}
                  </h3>

                  <p className={styles.chatMessage}>
                    {chat.lastMessage}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            !errorMsg && (
              <p className={styles.emptyMessage}>
                {searchQuery
                  ? "Chat tidak ditemukan."
                  : "Belum ada teman atau grup chat."}
              </p>
            )
          )}
        </div>
      </div>

      <Navbar />
    </main>
  );
}
