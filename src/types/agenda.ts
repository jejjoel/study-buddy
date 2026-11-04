export interface Agenda {
  id: string;
  discussionId?: number;
  judul: string;
  kategori: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  kodeRoom?: string;
  catatan?: string;
}
