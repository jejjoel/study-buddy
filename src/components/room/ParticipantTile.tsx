"use client";

import { useEffect, useRef } from "react";
import type { Member } from "@/types/room";

export interface ParticipantTileProps {
  member: Member;
  isLocalUser?: boolean;
  localCameraStream?: MediaStream | null;
  isLocalSpeaking?: boolean;
  isLocalMicOn?: boolean;
  /** Data peserta lain (dari LiveKit) */
  remoteCameraStream?: MediaStream | null;
  remoteSpeaking?: boolean;
  remoteMicOn?: boolean;
  compact?: boolean;
}

export default function ParticipantTile({
  member,
  isLocalUser = false,
  localCameraStream = null,
  isLocalSpeaking,
  isLocalMicOn,
  remoteCameraStream = null,
  remoteSpeaking,
  remoteMicOn,
  compact = false,
}: ParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Stream kamera yang ditampilkan: lokal untuk diri sendiri, remote untuk peserta lain
  const cameraStream = isLocalUser ? localCameraStream : remoteCameraStream;
  const hasVideo = Boolean(cameraStream);

  // Sambungkan stream kamera ke elemen video saat kamera aktif
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, hasVideo]);

  // Status bicara & mic: lokal dari hook media, peserta lain dari LiveKit
  const isSpeaking = isLocalUser
    ? isLocalSpeaking !== undefined
      ? isLocalSpeaking
      : member.speaking
    : remoteSpeaking !== undefined
      ? remoteSpeaking
      : member.speaking;

  const isMicOn = isLocalUser
    ? isLocalMicOn !== undefined
      ? isLocalMicOn
      : member.micOn
    : remoteMicOn !== undefined
      ? remoteMicOn
      : member.micOn;

  const namaTampilan = `${member.nama} ${isLocalUser ? "(Anda)" : ""}`;

  // 1. TAMPILAN SAAT KAMERA AKTIF (ON CAM: Full di kotaknya)
  if (hasVideo) {
    return (
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          width: compact ? "120px" : "100%",
          minWidth: compact ? "120px" : undefined,
          height: compact ? "88px" : "120px",
          minHeight: compact ? "88px" : "116px",
          flexShrink: compact ? 0 : undefined,
          borderRadius: compact ? "14px" : "18px",
          backgroundColor: "#0f172a",
          border: isSpeaking ? "3px solid #3688f5" : "1.5px solid #dce8f8",
          boxShadow: isSpeaking
            ? "0 0 14px rgba(54, 136, 245, 0.45)"
            : "0 2px 8px rgba(0, 0, 0, 0.08)",
          boxSizing: "border-box",
          transition: "border 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        {/* Video Kamera Penuh di Kotak (Mirror, Muted) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-label={isLocalUser ? "Video kamera Anda" : `Video kamera ${member.nama}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: isLocalUser ? "scaleX(-1)" : "none", // Mirror hanya untuk selfie view
            display: "block",
            zIndex: 1,
            borderRadius: "inherit",
          }}
        />

        {/* Overlay Gradien Bawah: Nama & Status Mic agar selalu terbaca jelas */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            padding: compact ? "16px 8px 6px" : "24px 10px 8px",
            background:
              "linear-gradient(to top, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.45) 60%, transparent 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "4px",
            pointerEvents: "none",
          }}
        >
          {/* Nama Peserta dengan Text Shadow */}
          <span
            style={{
              fontSize: compact ? "11px" : "12px",
              fontWeight: 700,
              color: "#ffffff",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
              minWidth: 0,
            }}
          >
            {namaTampilan}
          </span>

          {/* Ikon Mic di Atas Video */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              backgroundColor: isMicOn
                ? isSpeaking
                  ? "#3688f5"
                  : "rgba(255, 255, 255, 0.3)"
                : "rgba(239, 68, 68, 0.9)",
              flexShrink: 0,
            }}
          >
            {isMicOn ? (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-label="Mikrofon aktif"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            ) : (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-label="Mikrofon nonaktif"
              >
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. TAMPILAN SAAT KAMERA TIDAK AKTIF (OFF CAM: Avatar rounded persegi dengan inisial)
  const avatarSize = compact ? "40px" : "52px";

  return (
    <div
      style={{
        backgroundColor: "#edf5ff",
        borderRadius: compact ? "14px" : "18px",
        padding: compact ? "10px 8px 8px" : "16px 12px 14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        boxSizing: "border-box",
        width: compact ? "120px" : "100%",
        minWidth: compact ? "120px" : undefined,
        height: compact ? "88px" : "120px",
        minHeight: compact ? "88px" : "116px",
        flexShrink: compact ? 0 : undefined,
        border: isSpeaking ? "3px solid #3688f5" : "1.5px solid #dce8f8",
        boxShadow: isSpeaking ? "0 0 12px rgba(54, 136, 245, 0.25)" : "none",
        transition: "border 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {/* Avatar PERSEGI bersudut membulat (inisial berwarna) */}
      <div
        aria-hidden="true"
        style={{
          width: avatarSize,
          height: avatarSize,
          minWidth: avatarSize,
          minHeight: avatarSize,
          borderRadius: compact ? "10px" : "14px",
          backgroundColor: member.warnaAvatar || "#3688f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontSize: compact ? "15px" : "18px",
          fontWeight: 800,
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
          userSelect: "none",
        }}
      >
        {member.inisial}
      </div>

      {/* Nama di bawah avatar */}
      <span
        style={{
          fontSize: compact ? "11px" : "13px",
          fontWeight: 700,
          color: "#26354b",
          marginTop: compact ? "6px" : "8px",
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
        }}
      >
        {namaTampilan}
      </span>

      {/* Ikon mic dan orang kecil di kanan bawah */}
      <div
        style={{
          position: "absolute",
          bottom: compact ? "6px" : "8px",
          right: compact ? "6px" : "8px",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {/* Ikon Mic: merah dicoret bila mati, biru/abu bila aktif */}
        {isMicOn ? (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isSpeaking ? "#3688f5" : "#64748b"}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-label="Mikrofon aktif"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        ) : (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-label="Mikrofon nonaktif"
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}

        {/* Ikon Orang Kecil */}
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64748b"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
    </div>
  );
}
