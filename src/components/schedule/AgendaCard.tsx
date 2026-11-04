"use client";

import { useMemo } from "react";
import type { Agenda } from "@/types/agenda";
import { isToday, isTomorrow } from "@/lib/utils/date";

export interface AgendaCardProps {
  agenda: Agenda;
  onClick?: (agenda: Agenda) => void;
}

export default function AgendaCard({ agenda, onClick }: AgendaCardProps) {
  // Hitung badge dari tanggal agenda
  const badgeText = useMemo(() => {
    if (isToday(agenda.tanggal)) {
      return "Hari Ini";
    }
    if (isTomorrow(agenda.tanggal)) {
      return "Besok";
    }
    try {
      const d = new Date(`${agenda.tanggal}T00:00:00`);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
      }).format(d);
    } catch {
      return agenda.tanggal;
    }
  }, [agenda.tanggal]);

  // Ikon SVG berdasarkan kategori
  const renderCategoryIcon = () => {
    const kat = agenda.kategori.toLowerCase();
    if (kat.includes("ui") || kat.includes("ux") || kat.includes("design")) {
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Ikon Palet / Desain */}
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
        </svg>
      );
    }

    if (kat.includes("cyber") || kat.includes("security")) {
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Ikon Keamanan / Shield */}
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      );
    }

    // Default: Ikon Buku / Belajar
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  };

  return (
    <article
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => onClick?.(agenda)}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick(agenda);
        }
      }}
      aria-label={onClick ? `Ubah agenda ${agenda.judul}` : undefined}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "18px",
        border: "1.5px solid #e7edf5",
        padding: "16px 18px",
        boxSizing: "border-box",
        boxShadow: "0 2px 10px rgba(38, 53, 75, 0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        transition: "all 0.2s ease",
        cursor: onClick ? "pointer" : "default",
        outline: "none",
      }}
      className="w-full h-full hover:border-[#3688f5] hover:shadow-md active:scale-[0.99] transition-all duration-200"
    >
      {/* Baris Atas: Ikon Kotak Biru Muda, Kategori, Judul & Badge Biru */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        {/* Kotak Biru Muda dengan Ikon */}
        <div
          aria-hidden="true"
          style={{
            width: "44px",
            height: "44px",
            minWidth: "44px",
            minHeight: "44px",
            borderRadius: "12px",
            backgroundColor: "#edf5ff",
            border: "1px solid #dce9fb",
            color: "#3688f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {renderCategoryIcon()}
        </div>

        {/* Konten Judul & Kategori */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#7c899b",
                textTransform: "uppercase",
                letterSpacing: "0.3px",
              }}
            >
              {agenda.kategori}
            </span>

            {/* Badge Biru "Hari Ini" / "Besok" */}
            <span
              style={{
                backgroundColor: "#edf5ff",
                color: "#3688f5",
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "9999px",
                border: "1px solid #cbe0fc",
                whiteSpace: "nowrap",
              }}
            >
              {badgeText}
            </span>
          </div>

          <h3
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#26354b",
              lineHeight: 1.35,
              margin: "3px 0 0",
              wordBreak: "break-word",
            }}
          >
            {agenda.judul}
          </h3>
        </div>
      </div>

      {/* Garis Pemisah Tipis */}
      <div
        style={{
          height: "1px",
          backgroundColor: "#f0f4f9",
          margin: "14px 0 10px",
          width: "100%",
        }}
      />

      {/* Baris Bawah: Jam di Kiri, Code Room di Kanan */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        {/* Jam */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#64748b",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>
            {agenda.jamMulai} - {agenda.jamSelesai}
          </span>
        </div>

        {/* Code Room (Kosong jika tidak ada) */}
        {agenda.kodeRoom ? (
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#3688f5",
              letterSpacing: "0.2px",
            }}
          >
            Code Room : {agenda.kodeRoom}
          </span>
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}
