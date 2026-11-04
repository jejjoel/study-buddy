"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useRoomCategories } from "@/hooks/use-room-categories";
import type { Room } from "@/types/room";

export interface CreateRoomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (room: Room) => void;
}

export default function CreateRoomSheet({
  isOpen,
  onClose,
  onCreateRoom,
}: CreateRoomSheetProps) {
  const categories = useRoomCategories();
  const [namaRoom, setNamaRoom] = useState("");
  const [kategoriTerpilih, setKategoriTerpilih] = useState("");
  const [isTambahKategoriBaru, setIsTambahKategoriBaru] = useState(false);
  const [kategoriBaruInput, setKategoriBaruInput] = useState("");
  const [kategoriError, setKategoriError] = useState("");
  const [password, setPassword] = useState("");
  const [tanpaPassword, setTanpaPassword] = useState(false);
  const [kapasitas, setKapasitas] = useState(10);
  const [error, setError] = useState("");

  const handleClose = useCallback(() => {
    setNamaRoom("");
    setKategoriTerpilih("");
    setIsTambahKategoriBaru(false);
    setKategoriBaruInput("");
    setKategoriError("");
    setPassword("");
    setTanpaPassword(false);
    setKapasitas(10);
    setError("");
    onClose();
  }, [onClose]);

  // Kunci scroll latar belakang dan tangani tombol Escape saat sheet terbuka
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setKategoriError("");

    // Validasi nama room
    const namaBersih = namaRoom.trim();
    if (!namaBersih) {
      setError("Nama room wajib diisi.");
      return;
    }

    // Validasi dan penentuan kategori room
    let kategoriFinal = "";
    if (isTambahKategoriBaru) {
      const category = kategoriBaruInput.trim();
      if (!category || category.length > 30) {
        setKategoriError("Nama kategori wajib diisi dan maksimal 30 karakter.");
        return;
      }
      kategoriFinal = category;
    } else {
      kategoriFinal = kategoriTerpilih || categories[0] || "Umum";
    }

    // Validasi password jika tidak memilih 'Tanpa Password'
    let passwordFinal: string | null = null;
    if (!tanpaPassword) {
      const pwdBersih = password.trim();
      if (!pwdBersih) {
        setError("Password wajib diisi atau pilih 'Tanpa Password'.");
        return;
      }
      if (!/^[0-9]+$/.test(pwdBersih)) {
        setError("Password hanya boleh berupa angka.");
        return;
      }
      passwordFinal = pwdBersih;
    }

    // Kode dan identitas host dibuat oleh prosedur database saat room disimpan.
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      kode: "",
      nama: namaBersih,
      kategori: kategoriFinal,
      peserta: 1, // Host langsung terdaftar sebagai peserta pertama
      kapasitas: Math.min(50, Math.max(1, kapasitas)),
      password: passwordFinal,
      status: "live",
      hostId: "",
    };

    onCreateRoom(newRoom);
    handleClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      className="create-room-overlay"
      onClick={(e) => {
        // Tutup jika mengetuk area overlay gelap
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="create-room-modal">
        {/* Handle kecil di tengah atas (hanya mobile, disembunyikan pada >=640px) */}
        <div
          aria-hidden="true"
          className="create-room-handle"
        />

        {/* Judul Sheet */}
        <h2
          id="sheet-title"
          style={{
            fontSize: "17px",
            fontWeight: 800,
            color: "#26354b",
            textAlign: "center",
            margin: "0 0 18px",
            letterSpacing: "-0.3px",
          }}
        >
          Buat Room
        </h2>

        {/* Form Pembuatan Room */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* 1. Nama Room */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="input-nama-room"
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#26354b",
              }}
            >
              Nama room
            </label>
            <input
              id="input-nama-room"
              type="text"
              value={namaRoom}
              onChange={(e) => setNamaRoom(e.target.value)}
              placeholder="Belajar UI/UX Designer"
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

          {/* 2. Kategori Room */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              htmlFor="select-kategori-room"
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
                id="select-kategori-room"
                value={
                  isTambahKategoriBaru
                    ? "__TAMBAH_BARU__"
                    : kategoriTerpilih || (categories.length > 0 ? categories[0] : "")
                }
                onChange={(e) => {
                  setKategoriError("");
                  if (e.target.value === "__TAMBAH_BARU__") {
                    setIsTambahKategoriBaru(true);
                  } else {
                    setIsTambahKategoriBaru(false);
                    setKategoriTerpilih(e.target.value);
                  }
                }}
                style={{
                  width: "100%",
                  height: "46px",
                  minHeight: "44px",
                  padding: "0 38px 0 14px",
                  borderRadius: "12px",
                  border: "1.5px solid #dce6f2",
                  backgroundColor: "#ffffff",
                  fontSize: "13px",
                  color: "#26354b",
                  fontWeight: 600,
                  outline: "none",
                  boxSizing: "border-box",
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                }}
              >
                {categories.map((kat) => (
                  <option key={kat} value={kat}>
                    {kat}
                  </option>
                ))}
                <option value="__TAMBAH_BARU__">+ Tambah kategori baru</option>
              </select>

              {/* Chevron icon */}
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
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Input teks kategori baru jika opsi '+ Tambah kategori baru' dipilih */}
            {isTambahKategoriBaru && (
              <div style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <input
                  id="input-kategori-baru"
                  type="text"
                  maxLength={30}
                  value={kategoriBaruInput}
                  onChange={(e) => {
                    setKategoriBaruInput(e.target.value);
                    if (kategoriError) setKategoriError("");
                  }}
                  placeholder="Ketik nama kategori baru (maks. 30 karakter)"
                  autoFocus
                  style={{
                    width: "100%",
                    height: "46px",
                    minHeight: "44px",
                    padding: "0 14px",
                    borderRadius: "12px",
                    border: kategoriError
                      ? "1.5px solid #ef4444"
                      : "1.5px solid #3688f5",
                    backgroundColor: "#f8faff",
                    fontSize: "13px",
                    color: "#26354b",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {kategoriError && (
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#ef4444",
                      margin: "2px 0 0 2px",
                      fontWeight: 600,
                    }}
                  >
                    {kategoriError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 3. Password & Pilihan "Tanpa Password" */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <label
                htmlFor="input-password-room"
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#26354b",
                }}
              >
                Password
              </label>

              {/* Pilihan Tanpa Password */}
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: tanpaPassword ? "#3688f5" : "#64748b",
                  cursor: "pointer",
                  minHeight: "44px",
                  padding: "0 2px",
                }}
              >
                <input
                  type="checkbox"
                  checked={tanpaPassword}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setTanpaPassword(checked);
                    if (checked) {
                      setPassword("");
                    }
                  }}
                  style={{
                    width: "18px",
                    height: "18px",
                    accentColor: "#3688f5",
                    cursor: "pointer",
                  }}
                />
                Tanpa Password
              </label>
            </div>

            <input
              id="input-password-room"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={password}
              disabled={tanpaPassword}
              onChange={(e) => {
                // Hanya izinkan karakter angka
                const angkaSaja = e.target.value.replace(/[^0-9]/g, "");
                setPassword(angkaSaja);
              }}
              placeholder="masukan angka password"
              style={{
                width: "100%",
                height: "46px",
                padding: "0 14px",
                borderRadius: "12px",
                border: "1.5px solid #dce6f2",
                backgroundColor: tanpaPassword ? "#f1f5f9" : "#ffffff",
                fontSize: "13px",
                color: tanpaPassword ? "#94a3b8" : "#26354b",
                cursor: tanpaPassword ? "not-allowed" : "text",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* 3. Jumlah Peserta */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#26354b",
              }}
            >
              Jumlah Peserta
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 8px",
                borderRadius: "14px",
                border: "1.5px solid #dce6f2",
                backgroundColor: "#ffffff",
                minHeight: "52px",
                boxSizing: "border-box",
              }}
            >
              {/* Stepper: - , Angka , + */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  aria-label="Kurangi kapasitas peserta"
                  onClick={() => setKapasitas((prev) => Math.max(1, prev - 1))}
                  disabled={kapasitas <= 1}
                  style={{
                    width: "44px",
                    height: "44px",
                    minWidth: "44px",
                    minHeight: "44px",
                    borderRadius: "10px",
                    border: "1px solid #d8e4f0",
                    backgroundColor: kapasitas <= 1 ? "#f8faff" : "#edf5ff",
                    color: kapasitas <= 1 ? "#cbd5e1" : "#2474e5",
                    fontSize: "20px",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: kapasitas <= 1 ? "not-allowed" : "pointer",
                    padding: 0,
                  }}
                >
                  −
                </button>

                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#26354b",
                    minWidth: "32px",
                    textAlign: "center",
                  }}
                >
                  {kapasitas}
                </span>

                <button
                  type="button"
                  aria-label="Tambah kapasitas peserta"
                  onClick={() =>
                    setKapasitas((prev) => Math.min(50, prev + 1))
                  }
                  disabled={kapasitas >= 50}
                  style={{
                    width: "44px",
                    height: "44px",
                    minWidth: "44px",
                    minHeight: "44px",
                    borderRadius: "10px",
                    border: "1px solid #d8e4f0",
                    backgroundColor: kapasitas >= 50 ? "#f8faff" : "#edf5ff",
                    color: kapasitas >= 50 ? "#cbd5e1" : "#2474e5",
                    fontSize: "20px",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: kapasitas >= 50 ? "not-allowed" : "pointer",
                    padding: 0,
                  }}
                >
                  +
                </button>
              </div>

              {/* Pill abu-abu terang "Max 50" */}
              <span
                style={{
                  backgroundColor: "#f1f5fa",
                  color: "#64748b",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "6px 14px",
                  borderRadius: "9999px",
                }}
              >
                Max 50
              </span>
            </div>
          </div>

          {/* Pesan Error Validasi */}
          {error && (
            <div
              role="alert"
              style={{
                color: "#dc2626",
                fontSize: "12px",
                fontWeight: 600,
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
            >
              {error}
            </div>
          )}

          {/* Tombol Pill Biru "Konfirmasi" */}
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
              marginTop: "6px",
              boxShadow: "0 4px 14px rgba(54, 136, 245, 0.3)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Konfirmasi
          </button>
        </form>
      </div>
    </div>
  );
}
