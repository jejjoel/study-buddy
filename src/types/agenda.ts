export interface Agenda {
  id: string;
  judul: string;
  kategori: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  kodeRoom?: string;
  catatan?: string;
}
