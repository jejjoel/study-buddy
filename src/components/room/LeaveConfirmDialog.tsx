"use client";

export interface LeaveConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LeaveConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
}: LeaveConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "340px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "24px 20px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          animation: "scaleUp 0.18s ease-out",
          boxSizing: "border-box",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "#fef2f2",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "14px",
          }}
        >
          {/* Ikon Peringatan / Telepon Keluar */}
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
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.8 19.8 0 0 1-3.12-8.69A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
            <line x1="23" y1="1" x2="1" y2="23" />
          </svg>
        </div>

        <h3
          id="dialog-title"
          style={{
            fontSize: "17px",
            fontWeight: 800,
            color: "#26354b",
            margin: "0 0 8px 0",
          }}
        >
          Keluar dari room?
        </h3>

        <p
          id="dialog-desc"
          style={{
            fontSize: "13px",
            color: "#64748b",
            margin: "0 0 20px 0",
            lineHeight: 1.5,
          }}
        >
          Apakah Anda yakin ingin meninggalkan sesi room belajar ini?
        </p>

        {/* Tombol Aksi: Batal / Keluar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            width: "100%",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              minHeight: "44px",
              borderRadius: "9999px",
              backgroundColor: "#f1f5fa",
              color: "#64748b",
              border: "none",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              padding: "0 16px",
            }}
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={{
              minHeight: "44px",
              borderRadius: "9999px",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              border: "none",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              padding: "0 16px",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
            }}
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
