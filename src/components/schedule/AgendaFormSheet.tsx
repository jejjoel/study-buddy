"use client";

import { useState, useEffect, type FormEvent } from "react";
import type { Agenda } from "@/types/agenda";
import { getRelativeDate } from "@/lib/utils/date";

const AGENDA_CATEGORIES = ["UI/UX", "Cyber Security", "Data", "Umum"];

export interface AgendaFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  agendaToEdit?: Agenda | null;
  onSaveAgenda: (agenda: Agenda) => void;
  onDeleteAgenda?: (id: string) => void;
}

interface AgendaFormInnerProps {
  agendaToEdit?: Agenda | null;
  onClose: () => void;
  onSaveAgenda: (agenda: Agenda) => void;
  onDeleteAgenda?: (id: string) => void;
}

function AgendaFormInner({
  agendaToEdit,
  onClose,
  onSaveAgenda,
  onDeleteAgenda,
}: AgendaFormInnerProps) {
  const isEditMode = Boolean(agendaToEdit);

  const [judul, setJudul] = useState(agendaToEdit?.judul ?? "");
  const [kategori, setKategori] = useState(
    agendaToEdit?.kategori ?? AGENDA_CATEGORIES[0]
  );
  const [tanggal, setTanggal] = useState(
    agendaToEdit?.tanggal ?? getRelativeDate()
  );
  const [jamMulai, setJamMulai] = useState(agendaToEdit?.jamMulai ?? "14:00");
  const [jamSelesai, setJamSelesai] = useState(
    agendaToEdit?.jamSelesai ?? "15:00"
  );
  const [kodeRoom, setKodeRoom] = useState(agendaToEdit?.kodeRoom ?? "");
  const [catatan, setCatatan] = useState(agendaToEdit?.catatan ?? "");
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const judulBersih = judul.trim();
    if (!judulBersih) {
      setError("Judul agenda wajib diisi.");
      return;
    }

    const tanggalBersih = tanggal.trim();
    if (!tanggalBersih) {
      setError("Tanggal agenda wajib diisi.");
      return;
    }

    if (!jamMulai || !jamSelesai) {
      setError("Jam mulai dan jam selesai wajib diisi.");
      return;
    }

    // Validasi: jam selesai harus setelah jam mulai
    if (jamSelesai <= jamMulai) {
      setError("Jam selesai harus setelah jam mulai.");
      return;
    }

    const agendaHasil: Agenda = {
      id: agendaToEdit ? agendaToEdit.id : `ag-${Date.now()}`,
      judul: judulBersih,
      kategori: kategori.trim() || "Umum",
      tanggal: tanggalBersih,
      jamMulai,
      jamSelesai,
      kodeRoom: kodeRoom.trim() ? kodeRoom.trim() : undefined,
      catatan: catatan.trim() ? catatan.trim() : undefined,
    };

    onSaveAgenda(agendaHasil);
    onClose();
  }

  function handleConfirmDelete() {
    if (agendaToEdit && onDeleteAgenda) {
      onDeleteAgenda(agendaToEdit.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  }

  return (
    <>
      {/* Header Sheet */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <h2
          id="agenda-sheet-title"
          style={{
            fontSize: "17px",
            fontWeight: 800,
            color: "#26354b",
            margin: 0,
            letterSpacing: "-0.3px",
          }}
        >
          {isEditMode ? "Ubah Jadwal" : "Buat Jadwal"}
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup form jadwal"
          style={{
            background: "none",
            border: "none",
            color: "#64748b",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            padding: "8px",
            minHeight: "44px",
            minWidth: "44px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Tutup
        </button>
      </div>

      {/* Form Jadwal */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {/* 1. Judul Agenda */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="input-agenda-judul"
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#26354b",
            }}
          >
            Judul Agenda <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="input-agenda-judul"
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="Contoh: Belajar UI/UX Design"
            required
            style={{
              width: "100%",
              height: "46px",
              padding: "0 14px",
              borderRadius: "12px",
              border: "1.5px solid #dce6f2",
              backgroundColor: "#ffffff",
              fontSize: "13px",
              color: "#26354b",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* 2. Kategori Agenda */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="select-agenda-kategori"
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#26354b",
            }}
          >
            Kategori
          </label>
          <div style={{ position: "relative" }}>
            <select
              id="select-agenda-kategori"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              style={{
                width: "100%",
                height: "46px",
                padding: "0 36px 0 14px",
                borderRadius: "12px",
                border: "1.5px solid #dce6f2",
                backgroundColor: "#ffffff",
                fontSize: "13px",
                color: "#26354b",
                outline: "none",
                appearance: "none",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              {AGENDA_CATEGORIES.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        {/* 3. Tanggal */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="input-agenda-tanggal"
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#26354b",
            }}
          >
            Tanggal <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="input-agenda-tanggal"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
            style={{
              width: "100%",
              height: "46px",
              padding: "0 14px",
              borderRadius: "12px",
              border: "1.5px solid #dce6f2",
              backgroundColor: "#ffffff",
              fontSize: "13px",
              color: "#26354b",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* 4. Jam Mulai & Jam Selesai */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          {/* Jam Mulai */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="input-agenda-jam-mulai"
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#26354b",
              }}
            >
              Jam Mulai <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              id="input-agenda-jam-mulai"
              type="time"
              value={jamMulai}
              onChange={(e) => setJamMulai(e.target.value)}
              required
              style={{
                width: "100%",
                height: "46px",
                padding: "0 12px",
                borderRadius: "12px",
                border: "1.5px solid #dce6f2",
                backgroundColor: "#ffffff",
                fontSize: "13px",
                color: "#26354b",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Jam Selesai */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="input-agenda-jam-selesai"
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#26354b",
              }}
            >
              Jam Selesai <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              id="input-agenda-jam-selesai"
              type="time"
              value={jamSelesai}
              onChange={(e) => setJamSelesai(e.target.value)}
              required
              style={{
                width: "100%",
                height: "46px",
                padding: "0 12px",
                borderRadius: "12px",
                border: "1.5px solid #dce6f2",
                backgroundColor: "#ffffff",
                fontSize: "13px",
                color: "#26354b",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* 5. Kode Room (Opsional) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="input-agenda-kode-room"
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#26354b",
            }}
          >
            Kode Room (opsional)
          </label>
          <input
            id="input-agenda-kode-room"
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={kodeRoom}
            onChange={(e) => setKodeRoom(e.target.value)}
            placeholder="Contoh: 2305"
            style={{
              width: "100%",
              height: "46px",
              padding: "0 14px",
              borderRadius: "12px",
              border: "1.5px solid #dce6f2",
              backgroundColor: "#ffffff",
              fontSize: "13px",
              color: "#26354b",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* 6. Catatan (Opsional) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="input-agenda-catatan"
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#26354b",
            }}
          >
            Catatan
          </label>
          <textarea
            id="input-agenda-catatan"
            rows={3}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Tambahkan catatan atau topik diskusi..."
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1.5px solid #dce6f2",
              backgroundColor: "#ffffff",
              fontSize: "13px",
              color: "#26354b",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>

        {/* Pesan Error Validasi */}
        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#ef4444",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Tombol Aksi */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "6px",
          }}
        >
          {/* Tombol Simpan / Buat */}
          <button
            type="submit"
            style={{
              width: "100%",
              minHeight: "46px",
              borderRadius: "9999px",
              backgroundColor: "#3688f5",
              color: "#ffffff",
              border: "none",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(54, 136, 245, 0.35)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isEditMode ? "Simpan Perubahan" : "Buat Jadwal"}
          </button>

          {/* Tombol Hapus (Hanya muncul saat mode ubah/edit) */}
          {isEditMode && onDeleteAgenda && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                width: "100%",
                minHeight: "44px",
                borderRadius: "9999px",
                backgroundColor: "#fff1f2",
                color: "#e11d48",
                border: "1px solid #fecdd3",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span>Hapus Agenda</span>
            </button>
          )}
        </div>
      </form>

      {/* Dialog Konfirmasi Hapus */}
      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "360px",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "22px 20px",
              boxSizing: "border-box",
              boxShadow: "0 10px 35px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
              animation: "fadeIn 0.18s ease-out",
            }}
          >
            <h3
              id="delete-confirm-title"
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#26354b",
                margin: "0 0 8px",
              }}
            >
              Hapus agenda?
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                margin: "0 0 20px",
                lineHeight: 1.45,
              }}
            >
              Apakah kamu yakin ingin menghapus agenda &quot;{judul}&quot;?
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  minHeight: "44px",
                  padding: "0 16px",
                  borderRadius: "9999px",
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  minHeight: "44px",
                  padding: "0 18px",
                  borderRadius: "9999px",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.35)",
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AgendaFormSheet({
  isOpen,
  onClose,
  agendaToEdit,
  onSaveAgenda,
  onDeleteAgenda,
}: AgendaFormSheetProps) {
  // Kunci scroll latar belakang dan dengarkan tombol Escape
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="agenda-sheet-title"
      onClick={(e) => {
        // Tutup jika mengetuk overlay latar belakang gelap
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          maxHeight: "90vh",
          overflowY: "auto",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          background:
            "linear-gradient(180deg, #edf5ff 0%, #ffffff 75px), #ffffff",
          backgroundColor: "#ffffff",
          boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.12)",
          padding: "12px 20px calc(24px + env(safe-area-inset-bottom, 0px))",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.22s ease-out",
        }}
      >
        {/* Handle kecil di tengah atas */}
        <div
          aria-hidden="true"
          style={{
            width: "38px",
            height: "4px",
            borderRadius: "2px",
            backgroundColor: "#c5d5e8",
            margin: "0 auto 12px",
            flexShrink: 0,
          }}
        />

        {/* Konten Form Inner */}
        <AgendaFormInner
          key={agendaToEdit ? agendaToEdit.id : "agenda-baru"}
          agendaToEdit={agendaToEdit}
          onClose={onClose}
          onSaveAgenda={onSaveAgenda}
          onDeleteAgenda={onDeleteAgenda}
        />
      </div>
    </div>
  );
}
