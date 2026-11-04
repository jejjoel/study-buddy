import Link from "next/link";
import type { Room } from "@/types/room";

export interface RoomCardProps {
  room: Room;
  isHost?: boolean; // true jika user yang login adalah pembuat room
  onDelete?: (room: Room) => void;
}

export default function RoomCard({ room, isHost = false, onDelete }: RoomCardProps) {
  // Parsing defensif untuk mencegah runtime error jika ada data tersimpan yang tidak lengkap
  const roomId = room?.id || "";
  const roomNama =
    room?.nama ||
    (room as unknown as { title?: string })?.title ||
    (room as unknown as { name?: string })?.name ||
    "Room Belajar";
  const roomKategori =
    room?.kategori ||
    (room as unknown as { category?: string })?.category ||
    "";
  const roomPeserta =
    typeof room?.peserta === "number" ? room.peserta : 1;
  const roomKapasitas =
    typeof room?.kapasitas === "number"
      ? room.kapasitas
      : typeof (room as unknown as { maxParticipants?: number })?.maxParticipants === "number"
      ? (room as unknown as { maxParticipants: number }).maxParticipants
      : 50;

  // Jumlah peserta aktif datang langsung dari database (lewat daftar room)
  const jumlahPeserta = roomPeserta;

  const isPenuh = jumlahPeserta >= roomKapasitas;

  // Inisial 2 karakter dari nama room (contoh: "UI/UX Design" -> "UI", "Cyber Security" -> "CS")
  const inisial = (roomNama || "RB")
    .split(/[\s/]+/)
    .filter(Boolean)
    .map((kata) => kata[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "RB";


  return (
    <article
      style={{
        border: "1.5px solid #d4e5ff",
        borderRadius: "18px",
        backgroundColor: "#ffffff",
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "14px",
        boxShadow: "0 2px 10px rgba(54, 136, 245, 0.05)",
        boxSizing: "border-box",
        width: "100%",
        transition: "all 0.2s ease",
      }}
      className="w-full hover:border-[#3688f5] hover:shadow-md transition-all duration-200"
    >
      {/* Sisi Kiri: Thumbnail Bulat + Informasi Room */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          minWidth: 0,
          flex: 1,
        }}
      >
        {/* Thumbnail bulat di kiri (gradasi biru muda dengan inisial) */}
        <div
          aria-hidden="true"
          style={{
            width: "50px",
            height: "50px",
            minWidth: "50px",
            minHeight: "50px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #e4efff 0%, #c8e1ff 100%)",
            border: "2px solid #ffffff",
            boxShadow: "0 2px 6px rgba(54, 136, 245, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#2474e5",
            fontWeight: 800,
            fontSize: "15px",
            letterSpacing: "-0.5px",
            userSelect: "none",
            flexShrink: 0,
          }}
        >
          {inisial}
        </div>

        {/* Bagian Tengah: Nama Room & Teks "Live" Merah */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            title={roomNama}
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#26354b",
              margin: "0 0 4px 0",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            className="text-sm md:text-base font-bold text-[#26354b]"
          >
            {roomNama}
          </h2>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#ef4444",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "#ef4444",
                display: "inline-block",
              }}
            />
            <span>Live</span>
            {roomKategori && (
              <>
                <span style={{ color: "#cbd5e1" }}>•</span>
                <span
                  style={{
                    color: "#64748b",
                    fontWeight: 500,
                    fontSize: "11px",
                  }}
                >
                  {roomKategori}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sisi Kanan: Jumlah Peserta (atas) & Tombol Join (bawah) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "space-between",
          minHeight: "58px",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        {/* Jumlah peserta dengan ikon orang (contoh: 7/10) */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            color: "#64748b",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {isHost && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(room)}
              aria-label={`Hapus room ${roomNama}`}
              title="Hapus room"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px",
                marginRight: "6px",
                background: "transparent",
                border: "none",
                borderRadius: "8px",
                color: "#ef4444",
                cursor: "pointer",
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
                aria-hidden="true"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          )}
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>
            {jumlahPeserta}/{roomKapasitas}
          </span>
        </div>

        {/* Pill Biru Join (atau disabled jika penuh) */}
        {isPenuh ? (
          <button
            type="button"
            disabled
            aria-label={`Room ${roomNama} sudah penuh`}
            style={{
              minWidth: "68px",
              minHeight: "44px",
              padding: "0 18px",
              borderRadius: "9999px",
              backgroundColor: "#cbd5e1",
              color: "#ffffff",
              border: "none",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "not-allowed",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Penuh
          </button>
        ) : (
          <Link
            href={`/rooms/${roomId}`}
            aria-label={`Gabung room ${roomNama}`}
            style={{
              minWidth: "68px",
              minHeight: "44px",
              padding: "0 18px",
              borderRadius: "9999px",
              backgroundColor: "#3688f5",
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "12px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.15s ease, transform 0.1s ease",
            }}
            className="hover:bg-[#2573e0] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3688f5]"
          >
            Join
          </Link>
        )}

      </div>
    </article>
  );
}
