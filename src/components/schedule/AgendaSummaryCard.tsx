export interface AgendaSummaryCardProps {
  jumlahHariIni: number;
}

export default function AgendaSummaryCard({
  jumlahHariIni,
}: AgendaSummaryCardProps) {
  return (
    <div
      style={{
        width: "100%",
        borderRadius: "20px",
        background: "linear-gradient(135deg, #3688f5 0%, #1c68d4 100%)",
        color: "#ffffff",
        boxSizing: "border-box",
        boxShadow: "0 8px 24px rgba(54, 136, 245, 0.28)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
      className="p-5 sm:p-6 lg:p-7 rounded-[22px]"
    >
      {/* Aksen lingkaran abstrak lembut di latar belakang kartu */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-30px",
          right: "-30px",
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "-40px",
          left: "20px",
          width: "110px",
          height: "110px",
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          pointerEvents: "none",
        }}
      />

      {/* Bagian Atas: Label & Ikon Kalender Putih */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.95)",
            letterSpacing: "0.2px",
          }}
          className="text-sm sm:text-base font-semibold"
        >
          Agenda Hari ini
        </span>

        {/* Kotak putih rounded dengan ikon kalender */}
        <div
          aria-hidden="true"
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            color: "#3688f5",
          }}
        >
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            {/* Titik indikator tanggal di dalam kalender */}
            <circle cx="8" cy="14" r="1" fill="currentColor" />
            <circle cx="12" cy="14" r="1" fill="currentColor" />
            <circle cx="16" cy="14" r="1" fill="currentColor" />
            <circle cx="8" cy="18" r="1" fill="currentColor" />
            <circle cx="12" cy="18" r="1" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Bagian Tengah: Angka Besar + Teks Kegiatan Terjadwal */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "10px",
          margin: "12px 0 6px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.5px",
          }}
          className="text-4xl sm:text-5xl font-extrabold"
        >
          {jumlahHariIni}
        </span>
        <span
          style={{
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.95)",
          }}
          className="text-sm sm:text-base font-semibold"
        >
          Kegiatan Terjadwal
        </span>
      </div>

      {/* Bagian Bawah: Teks Penyemangat */}
      <p
        style={{
          margin: 0,
          fontWeight: 500,
          color: "rgba(255, 255, 255, 0.88)",
          lineHeight: 1.4,
          position: "relative",
          zIndex: 1,
        }}
        className="text-xs sm:text-sm font-medium"
      >
        Tetap semangat, jadwal kamu produktif!
      </p>
    </div>
  );
}
