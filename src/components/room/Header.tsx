"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export interface HeaderProps {
  judul?: string;
  title?: string; // alias fleksibilitas
  onBack?: () => void;
  showActions?: boolean;
  onAddFriend?: () => void;
  onNotification?: () => void;
}

export default function Header({
  judul,
  title,
  onBack,
  showActions = false,
  onAddFriend,
  onNotification,
}: HeaderProps) {
  const router = useRouter();
  const textJudul = judul ?? title;

  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  }

  return (
    <header
      style={{
        width: "100%",
        height: "56px",
        minHeight: "56px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e7edf5",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px 0 8px",
        position: "sticky",
        top: 0,
        zIndex: 40,
        boxSizing: "border-box",
      }}
    >
      {/* Sisi Kiri: Tombol Kembali + Logo/Judul */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          minWidth: 0,
        }}
      >
        <button
          type="button"
          onClick={handleBack}
          aria-label="Kembali"
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
            borderRadius: "8px",
            cursor: "pointer",
            color: "#26354b",
            padding: 0,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {textJudul ? (
          <h1
            style={{
              fontSize: "17px",
              fontWeight: 700,
              color: "#26354b",
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {textJudul}
          </h1>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Image
              src="/images/logo study buddy 2.png"
              alt="Logo StudyBuddy"
              width={28}
              height={28}
              priority
              style={{ objectFit: "contain" }}
            />
            <span
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "#3688f5",
                letterSpacing: "-0.4px",
              }}
            >
              StudyBuddy
            </span>
          </div>
        )}
      </div>

      {showActions && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
          }}
        >
          {onAddFriend && (
            <button
              type="button"
              onClick={onAddFriend}
              aria-label="Tambah teman"
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
                borderRadius: "50%",
                cursor: "pointer",
                color: "#26354b",
                padding: 0,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </button>
          )}

          {onNotification && (
            <button
              type="button"
              onClick={onNotification}
              aria-label="Notifikasi"
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
                borderRadius: "50%",
                cursor: "pointer",
                color: "#26354b",
                padding: 0,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
