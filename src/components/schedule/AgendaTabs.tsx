"use client";

export type AgendaTab = "Semua" | "Hari Ini" | "Besok";

export interface AgendaTabsProps {
  activeTab: AgendaTab;
  onTabChange: (tab: AgendaTab) => void;
  onClockClick?: () => void;
}

export default function AgendaTabs({
  activeTab,
  onTabChange,
  onClockClick,
}: AgendaTabsProps) {
  const tabs: AgendaTab[] = ["Semua", "Hari Ini", "Besok"];

  return (
    <div
      role="tablist"
      aria-label="Filter Agenda Berdasarkan Waktu"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        marginTop: "20px",
        marginBottom: "18px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Kelompok Tab Pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab)}
              style={{
                minHeight: "44px",
                minWidth: "44px",
                padding: "8px 20px",
                borderRadius: "9999px",
                fontSize: "13px",
                fontWeight: isActive ? 700 : 600,
                color: isActive ? "#ffffff" : "#475569",
                backgroundColor: isActive ? "#3688f5" : "#f1f5f9",
                border: isActive ? "1px solid #3688f5" : "1px solid #e2e8f0",
                boxShadow: isActive
                  ? "0 4px 12px rgba(54, 136, 245, 0.25)"
                  : "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="hover:opacity-90 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3688f5]"
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Ikon Jam di Sisi Kanan */}
      <button
        type="button"
        onClick={onClockClick}
        aria-label="Urutkan atau filter berdasarkan waktu"
        style={{
          width: "44px",
          height: "44px",
          minWidth: "44px",
          minHeight: "44px",
          borderRadius: "9999px",
          backgroundColor: "#f1f5f9",
          border: "1px solid #e2e8f0",
          color: "#475569",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.15s ease",
          padding: 0,
        }}
        className="hover:bg-[#e2e8f0] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3688f5]"
      >
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
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </button>
    </div>
  );
}
