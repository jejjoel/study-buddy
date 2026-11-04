// app/lib/agenda-api.ts
// Akses tabel `agendas` di Supabase.
import { supabase } from "@/lib/supabase/client";
import type { Agenda } from "@/types/agenda";

type AgendaRow = {
  id: string;
  discussion_id: number | null;
  judul: string;
  kategori: string;
  tanggal: string; // "YYYY-MM-DD"
  jam_mulai: string; // "HH:MM:SS"
  jam_selesai: string; // "HH:MM:SS"
  kode_room: string | null;
  catatan: string | null;
};

const COLUMNS =
  "id, discussion_id, judul, kategori, tanggal, jam_mulai, jam_selesai, kode_room, catatan";

function fromRow(row: AgendaRow): Agenda {
  return {
    id: row.id,
    discussionId: row.discussion_id ?? undefined,
    judul: row.judul,
    kategori: row.kategori,
    tanggal: row.tanggal,
    jamMulai: row.jam_mulai.slice(0, 5),
    jamSelesai: row.jam_selesai.slice(0, 5),
    kodeRoom: row.kode_room ?? undefined,
    catatan: row.catatan ?? undefined,
  };
}

function toPayload(a: Agenda) {
  return {
    judul: a.judul,
    kategori: a.kategori,
    tanggal: a.tanggal,
    jam_mulai: a.jamMulai,
    jam_selesai: a.jamSelesai,
    kode_room: a.kodeRoom ?? null,
    catatan: a.catatan ?? null,
  };
}

export async function fetchAgendas(): Promise<Agenda[]> {
  const { data, error } = await supabase
    .from("agendas")
    .select(COLUMNS)
    .order("tanggal", { ascending: true })
    .order("jam_mulai", { ascending: true });

  if (error) throw error;
  return (data as AgendaRow[]).map(fromRow);
}

// user_id diisi otomatis oleh database (default auth.uid())
export async function createAgenda(agenda: Agenda): Promise<Agenda> {
  const { data, error } = await supabase
    .from("agendas")
    .insert(toPayload(agenda))
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return fromRow(data as AgendaRow);
}

export async function updateAgenda(agenda: Agenda): Promise<Agenda> {
  const { data, error } = await supabase
    .from("agendas")
    .update(toPayload(agenda))
    .eq("id", agenda.id)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return fromRow(data as AgendaRow);
}

export async function deleteAgenda(id: string): Promise<void> {
  const { error } = await supabase.from("agendas").delete().eq("id", id);
  if (error) throw error;
}
