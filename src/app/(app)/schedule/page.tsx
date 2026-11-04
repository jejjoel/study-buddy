"use client";

import { useState, useMemo, useEffect, useSyncExternalStore, Suspense } from "react";
import Header from "@/components/room/Header";
import BottomNav from "@/components/room/BottomNav";
import AgendaSummaryCard from "@/components/schedule/AgendaSummaryCard";
import AgendaTabs, { type AgendaTab } from "@/components/schedule/AgendaTabs";
import AgendaCard from "@/components/schedule/AgendaCard";
import AgendaFormSheet from "@/components/schedule/AgendaFormSheet";
import type { Agenda } from "@/types/agenda";
import { isToday, isTomorrow } from "@/lib/utils/date";
import {
  fetchAgendas,
  createAgenda,
  updateAgenda,
  deleteAgenda,
} from "@/lib/services/agenda";
import { useCurrentUser } from "@/hooks/use-current-user";
import "./jadwal.css";

// Helper memformat tanggal hari ini dalam format kapital: "KAMIS, 4 OKT 2026"
function getFormattedToday(): string {
  try {
    const formatter = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return formatter.format(new Date()).toUpperCase();
  } catch {
    return "KAMIS, 4 OKT 2026";
  }
}

function subscribeDate() {
  return () => {};
}

function JadwalContent() {
  const { dbUser } = useCurrentUser();
  const [daftarAgenda, setDaftarAgenda] = useState<Agenda[]>([]);
  const [loadingAgenda, setLoadingAgenda] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeTab, setActiveTab] = useState<AgendaTab>("Semua");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [agendaToEdit, setAgendaToEdit] = useState<Agenda | null>(null);

  // Ambil agenda milik user dari Supabase saat halaman dibuka
  useEffect(() => {
    let cancelled = false;
    fetchAgendas()
      .then((data) => {
        if (!cancelled) setDaftarAgenda(data);
      })
      .catch((err) => {
        console.error("Gagal memuat agenda:", err);
        if (!cancelled) setLoadError("Gagal memuat jadwal. Coba muat ulang halaman.");
      })
      .finally(() => {
        if (!cancelled) setLoadingAgenda(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Gunakan useSyncExternalStore: mengembalikan nilai server yang stabil saat prerender, dan tanggal client setelah hidrasi
  const tanggalHariIni = useSyncExternalStore(
    subscribeDate,
    getFormattedToday,
    () => "KAMIS, 4 OKT 2026"
  );

  // Hitung jumlah kegiatan hari ini untuk kartu ringkasan
  const jumlahHariIni = useMemo(() => {
    return daftarAgenda.filter((item) => isToday(item.tanggal)).length;
  }, [daftarAgenda]);

  // Urutkan agenda berdasarkan tanggal (ASC) kemudian jam mulai (ASC)
  const agendaTerurut = useMemo(() => {
    return [...daftarAgenda].sort((a, b) => {
      const dateCompare = a.tanggal.localeCompare(b.tanggal);
      if (dateCompare !== 0) return dateCompare;
      return a.jamMulai.localeCompare(b.jamMulai);
    });
  }, [daftarAgenda]);

  // Filter agenda berdasarkan tab yang aktif ("Semua" / "Hari Ini" / "Besok")
  const agendaDitampilkan = useMemo(() => {
    if (activeTab === "Hari Ini") {
      return agendaTerurut.filter((item) => isToday(item.tanggal));
    }
    if (activeTab === "Besok") {
      return agendaTerurut.filter((item) => isTomorrow(item.tanggal));
    }
    return agendaTerurut;
  }, [agendaTerurut, activeTab]);

  function handleOpenCreateForm() {
    setAgendaToEdit(null);
    setIsFormOpen(true);
  }

  function handleEditAgenda(agenda: Agenda) {
    setAgendaToEdit(agenda);
    setIsFormOpen(true);
  }

  async function handleSaveAgenda(agenda: Agenda) {
    const exists = daftarAgenda.some((item) => item.id === agenda.id);
    try {
      if (exists) {
        const saved = await updateAgenda(agenda);
        setDaftarAgenda((prev) =>
          prev.map((item) => (item.id === saved.id ? saved : item))
        );
      } else {
        const saved = await createAgenda(agenda);
        setDaftarAgenda((prev) => [saved, ...prev]);
      }
    } catch (err) {
      console.error("Gagal menyimpan agenda:", err);
      alert("Gagal menyimpan jadwal. Coba lagi.");
    }
  }

  async function handleDeleteAgenda(id: string) {
    try {
      await deleteAgenda(id);
      setDaftarAgenda((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Gagal menghapus agenda:", err);
      alert("Gagal menghapus jadwal. Coba lagi.");
    }
  }

  return (
    <div className="jadwal-page-shell min-h-screen bg-white flex flex-col relative">
      {/* Header Utama dengan logo StudyBuddy */}
      <Header />

      {/* Konten Halaman Jadwal Responsif (Mobile: ~600px, Tablet: ~768px, Laptop/Desktop: max-w-6xl) */}
      <main className="jadwal-container w-full max-w-xl md:max-w-3xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col pb-24 sm:pb-28">
        {/* Tanggal Hari Ini & Sapaan Pengguna + Tombol Aksi */}
        <section
          aria-label="Sapaan Pengguna"
          className="mb-4 sm:mb-5 flex flex-row items-center justify-between gap-3"
        >
          <div>
            <p
              style={{
                color: "#8c9fb5",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                margin: "0 0 4px",
              }}
              className="text-xs sm:text-sm font-bold"
            >
              {tanggalHariIni}
            </p>
            <h1
              style={{
                color: "#26354b",
                margin: 0,
                letterSpacing: "-0.4px",
              }}
              className="text-xl sm:text-2xl md:text-3xl font-extrabold"
            >
              Hallo{dbUser?.name ? ` ${dbUser.name}` : ""} 👋
            </h1>
          </div>

          {/* Tombol Buat Jadwal */}
          <button
            type="button"
            onClick={handleOpenCreateForm}
            aria-label="Buat Jadwal Baru"
            style={{
              backgroundColor: "#3688f5",
              color: "#ffffff",
              border: "none",
              borderRadius: "9999px",
              padding: "10px 20px",
              minHeight: "42px",
              boxShadow: "0 4px 14px rgba(54, 136, 245, 0.3)",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background-color 0.15s ease, transform 0.1s ease",
            }}
            className="inline-flex hover:bg-[#2573e0] active:scale-95 shadow-sm flex-shrink-0"
          >
            <span>Buat Jadwal +</span>
          </button>
        </section>

        {/* Kartu Ringkasan Biru Bergradasi di Atas */}
        <section aria-label="Ringkasan Agenda" className="w-full">
          <AgendaSummaryCard jumlahHariIni={jumlahHariIni} />
        </section>

        {/* Tab Pill Filter: Semua, Hari Ini, Besok */}
        <section aria-label="Filter Waktu Agenda" className="w-full">
          <AgendaTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </section>

        {/* Daftar Kartu Agenda: 1 Kolom di Mobile/Tablet, 2 Kolom di Layar Lebar (lg >= 1024px) */}
        <section aria-label="Daftar Agenda Kegiatan" style={{ flex: 1 }}>
          {loadingAgenda ? (
            <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 600 }}>
              Memuat jadwal...
            </p>
          ) : loadError ? (
            <p style={{ color: "#dc2626", fontSize: "14px", fontWeight: 600 }}>
              {loadError}
            </p>
          ) : agendaDitampilkan.length > 0 ? (
            <div className="jadwal-grid grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {agendaDitampilkan.map((agenda) => (
                <AgendaCard
                  key={agenda.id}
                  agenda={agenda}
                  onClick={handleEditAgenda}
                />
              ))}
            </div>
          ) : (
            /* Keadaan Kosong: "Belum ada agenda" */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 16px",
                textAlign: "center",
                borderRadius: "16px",
                backgroundColor: "#f8fafc",
                border: "1.5px dashed #cbd5e1",
                marginTop: "4px",
              }}
              className="w-full"
            >
              <div
                aria-hidden="true"
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  backgroundColor: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  marginBottom: "12px",
                }}
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#334155",
                  margin: "0 0 4px",
                }}
              >
                Belum ada agenda
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                Tidak ada kegiatan yang dijadwalkan pada kategori waktu ini.
              </p>
            </div>
          )}
        </section>
      </main>


      {/* Bottom Sheet Form Agenda (Buat & Ubah) */}
      <AgendaFormSheet
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setAgendaToEdit(null);
        }}
        agendaToEdit={agendaToEdit}
        onSaveAgenda={handleSaveAgenda}
        onDeleteAgenda={handleDeleteAgenda}
      />

      {/* Navigasi Bawah */}
      <BottomNav />
    </div>
  );
}

export default function JadwalPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Memuat jadwal...
        </div>
      }
    >
      <JadwalContent />
    </Suspense>
  );
}
