export interface Room {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  peserta: number;
  kapasitas: number;
  password: string | null;
  hasPassword?: boolean;
  status: "live";
  hostId: string;
}

export interface Member {
  id: string;
  nama: string;
  inisial: string;
  warnaAvatar: string;
  warna?: string;
  micOn: boolean;
  camOn: boolean;
  speaking: boolean;
}
