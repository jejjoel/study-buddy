"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/room/Header";
import BottomNav from "@/components/room/BottomNav";
import RoomCard from "@/components/room/RoomCard";
import CreateRoomSheet from "@/components/room/CreateRoomSheet";
import type { Room } from "@/types/room";
import { useRoomCategories } from "@/hooks/use-room-categories";
import { useRoomList, useMe, createRoom, deleteRoom, roomErrorMessage } from "@/lib/services/room";
import "./room-server.css";

export default function RoomServerPage() {
  const router = useRouter();
  const { rooms: daftarRoom, loading: loadingRoom, error: errorRoom, refresh: refreshRoom } = useRoomList();
  const me = useMe();
  const daftarKategori = useRoomCategories();
  const [kataKunci, setKataKunci] = useState<string>("");
  const [kategoriDipilih, setKategoriDipilih] = useState<string>("");
  const [bukaDropdown, setBukaDropdown] = useState<boolean>(false);
  const [bukaSheetBuatRoom, setBukaSheetBuatRoom] = useState<boolean>(false);

  async function handleDeleteRoom(room: Room) {
    const pesan =
      room.peserta > 0
        ? `Hapus room "${room.nama}"? ${room.peserta} peserta yang sedang berada di dalam akan dikeluarkan.`
        : `Hapus room "${room.nama}"? Tindakan ini tidak bisa dibatalkan.`;
    if (!window.confirm(pesan)) return;

    try {
      await deleteRoom(room.id);
      await refreshRoom();
    } catch (err) {
      console.error("Gagal menghapus room:", err);
      alert(roomErrorMessage(err));
    }
  }

  async function handleCreateRoom(draft: Room) {
    try {
      // Kode room dibuat server; password di-hash di server
      const roomId = await createRoom({
        nama: draft.nama,
        kategori: draft.kategori,
        kapasitas: draft.kapasitas,
        password: draft.password,
      });
      setBukaSheetBuatRoom(false);
      // Langsung arahkan pengguna ke room baru yang dibuat
      router.push(`/rooms/${roomId}`);
    } catch (err) {
      console.error("Gagal membuat room:", err);
      alert(roomErrorMessage(err));
    }
  }

  // Filter daftar room berdasarkan pencarian (nama atau kode) dan kategori
  const roomTerfilter = useMemo(() => {
    return daftarRoom.filter((room) => {
      if (!room) return false;
      const nama = String(room.nama || (room as unknown as { title?: string })?.title || "").toLowerCase();
      const kode = String(room.kode || (room as unknown as { code?: string })?.code || "").toLowerCase();
      const kategori = String(room.kategori || (room as unknown as { category?: string })?.category || "").toLowerCase();

      const query = kataKunci.trim().toLowerCase();
      const cocokPencarian =
        !query ||
        nama.includes(query) ||
        kode.includes(query);

      const cocokKategori =
        !kategoriDipilih ||
        kategoriDipilih === "Semua" ||
        kategoriDipilih === "Semua Kategori" ||
        kategori === kategoriDipilih.toLowerCase();

      return cocokPencarian && cocokKategori;
    });
  }, [daftarRoom, kataKunci, kategoriDipilih]);

  return (
    <div className="room-server-shell min-h-screen bg-white flex flex-col relative">
      {/* Header Utama */}
      <Header />

      {/* Konten Halaman Room Server Responsif */}
      <main className="room-server-container w-full max-w-xl md:max-w-3xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col pb-28 sm:pb-32">
        {/* Baris Pencarian & Tombol Aksi */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 mt-2">
          {/* Kolom Pencarian */}
          <div
            style={{
              backgroundColor: "#f3f6fa",
              borderRadius: "9999px",
              padding: "4px 4px 4px 18px",
              minHeight: "48px",
              boxSizing: "border-box",
            }}
            className="flex-1 min-w-0 flex items-center shadow-inner"
          >
            <label
              htmlFor="input-pencarian-room"
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                border: 0,
              }}
            >
              Cari room berdasarkan nama atau kode
            </label>
            <input
              id="input-pencarian-room"
              type="search"
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              placeholder="Masukan nama atau kode room..."
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: "14px",
                color: "#26354b",
                minWidth: 0,
              }}
              className="placeholder:text-slate-400"
            />
            <button
              type="button"
              aria-label="Cari room"
              style={{
                width: "44px",
                height: "44px",
                minWidth: "44px",
                minHeight: "44px",
                borderRadius: "50%",
                backgroundColor: "#3688f5",
                color: "#ffffff",
                border: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
                transition: "background-color 0.15s ease, transform 0.1s ease",
              }}
              className="hover:bg-[#2474e5] active:scale-95 flex-shrink-0"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>

          {/* Kelompok Tombol Aksi: Dropdown Kategori & Buat Room */}
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-3 flex-shrink-0">
            {/* Dropdown Pill Biru "Pilih Kategori" */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setBukaDropdown((prev) => !prev)}
                aria-expanded={bukaDropdown}
                aria-haspopup="listbox"
                aria-label="Pilih kategori room"
                style={{
                  minHeight: "44px",
                  padding: "0 18px",
                  borderRadius: "9999px",
                  backgroundColor: "#3688f5",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "background-color 0.15s ease, transform 0.1s ease",
                }}
                className="hover:bg-[#2474e5] active:scale-95 shadow-sm"
              >
                <span>{kategoriDipilih || "Pilih Kategori"}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: bukaDropdown ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Menu Pop-up Pilihan Kategori dengan Fitur Hapus */}
              {bukaDropdown && (
                <>
                  <div
                    onClick={() => setBukaDropdown(false)}
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 20,
                    }}
                  />
                  <div
                    role="listbox"
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      zIndex: 30,
                      backgroundColor: "#ffffff",
                      border: "1px solid #d4e5ff",
                      borderRadius: "16px",
                      boxShadow: "0 10px 28px rgba(38, 53, 75, 0.14)",
                      minWidth: "200px",
                      padding: "6px 0",
                      maxHeight: "320px",
                      overflowY: "auto",
                    }}
                  >
                    {/* Opsi "Semua" */}
                    <button
                      type="button"
                      role="option"
                      aria-selected={!kategoriDipilih}
                      onClick={() => {
                        setKategoriDipilih("");
                        setBukaDropdown(false);
                      }}
                      style={{
                        width: "100%",
                        minHeight: "44px",
                        padding: "0 16px",
                        border: "none",
                        backgroundColor: !kategoriDipilih ? "#edf5ff" : "transparent",
                        color: !kategoriDipilih ? "#3688f5" : "#26354b",
                        fontWeight: !kategoriDipilih ? 700 : 500,
                        fontSize: "13px",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                      className="hover:bg-[#edf5ff] transition-colors"
                    >
                      Semua
                    </button>

                    {/* Daftar Kategori dengan Tombol Hapus */}
                    {daftarKategori.map((kat) => {
                      const terpilih = kategoriDipilih === kat;
                      return (
                        <div
                          key={kat}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            paddingRight: "8px",
                            backgroundColor: terpilih ? "#edf5ff" : "transparent",
                          }}
                          className="hover:bg-[#edf5ff] transition-colors"
                        >
                          <button
                            type="button"
                            role="option"
                            aria-selected={terpilih}
                            onClick={() => {
                              setKategoriDipilih(kat);
                              setBukaDropdown(false);
                            }}
                            style={{
                              flex: 1,
                              minHeight: "44px",
                              padding: "0 16px",
                              border: "none",
                              backgroundColor: "transparent",
                              color: terpilih ? "#3688f5" : "#26354b",
                              fontWeight: terpilih ? 700 : 500,
                              fontSize: "13px",
                              textAlign: "left",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {kat}
                          </button>

                          {/* Tombol Hapus (Ikon Tempat Sampah) */}
                          <button
                            type="button"
                            title={`Hapus kategori ${kat}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Kategori "${kat}" berasal dari room yang tersimpan dan tidak dapat dihapus secara terpisah.`);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              padding: "6px",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            className="hover:bg-red-100 transition-colors"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Pill Biru "Buat Room Belajar" */}
            <button
              type="button"
              aria-label="Buat Room Belajar"
              onClick={() => setBukaSheetBuatRoom(true)}
              style={{
                minHeight: "44px",
                padding: "0 18px",
                borderRadius: "9999px",
                backgroundColor: "#3688f5",
                color: "#ffffff",
                border: "none",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "background-color 0.15s ease, transform 0.1s ease",
              }}
              className="hover:bg-[#2474e5] active:scale-95 shadow-sm"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Buat Room Belajar</span>
            </button>
          </div>
        </div>

        {/* Daftar Kartu Room */}
        <section
          aria-label="Daftar Room Belajar"
          className="room-server-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mt-6"
        >
          {roomTerfilter.length > 0 ? (
            roomTerfilter.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isHost={Boolean(me && room.hostId && room.hostId === me.id)}
                onDelete={handleDeleteRoom}
              />
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "60px 16px",
                color: "#7c899b",
              }}
              className="col-span-full bg-slate-50 rounded-2xl border border-dashed border-slate-200"
            >
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {loadingRoom ? "Memuat room..." : errorRoom || "Room tidak ditemukan"}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Sheet Pembuatan Room Baru */}
      <CreateRoomSheet
        isOpen={bukaSheetBuatRoom}
        onClose={() => setBukaSheetBuatRoom(false)}
        onCreateRoom={handleCreateRoom}
      />

      {/* Navigasi Bawah */}
      <BottomNav />
    </div>
  );
}
