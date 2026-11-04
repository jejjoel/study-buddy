"use client";

import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import type { Member, Room } from "@/types/room";

export interface JoinRoomSheetProps {
  isOpen: boolean;
  room: Room;
  currentParticipants: Member[];
  meId: string;
  meNama: string;
  // Mengembalikan pesan error (string) jika gagal bergabung, atau null jika berhasil
  onJoin: (micState: boolean, camState: boolean, password: string) => Promise<string | null>;
  onCancel: () => void;
}

export default function JoinRoomSheet({
  isOpen,
  room,
  currentParticipants,
  meId,
  meNama,
  onJoin,
  onCancel,
}: JoinRoomSheetProps) {
  const [submitting, setSubmitting] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cek apakah room sudah penuh dan saya belum terdaftar sebagai anggota
  const sudahAnggota = currentParticipants.some(
    (m) => m.id === meId
  );
  const isPenuh = currentParticipants.length >= room.kapasitas && !sudahAnggota;

  // Sambungkan stream kamera ke elemen video preview
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Hentikan stream kamera lokal saat sheet ditutup
  const stopPreviewCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraStream(null);
  }, []);

  // Cleanup stream preview kamera saat komponen unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  function handleCancel() {
    stopPreviewCamera();
    setMicOn(false);
    setCamOn(false);
    setPasswordInput("");
    setError("");
    onCancel();
  }

  if (!isOpen) return null;

  // Toggle Mikrofon (Izin hanya diminta saat dinyalakan)
  async function handleToggleMic() {
    setError("");
    if (!micOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        // Matikan sementara stream pengetesan
        stream.getTracks().forEach((track) => track.stop());
        setMicOn(true);
      } catch {
        setError("Izin akses mikrofon ditolak atau tidak tersedia.");
      }
    } else {
      setMicOn(false);
    }
  }

  // Toggle Kamera (Izin hanya diminta saat dinyalakan)
  async function handleToggleCam() {
    setError("");
    if (!camOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        streamRef.current = stream;
        setCameraStream(stream);
        setCamOn(true);
      } catch {
        setError("Izin akses kamera ditolak atau tidak tersedia.");
      }
    } else {
      stopPreviewCamera();
      setCamOn(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (isPenuh) {
      setError("Room penuh. Anda tidak dapat bergabung.");
      return;
    }

    // Password diperiksa di server; di sini hanya pastikan tidak kosong
    if (room.hasPassword && !passwordInput.trim()) {
      setError("Password room wajib diisi.");
      return;
    }

    // Hentikan stream preview agar useRoomMedia dapat mengelolanya dari nol
    stopPreviewCamera();
    setSubmitting(true);
    const pesanError = await onJoin(micOn, camOn, passwordInput.trim());
    setSubmitting(false);

    if (pesanError) {
      // Preview kamera sudah dihentikan, jadi kembalikan toggle ke posisi mati
      setCamOn(false);
      setError(pesanError);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-sheet-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel();
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
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          backgroundColor: "#ffffff",
          boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.15)",
          padding: "12px 20px calc(24px + env(safe-area-inset-bottom, 0px))",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.22s ease-out",
        }}
      >
        {/* Handle kecil */}
        <div
          aria-hidden="true"
          style={{
            width: "38px",
            height: "4px",
            borderRadius: "2px",
            backgroundColor: "#c5d5e8",
            margin: "0 auto 12px",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h2
            id="join-sheet-title"
            style={{
              fontSize: "17px",
              fontWeight: 800,
              color: "#26354b",
              margin: 0,
            }}
          >
            Siap bergabung?
          </h2>

          <button
            type="button"
            onClick={handleCancel}
            aria-label="Batal bergabung"
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              padding: "8px",
            }}
          >
            Batal
          </button>
        </div>

        {/* Profil Pengguna Aktif & Preview Kamera */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "12px 14px",
            borderRadius: "16px",
            backgroundColor: "#f4f8ff",
            border: "1px solid #dce8fc",
            marginBottom: "16px",
          }}
        >
          {camOn && cameraStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                objectFit: "cover",
                transform: "scaleX(-1)",
                backgroundColor: "#000000",
              }}
            />
          ) : (
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                backgroundColor: "#3688f5",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 800,
              }}
            >
              {meNama[0]?.toUpperCase() || "?"}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontSize: "11px",
                color: "#64748b",
                fontWeight: 600,
                display: "block",
              }}
            >
              Masuk sebagai:
            </span>
            <strong
              style={{
                fontSize: "15px",
                color: "#26354b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
              }}
            >
              {meNama}
            </strong>
          </div>

          {/* Status Penuh */}
          {isPenuh && (
            <span
              style={{
                backgroundColor: "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                padding: "4px 10px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              Room penuh
            </span>
          )}
        </div>

        {/* Form Bergabung */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* Toggle Mic dan Kamera (Default Mati) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            {/* Toggle Mikrofon */}
            <button
              type="button"
              onClick={handleToggleMic}
              aria-label={micOn ? "Matikan mikrofon" : "Nyalakan mikrofon"}
              style={{
                minHeight: "46px",
                borderRadius: "12px",
                border: micOn ? "1.5px solid #3688f5" : "1.5px solid #dce6f2",
                backgroundColor: micOn ? "#edf5ff" : "#ffffff",
                color: micOn ? "#3688f5" : "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                padding: "0 10px",
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
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              <span>{micOn ? "Mic Aktif" : "Mic Mati"}</span>
            </button>

            {/* Toggle Kamera */}
            <button
              type="button"
              onClick={handleToggleCam}
              aria-label={camOn ? "Matikan kamera" : "Nyalakan kamera"}
              style={{
                minHeight: "46px",
                borderRadius: "12px",
                border: camOn ? "1.5px solid #3688f5" : "1.5px solid #dce6f2",
                backgroundColor: camOn ? "#edf5ff" : "#ffffff",
                color: camOn ? "#3688f5" : "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                padding: "0 10px",
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
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              <span>{camOn ? "Kamera Aktif" : "Kamera Mati"}</span>
            </button>
          </div>

          {/* Input Password jika room dilindungi password */}
          {room.hasPassword && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                htmlFor="input-join-password"
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#26354b",
                }}
              >
                Password Room
              </label>
              <input
                id="input-join-password"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={passwordInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setPasswordInput(val);
                }}
                placeholder="masukan angka password"
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
          )}

          {/* Pesan Error */}
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

          {/* Tombol Pill Biru "Gabung" */}
          <button
            type="submit"
            disabled={isPenuh || submitting}
            style={{
              width: "100%",
              minHeight: "46px",
              borderRadius: "9999px",
              backgroundColor: isPenuh ? "#cbd5e1" : "#3688f5",
              color: "#ffffff",
              border: "none",
              fontSize: "14px",
              fontWeight: 700,
              cursor: isPenuh ? "not-allowed" : "pointer",
              marginTop: "4px",
              boxShadow: isPenuh
                ? "none"
                : "0 4px 14px rgba(54, 136, 245, 0.3)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isPenuh ? "Room Penuh" : "Gabung"}
          </button>
        </form>
      </div>
    </div>
  );
}
