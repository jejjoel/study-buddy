// app/lib/room-api.ts
// Room Server berbasis Supabase: daftar room, buat/gabung/keluar room, peserta, dan chat.
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { Message } from "@/types/chat";
import type { Member, Room } from "@/types/room";

/* ------------------------------ Error ------------------------------ */

export function roomErrorMessage(err: unknown): string {
  const raw =
    err && typeof err === "object" && "message" in err
      ? String((err as { message: unknown }).message)
      : String(err ?? "");

  if (raw.includes("PASSWORD_SALAH")) return "Password room salah. Silakan coba lagi.";
  if (raw.includes("ROOM_PENUH")) return "Room penuh. Anda tidak dapat bergabung.";
  if (raw.includes("ROOM_NOT_FOUND")) return "Room tidak ditemukan atau sudah berakhir.";
  if (raw.includes("PASSWORD_INVALID")) return "Password hanya boleh berupa angka (maks. 12 digit).";
  if (raw.includes("KODE_HABIS")) return "Gagal membuat kode room. Coba lagi.";
  if (raw.includes("BUKAN_HOST")) return "Hanya pembuat room yang bisa menghapus room ini.";
  if (raw.includes("NOT_AUTHENTICATED")) return "Sesi login habis. Silakan login ulang.";
  return "Terjadi kesalahan. Coba lagi.";
}

/* ------------------------------ Identitas ------------------------------ */

export type Me = { id: string; nama: string };

/** User yang sedang login: id dari Supabase Auth, nama dari tabel users (fallback ke email). */
export function useMe(): Me | null {
  const { dbUser } = useCurrentUser();
  const [auth, setAuth] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled && data.user) {
        setAuth({ id: data.user.id, email: data.user.email ?? "" });
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => {
    if (!auth) return null;
    const nama = dbUser?.name || auth.email.split("@")[0] || "Pengguna";
    return { id: auth.id, nama };
  }, [auth, dbUser]);
}

/* ------------------------------ Room ------------------------------ */

type RoomListRow = {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  kapasitas: number;
  host_id: string | null;
  has_password: boolean;
  peserta: number;
};

const ROOM_COLUMNS = "id, kode, nama, kategori, kapasitas, host_id, has_password, peserta";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toRoom(r: RoomListRow): Room {
  return {
    id: r.id,
    kode: r.kode,
    nama: r.nama,
    kategori: r.kategori,
    peserta: r.peserta,
    kapasitas: r.kapasitas,
    password: null, // password tidak pernah dikirim ke client
    hasPassword: r.has_password,
    status: "live",
    hostId: r.host_id ?? "",
  };
}

export async function fetchRooms(): Promise<Room[]> {
  // Bersihkan room kosong & peserta basi (gagal pun tidak masalah)
  await supabase.rpc("study_cleanup_rooms");

  const { data, error } = await supabase
    .from("study_rooms_list")
    .select(ROOM_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as RoomListRow[]).map(toRoom);
}

export async function fetchRoom(idOrCode: string): Promise<Room | null> {
  const query = supabase.from("study_rooms_list").select(ROOM_COLUMNS);
  const { data, error } = await (UUID_RE.test(idOrCode)
    ? query.eq("id", idOrCode)
    : query.eq("kode", idOrCode)
  ).maybeSingle();

  if (error) throw error;
  return data ? toRoom(data as RoomListRow) : null;
}

export async function createRoom(input: {
  nama: string;
  kategori: string;
  kapasitas: number;
  password: string | null;
}): Promise<string> {
  const { data, error } = await supabase.rpc("study_create_room", {
    p_nama: input.nama,
    p_kategori: input.kategori,
    p_kapasitas: input.kapasitas,
    p_password: input.password,
  });
  if (error) throw error;
  return data as string;
}

export async function joinRoom(roomId: string, password: string | null, nama: string) {
  const { error } = await supabase.rpc("study_join_room", {
    p_room_id: roomId,
    p_password: password,
    p_nama: nama,
  });
  if (error) throw error;
}

/** true = masih tercatat sebagai peserta; false = room sudah dihapus / data peserta hilang. */
export async function heartbeatRoom(roomId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("study_room_heartbeat", { p_room_id: roomId });
  if (error) throw error;
  return data === true;
}

/** Hapus room secara manual (hanya host). Peserta dan chat ikut terhapus. */
export async function deleteRoom(roomId: string) {
  const { error } = await supabase.rpc("study_delete_room", { p_room_id: roomId });
  if (error) throw error;
}

export async function leaveRoom(roomId: string) {
  const { error } = await supabase.rpc("study_leave_room", { p_room_id: roomId });
  if (error) throw error;
}

/** Daftar room (polling 10 dtk + Realtime saat ada yang masuk/keluar). */
export function useRoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setRooms(await fetchRooms());
      setError("");
    } catch (err) {
      console.error("Gagal memuat room:", err);
      setError("Gagal memuat daftar room.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 10000);

    let debounce: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(debounce);
      debounce = setTimeout(refresh, 400);
    };

    const channel = supabase
      .channel("room-list")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "study_room_participants" }, schedule)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "study_room_participants" }, schedule)
      .subscribe();

    return () => {
      clearInterval(timer);
      clearTimeout(debounce);
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return { rooms, loading, error, refresh };
}

/** Satu room berdasarkan id (uuid) atau kode 4 digit. */
export function useRoomById(idOrCode: string | null) {
  const [state, setState] = useState<{ key: string | null; room: Room | null }>({
    key: null,
    room: null,
  });

  useEffect(() => {
    if (!idOrCode) return;
    let cancelled = false;
    fetchRoom(idOrCode)
      .then((room) => {
        if (!cancelled) setState({ key: idOrCode, room });
      })
      .catch((err) => {
        console.error("Gagal memuat room:", err);
        if (!cancelled) setState({ key: idOrCode, room: null });
      });
    return () => {
      cancelled = true;
    };
  }, [idOrCode]);

  const loading = Boolean(idOrCode) && state.key !== idOrCode;
  return { room: loading ? null : state.room, loading };
}

/* ------------------------------ Peserta ------------------------------ */

const AVATAR_COLORS = ["#3688F5", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4"];

function colorFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

type ParticipantRow = { user_id: string; nama: string };

function toMember(row: ParticipantRow): Member {
  return {
    id: row.user_id,
    nama: row.nama,
    inisial: row.nama[0]?.toUpperCase() || "?",
    warnaAvatar: colorFor(row.user_id),
    // Status mic/kamera/bicara orang lain belum dibagikan (butuh WebRTC)
    micOn: false,
    camOn: false,
    speaking: false,
  };
}

/** Peserta aktif satu room (Realtime + polling 10 dtk untuk membuang peserta yang sudah hilang). */
export function useRoomParticipants(roomId: string | null) {
  const [rows, setRows] = useState<ParticipantRow[]>([]);

  const refresh = useCallback(async () => {
    if (!roomId) return;
    const { data, error } = await supabase
      .from("study_room_active_participants")
      .select("user_id, nama")
      .eq("room_id", roomId)
      .order("joined_at", { ascending: true });
    if (!error && data) setRows(data as ParticipantRow[]);
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    refresh();
    const timer = setInterval(refresh, 10000);

    const channel = supabase
      .channel(`room-members-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "study_room_participants", filter: `room_id=eq.${roomId}` },
        refresh
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "study_room_participants", filter: `room_id=eq.${roomId}` },
        refresh
      )
      .subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, [roomId, refresh]);

  const members = useMemo(() => rows.map(toMember), [rows]);
  return { members, refresh };
}

/* ------------------------------ Chat ------------------------------ */

export type ChatMessage = Message & { createdAt: string };

type MessageRow = {
  id: string;
  sender_id: string;
  nama: string;
  isi: string;
  created_at: string;
};

const MESSAGE_COLUMNS = "id, sender_id, nama, isi, created_at";

function toMessage(row: MessageRow): ChatMessage {
  const d = new Date(row.created_at);
  const waktu = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return {
    id: row.id,
    pengirimId: row.sender_id,
    nama: row.nama,
    isi: row.isi,
    waktu,
    createdAt: row.created_at,
  };
}

function mergeMessages(prev: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const map = new Map(prev.map((m) => [m.id, m]));
  incoming.forEach((m) => map.set(m.id, m));
  return Array.from(map.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Chat room (aktifkan `enabled` setelah user berhasil join; RLS hanya mengizinkan peserta). */
export function useRoomMessages(roomId: string | null, enabled: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!roomId || !enabled) return;
    let cancelled = false;

    supabase
      .from("study_room_messages")
      .select(MESSAGE_COLUMNS)
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data }) => {
        if (!cancelled && data) {
          setMessages((prev) => mergeMessages(prev, (data as MessageRow[]).map(toMessage)));
        }
      });

    const channel = supabase
      .channel(`room-chat-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "study_room_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((prev) => mergeMessages(prev, [toMessage(payload.new as MessageRow)]));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [roomId, enabled]);

  const send = useCallback(
    async (isi: string, nama: string) => {
      if (!roomId) return;
      const { data, error } = await supabase
        .from("study_room_messages")
        .insert({ room_id: roomId, nama, isi })
        .select(MESSAGE_COLUMNS)
        .single();
      if (error) throw error;
      setMessages((prev) => mergeMessages(prev, [toMessage(data as MessageRow)]));
    },
    [roomId]
  );

  return { messages, send };
}
