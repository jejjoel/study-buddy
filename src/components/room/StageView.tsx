"use client";

import { useEffect, useRef, useState } from "react";

export interface StageViewProps {
  presenterName?: string;
  screenStream?: MediaStream | null;
}

export default function StageView({
  presenterName = "Max Zul",
  screenStream = null,
}: StageViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState<number>(80);
  const [ping, setPing] = useState<string>("-");

  // Sambungkan screenStream ke elemen video panggung
  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  // Dengarkan perubahan status Fullscreen
  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Periksa informasi Ping (RTT) dari Network Information API
  useEffect(() => {
    function updatePing() {
      if (typeof navigator !== "undefined") {
        const conn = (
          navigator as unknown as { connection?: { rtt?: number } }
        ).connection;
        if (conn && typeof conn.rtt === "number") {
          setPing(`${conn.rtt} ms`);
          return;
        }
      }
      setPing("-");
    }

    updatePing();

    const conn = (
      typeof navigator !== "undefined"
        ? (
            navigator as unknown as {
              connection?: {
                addEventListener?: (type: string, listener: () => void) => void;
                removeEventListener?: (
                  type: string,
                  listener: () => void
                ) => void;
              };
            }
          ).connection
        : null
    );

    if (conn && conn.addEventListener) {
      conn.addEventListener("change", updatePing);
      return () => {
        conn.removeEventListener?.("change", updatePing);
      };
    }
  }, []);

  function toggleFullscreen() {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  return (
    <section aria-label="Tampilan Layar Presentasi" style={{ width: "100%" }}>
      {/* Label "Screen" */}
      <h2
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "#26354b",
          margin: "0 0 8px 0",
        }}
      >
        Screen
      </h2>

      {/* Panggung Rounded Besar 16:9 dengan Overlay */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          minHeight: "190px",
          borderRadius: "20px",
          background: screenStream
            ? "#0f172a"
            : "linear-gradient(135deg, #151a36 0%, #2c1a52 50%, #151934 100%)",
          boxShadow: "0 8px 24px rgba(21, 26, 54, 0.15)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        {screenStream ? (
          // Video Layar yang Sedang Dibagikan
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            aria-label="Tampilan layar yang dibagikan"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "#000000",
            }}
          />
        ) : (
          // Teks "UI | UX" Murni dari CSS
          <div
            aria-label="Presentasi UI UX"
            style={{
              fontSize: "36px",
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "3px",
              userSelect: "none",
              textShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>UI</span>
            <span style={{ color: "#3688f5", fontWeight: 400 }}>|</span>
            <span>UX</span>
          </div>
        )}

        {/* OVERLAY ATAS: Indikator Ping (Kiri) & Slider Volume + Fullscreen (Kanan) */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            right: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 15,
            pointerEvents: "none",
          }}
        >
          {/* Indikator "Ping N ms" atau "Ping -" */}
          <div
            style={{
              pointerEvents: "auto",
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(6px)",
              borderRadius: "9999px",
              padding: "4px 10px",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: ping !== "-" ? "#10b981" : "#94a3b8",
                display: "inline-block",
              }}
            />
            <span>Ping {ping}</span>
          </div>

          {/* Sisi Kanan: Slider Volume & Tombol Layar Penuh */}
          <div
            style={{
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {/* Slider Volume Audio */}
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.75)",
                backdropFilter: "blur(6px)",
                borderRadius: "9999px",
                padding: "3px 10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#ffffff",
                minHeight: "34px",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
              }}
            >
              {/* Ikon Speaker */}
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>

              <label
                htmlFor="stage-volume-input"
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
                Pengatur volume suara panggung
              </label>

              <input
                id="stage-volume-input"
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                style={{
                  width: "60px",
                  accentColor: "#3688f5",
                  cursor: "pointer",
                }}
              />

              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  minWidth: "26px",
                }}
              >
                {volume}%
              </span>
            </div>

            {/* Tombol Layar Penuh (Fullscreen) */}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={
                isFullscreen ? "Keluar dari layar penuh" : "Layar penuh"
              }
              style={{
                width: "44px",
                height: "44px",
                minWidth: "44px",
                minHeight: "44px",
                borderRadius: "50%",
                backgroundColor: "rgba(15, 23, 42, 0.75)",
                backdropFilter: "blur(6px)",
                color: "#ffffff",
                border: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                padding: 0,
              }}
            >
              {isFullscreen ? (
                // Ikon Perkecil Layar
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </svg>
              ) : (
                // Ikon Perbesar Layar
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* OVERLAY BAWAH: Badge "Presenter: <nama>" */}
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "12px",
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(6px)",
            borderRadius: "9999px",
            padding: "4px 12px",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
            zIndex: 10,
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
              display: "inline-block",
            }}
          />
          <span>Presenter: {screenStream ? "Layar Anda" : presenterName}</span>
        </div>
      </div>
    </section>
  );
}
