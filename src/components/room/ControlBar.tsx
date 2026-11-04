"use client";

import Link from "next/link";

export interface ControlBarProps {
  isMicOn?: boolean;
  isCamOn?: boolean;
  isScreenSharing?: boolean;
  isScreenShareSupported?: boolean;
  onToggleMic?: () => void;
  onToggleCam?: () => void;
  onToggleScreenShare?: () => void;
  onCaptureScreenshot?: () => void;
  onOpenChat?: () => void;
  onLeaveClick?: () => void;
  isPill?: boolean;
}

export default function ControlBar({
  isMicOn = false,
  isCamOn = false,
  isScreenSharing = false,
  isScreenShareSupported = true,
  onToggleMic,
  onToggleCam,
  onToggleScreenShare,
  onCaptureScreenshot,
  onOpenChat,
  onLeaveClick,
  isPill = false,
}: ControlBarProps = {}) {
  return (
    <aside
      aria-label="Panel Kontrol Panggilan"
      style={{
        position: isPill ? "relative" : "fixed",
        bottom: isPill ? undefined : 0,
        left: isPill ? undefined : 0,
        right: isPill ? undefined : 0,
        zIndex: 60,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: isPill ? "auto" : "100%",
          maxWidth: isPill ? "fit-content" : "430px",
          pointerEvents: "auto",
          backgroundColor: isPill ? "#edf5ff" : "#ffffff",
          borderRadius: isPill ? "9999px" : "22px 22px 0 0",
          border: isPill ? "1.5px solid #cce1ff" : "1.5px solid #dce8f8",
          borderBottom: isPill ? "1.5px solid #cce1ff" : "none",
          boxShadow: isPill
            ? "0 8px 24px rgba(54, 136, 245, 0.16)"
            : "0 -4px 20px rgba(38, 53, 75, 0.08)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: isPill ? "center" : "space-between",
          gap: isPill ? "10px" : "6px",
          padding: isPill
            ? "8px 18px"
            : "10px 14px calc(12px + env(safe-area-inset-bottom, 0px))",
          boxSizing: "border-box",
        }}
      >
        {/* 1. Tombol Mikrofon: Merah dicoret jika mati, Biru jika aktif */}
        <button
          type="button"
          onClick={onToggleMic}
          aria-label={isMicOn ? "Matikan mikrofon" : "Nyalakan mikrofon"}
          style={{
            width: "44px",
            height: "44px",
            minWidth: "44px",
            minHeight: "44px",
            borderRadius: "50%",
            backgroundColor: isMicOn ? "#edf5ff" : "#fef2f2",
            color: isMicOn ? "#3688f5" : "#ef4444",
            border: isMicOn ? "1.5px solid #3688f5" : "1px solid #fee2e2",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
            transition: "all 0.15s ease",
          }}
        >
          {isMicOn ? (
            // Ikon Mic Normal
            <svg
              width="20"
              height="20"
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
          ) : (
            // Ikon Mic Dicoret Merah
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>

        {/* 2. Tombol Kamera: Merah dicoret jika mati, Biru jika aktif */}
        <button
          type="button"
          onClick={onToggleCam}
          aria-label={isCamOn ? "Matikan kamera" : "Nyalakan kamera"}
          style={{
            width: "44px",
            height: "44px",
            minWidth: "44px",
            minHeight: "44px",
            borderRadius: "50%",
            backgroundColor: isCamOn ? "#edf5ff" : "#fef2f2",
            color: isCamOn ? "#3688f5" : "#ef4444",
            border: isCamOn ? "1.5px solid #3688f5" : "1px solid #fee2e2",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
            transition: "all 0.15s ease",
          }}
        >
          {isCamOn ? (
            // Ikon Kamera Normal
            <svg
              width="20"
              height="20"
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
          ) : (
            // Ikon Kamera Dicoret Merah
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M21 21l-3.34-3.34L3 3" />
              <path d="M1 5v11a2 2 0 0 0 2 2h14" />
              <path d="M23 7l-7 5 7 5V7z" />
              <path d="M16 16V5a2 2 0 0 0-2-2H8" />
            </svg>
          )}
        </button>

        {/* 3. Tombol Berbagi Layar (Share Screen): Biru solid jika aktif */}
        <button
          type="button"
          onClick={onToggleScreenShare}
          aria-label={
            isScreenSharing ? "Hentikan berbagi layar" : "Bagikan layar"
          }
          style={{
            width: "44px",
            height: "44px",
            minWidth: "44px",
            minHeight: "44px",
            borderRadius: "50%",
            backgroundColor: isScreenSharing ? "#3688f5" : "#ffffff",
            color: isScreenSharing ? "#ffffff" : "#26354b",
            border: isScreenSharing
              ? "1.5px solid #3688f5"
              : "1px solid #dce6f2",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: isScreenShareSupported ? "pointer" : "not-allowed",
            opacity: isScreenShareSupported ? 1 : 0.5,
            padding: 0,
            transition: "all 0.15s ease",
          }}
        >
          {/* Ikon Monitor / Share Screen */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </button>

        {/* 4. Tombol Tangkapan Layar (Screenshot) */}
        <button
          type="button"
          onClick={onCaptureScreenshot}
          aria-label="Ambil tangkapan layar"
          style={{
            width: "44px",
            height: "44px",
            minWidth: "44px",
            minHeight: "44px",
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            color: "#26354b",
            border: "1px solid #dce6f2",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
            transition: "all 0.15s ease",
          }}
        >
          {/* Ikon Kamera Foto (Snapshot) */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>

        {/* 5. Tombol Chat Obrolan (Hanya perlu di mobile/tablet, atau tetap tersedia) */}
        <button
          type="button"
          onClick={onOpenChat}
          aria-label="Buka obrolan chat"
          style={{
            width: "44px",
            height: "44px",
            minWidth: "44px",
            minHeight: "44px",
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            color: "#26354b",
            border: "1px solid #dce6f2",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
            transition: "all 0.15s ease",
          }}
        >
          {/* Ikon Pesan / Chat */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>

        {/* 6. Tombol Merah Keluar Room */}
        {onLeaveClick ? (
          <button
            type="button"
            onClick={onLeaveClick}
            aria-label="Akhiri panggilan dan keluar dari room"
            style={{
              width: "44px",
              height: "44px",
              minWidth: "44px",
              minHeight: "44px",
              borderRadius: "50%",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              border: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
              padding: 0,
            }}
          >
            {/* Ikon Telepon Akhiri */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.99.99 0 0 1 0-1.41C3.32 8.78 7.42 7 12 7s8.68 1.78 11.71 4.67c.39.39.39 1.02 0 1.41l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
            </svg>
          </button>
        ) : (
          <Link
            href="/rooms"
            aria-label="Akhiri panggilan dan kembali ke Room Server"
            style={{
              width: "44px",
              height: "44px",
              minWidth: "44px",
              minHeight: "44px",
              borderRadius: "50%",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
              padding: 0,
            }}
          >
            {/* Ikon Telepon Akhiri */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.99.99 0 0 1 0-1.41C3.32 8.78 7.42 7 12 7s8.68 1.78 11.71 4.67c.39.39.39 1.02 0 1.41l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
            </svg>
          </Link>
        )}
      </div>
    </aside>
  );
}
