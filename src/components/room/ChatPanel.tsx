"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import type { Message } from "@/types/chat";

export interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean;
  messages: Message[];
  meId: string;
  onSend: (isi: string) => void | Promise<void>;
}

export default function ChatPanel({
  isOpen,
  onClose,
  embedded = false,
  messages: daftarPesan,
  meId,
  onSend,
}: ChatPanelProps) {
  const [inputPesan, setInputPesan] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Kunci scroll latar belakang dan dengarkan tombol Escape (hanya untuk mode modal sheet)
  useEffect(() => {
    if (embedded || !isOpen) return;

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
  }, [isOpen, onClose, embedded]);

  // Auto-scroll ke pesan terbaru saat daftar pesan berubah atau panel dibuka
  useEffect(() => {
    if (embedded || isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [daftarPesan, isOpen, embedded]);

  // Jika bukan mode embedded dan tidak open, jangan render apa-apa
  if (!embedded && !isOpen) return null;

  function handleKirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const pesanBersih = inputPesan.trim();
    // Tolak pesan kosong
    if (!pesanBersih) return;

    // Pesan disimpan ke database oleh halaman room, lalu muncul lewat Realtime
    void onSend(pesanBersih);
    setInputPesan("");
  }

  // Konten Utama Chat (Header, Daftar Pesan, Input Form)
  const chatContent = (
    <>
      {/* Header Panel Chat */}
      <div
        style={{
          padding: embedded ? "14px 16px" : "10px 16px 8px",
          borderBottom: "1px solid #edf2f7",
          display: "flex",
          flexDirection: embedded ? "row" : "column",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          backgroundColor: "#ffffff",
        }}
      >
        {!embedded && (
          // Handle kecil di tengah atas untuk bottom sheet mobile
          <div
            aria-hidden="true"
            style={{
              width: "38px",
              height: "4px",
              borderRadius: "2px",
              backgroundColor: "#c5d5e8",
              marginBottom: "10px",
            }}
          />
        )}

        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h2
              id="chat-panel-title"
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#26354b",
                margin: 0,
              }}
            >
              Obrolan Room
            </h2>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#3688f5",
                backgroundColor: "#edf5ff",
                padding: "2px 8px",
                borderRadius: "9999px",
              }}
            >
              {daftarPesan.length}
            </span>
          </div>

          {!embedded && (
            // Tombol Silang Tutup (hanya untuk bottom sheet)
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup chat"
              style={{
                width: "44px",
                height: "44px",
                minWidth: "44px",
                minHeight: "44px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                padding: 0,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Daftar Pesan Chat */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          backgroundColor: "#ffffff",
        }}
      >
        {daftarPesan.map((pesan) => {
          const isSaya = pesan.pengirimId === meId;

          return (
            <div
              key={pesan.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isSaya ? "flex-end" : "flex-start",
                width: "100%",
              }}
            >
              {/* Nama Pengirim dan Waktu */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "4px",
                  fontSize: "11px",
                  color: "#7c899b",
                  fontWeight: 600,
                  flexDirection: isSaya ? "row-reverse" : "row",
                }}
              >
                <span style={{ color: isSaya ? "#3688f5" : "#26354b" }}>
                  {isSaya ? "Anda" : pesan.nama}
                </span>
                <span>•</span>
                <span>{pesan.waktu}</span>
              </div>

              {/* Gelembung Pesan */}
              <div
                style={{
                  maxWidth: "82%",
                  padding: "10px 14px",
                  borderRadius: isSaya
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                  backgroundColor: isSaya ? "#edf5ff" : "#ffffff",
                  color: "#26354b",
                  border: isSaya ? "1px solid #cbe0fc" : "1.5px solid #e7edf5",
                  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
                  fontSize: "13px",
                  lineHeight: 1.45,
                  wordBreak: "break-word",
                }}
              >
                {pesan.isi}
              </div>
            </div>
          );
        })}
        {/* Elemen target auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Baris Input dan Tombol Kirim */}
      <form
        onSubmit={handleKirim}
        style={{
          padding: embedded
            ? "12px 14px"
            : "10px 14px calc(14px + env(safe-area-inset-bottom, 0px))",
          borderTop: "1px solid #edf2f7",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <label
          htmlFor={
            embedded ? "input-chat-pesan-embedded" : "input-chat-pesan-sheet"
          }
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
          Ketik pesan obrolan
        </label>

        <input
          id={
            embedded ? "input-chat-pesan-embedded" : "input-chat-pesan-sheet"
          }
          type="text"
          value={inputPesan}
          onChange={(e) => setInputPesan(e.target.value)}
          placeholder="Ketik pesan..."
          style={{
            flex: 1,
            height: "46px",
            padding: "0 16px",
            borderRadius: "9999px",
            border: "1.5px solid #dce6f2",
            backgroundColor: "#f8faff",
            fontSize: "13px",
            color: "#26354b",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <button
          type="submit"
          aria-label="Kirim pesan"
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
            boxShadow: "0 2px 8px rgba(54, 136, 245, 0.3)",
            flexShrink: 0,
          }}
        >
          {/* Ikon Kirim (Paper Plane) */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </>
  );

  // Jika mode embedded (tampil permanen di sidebar desktop)
  if (embedded) {
    return (
      <div
        aria-label="Panel Obrolan Room"
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          border: "1.5px solid #e7edf5",
          boxShadow: "0 2px 12px rgba(38, 53, 75, 0.04)",
          overflow: "hidden",
        }}
      >
        {chatContent}
      </div>
    );
  }

  // Jika mode modal bottom sheet (untuk mobile & tablet)
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-panel-title"
      onClick={(e) => {
        // Tutup jika mengetuk area overlay gelap
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
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
          height: "75vh",
          maxHeight: "620px",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          backgroundColor: "#ffffff",
          boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "slideUp 0.22s ease-out",
        }}
      >
        {chatContent}
      </div>
    </div>
  );
}
