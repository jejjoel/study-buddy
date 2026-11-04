"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StageView from "@/components/room/StageView";
import ParticipantTile from "@/components/room/ParticipantTile";
import ControlBar from "@/components/room/ControlBar";
import ChatPanel from "@/components/room/ChatPanel";
import JoinRoomSheet from "@/components/room/JoinRoomSheet";
import LeaveConfirmDialog from "@/components/room/LeaveConfirmDialog";
import { useRoomMedia } from "@/components/room/useRoomMedia";
import { useLiveRoom } from "@/lib/livekit/use-live-room";
import {
  useMe,
  useRoomById,
  useRoomParticipants,
  useRoomMessages,
  joinRoom,
  heartbeatRoom,
  leaveRoom,
  roomErrorMessage,
} from "@/lib/services/room";
import "./room.css";

function RoomContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  // User yang sedang login + data room dari Supabase
  const me = useMe();
  const meId = me?.id ?? "";
  const { room, loading: loadingRoom } = useRoomById(id);
  const roomId = room?.id ?? null;

  // Status bergabung ke room (sebelum gabung, tampilkan sheet 'Siap bergabung?')
  const [sudahGabung, setSudahGabung] = useState(false);
  const [bukaChat, setBukaChat] = useState(false);
  const [bukaDialogKeluar, setBukaDialogKeluar] = useState(false);

  // Peserta & chat room (Realtime). Chat baru aktif setelah user berhasil join.
  const { members: daftarPeserta, refresh: refreshPeserta } = useRoomParticipants(roomId);
  const { messages, send: kirimPesan } = useRoomMessages(roomId, sudahGabung);

  // Hook manajemen media lokal
  const media = useRoomMedia();

  // Video/suara antar peserta lewat LiveKit (aktif setelah user join)
  const live = useLiveRoom({
    roomId,
    me,
    enabled: sudahGabung,
    micStream: media.micStream,
    cameraStream: media.cameraStream,
    screenStream: media.screenStream,
    isMicOn: media.isMicOn,
    onError: media.showToast,
  });

  // Alur Masuk (Gabung Room). Mengembalikan pesan error, atau null jika berhasil.
  const handleJoinRoom = useCallback(
    async (
      micState: boolean,
      camState: boolean,
      password: string
    ): Promise<string | null> => {
      if (!room || !me) return "Data room belum siap. Coba lagi.";

      try {
        await joinRoom(room.id, password || null, me.nama);
      } catch (err) {
        return roomErrorMessage(err);
      }

      await refreshPeserta();
      setSudahGabung(true);

      // Toast: "<nama> bergabung"
      media.showToast(`${me.nama} bergabung`);

      // Nyalakan mic/kamera jika dipilih aktif pada sheet pra-gabung
      if (micState) {
        await media.toggleMic();
      }
      if (camState) {
        await media.toggleCam();
      }
      return null;
    },
    [room, me, media, refreshPeserta]
  );

  // Alur Keluar (Leave Room). Penghapusan peserta dilakukan oleh cleanup effect heartbeat di bawah.
  const handleLeaveRoom = useCallback(() => {
    if (!room) return;

    // Hentikan media jika masih menyala
    if (media.isCamOn) media.toggleCam();
    if (media.isScreenSharing) media.toggleScreenShare();

    setBukaDialogKeluar(false);
    setSudahGabung(false);

    // Navigasi kembali ke /room-server
    router.push("/rooms");
  }, [room, media, router]);

  // Selama berada di room: heartbeat tiap 20 detik agar tetap tercatat aktif.
  // Saat keluar / pindah halaman / tab ditutup: keluar dari room di server.
  useEffect(() => {
    if (!roomId || !sudahGabung) return;

    const timer = setInterval(() => {
      heartbeatRoom(roomId)
        .then((masihPeserta) => {
          if (!masihPeserta) {
            // Row peserta hilang = room sudah dihapus oleh host
            alert("Room ini sudah dihapus oleh host.");
            router.push("/rooms");
          }
        })
        .catch(() => {});
    }, 20000);

    const handlePageHide = () => {
      leaveRoom(roomId).catch(() => {});
    };
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      clearInterval(timer);
      window.removeEventListener("pagehide", handlePageHide);
      leaveRoom(roomId).catch(() => {});
    };
  }, [roomId, sudahGabung, router]);

  // Kirim pesan chat
  const handleKirimPesan = useCallback(
    async (isi: string) => {
      if (!me) return;
      try {
        await kirimPesan(isi, me.nama);
      } catch (err) {
        console.error("Gagal mengirim pesan:", err);
        media.showToast("Pesan gagal terkirim. Coba lagi.");
      }
    },
    [me, kirimPesan, media]
  );

  // Menunggu data room & identitas user
  if (loadingRoom || (room && !me)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          maxWidth: "430px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        Memuat room...
      </div>
    );
  }

  // Jika room tidak ditemukan, tampilkan pesan error + tombol kembali
  if (!room) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          maxWidth: "430px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#edf5ff",
            color: "#3688f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="2" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: "#26354b",
            margin: "0 0 8px 0",
          }}
        >
          Room tidak ditemukan
        </h1>

        <p
          style={{
            fontSize: "13px",
            color: "#64748b",
            margin: "0 0 24px 0",
            lineHeight: 1.6,
          }}
        >
          ID atau kode room yang Anda tuju tidak valid atau sesi belajar telah
          berakhir.
        </p>

        <Link
          href="/rooms"
          style={{
            minHeight: "44px",
            padding: "0 22px",
            borderRadius: "9999px",
            backgroundColor: "#3688f5",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 700,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(54, 136, 245, 0.25)",
          }}
        >
          Kembali ke Room Server
        </Link>
      </main>
    );
  }

  // Presenter layar
  // Panggung: tampilkan share screen sendiri, atau milik peserta lain jika ada
  const remoteScreen = Object.values(live.remotes).find((r) => r.screenStream);
  const stageStream = media.screenStream ?? remoteScreen?.screenStream ?? null;
  const presenter = media.screenStream
    ? me?.nama || ""
    : remoteScreen?.nama || daftarPeserta[0]?.nama || me?.nama || "";
  const roomNama = room.nama || (room as unknown as { title?: string })?.title || "Room Belajar";
  const roomKode = room.kode || (room as unknown as { code?: string })?.code || "0000";

  return (
    <div className="room-page-wrapper">
      {/* Toast Notifikasi / Error Media Bahasa Indonesia */}
      {media.toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 150,
            backgroundColor: "#1e293b",
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: "9999px",
            fontSize: "12px",
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            maxWidth: "90%",
            textAlign: "center",
          }}
        >
          <span>{media.toastMessage}</span>
        </div>
      )}

      {/* Header Room */}
      <header
        style={{
          width: "100%",
          height: "60px",
          minHeight: "60px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e7edf5",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px 0 8px",
          position: "sticky",
          top: 0,
          zIndex: 40,
          boxSizing: "border-box",
        }}
      >
        {/* Sisi Kiri: Tombol Kembali + Judul & Subjudul */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: 0,
            flex: 1,
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (sudahGabung) {
                setBukaDialogKeluar(true);
              } else {
                router.push("/rooms");
              }
            }}
            aria-label="Kembali ke Room Server"
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

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              flex: 1,
            }}
          >
            {/* Judul Room (dipotong "...") */}
            <h1
              title={roomNama}
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#26354b",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "320px",
              }}
            >
              {roomNama}
            </h1>

            {/* Subjudul: Code Room: <kode> • N Peserta */}
            <span
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "#64748b",
                marginTop: "2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Code Room: {roomKode} • {daftarPeserta.length} Peserta
            </span>
          </div>
        </div>

        {/* Sisi Kanan: Tombol Menu Bulat Biru Kecil */}
        <button
          type="button"
          aria-label="Menu opsi room"
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
            padding: 0,
          }}
        >
          <span
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              backgroundColor: "#3688f5",
              color: "#ffffff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(54, 136, 245, 0.25)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
              <circle cx="5" cy="12" r="1.5" />
            </svg>
          </span>
        </button>
      </header>

      {/* Konten Utama Responsif (Mobile: 1 kolom; Desktop: 2 kolom) */}
      <main className="room-main-container">
        {/* Kolom / Area Utama */}
        <div className="room-primary-area">
          {/* Di Desktop (>=1024px): Strip thumbnail peserta di atas panggung */}
          <section
            aria-label="Thumbnail Peserta"
            className="room-desktop-strip"
          >
            {daftarPeserta.map((peserta) => {
              const isLocalUser = peserta.id === meId;

              return (
                <ParticipantTile
                  key={`strip-${peserta.id}`}
                  member={peserta}
                  isLocalUser={isLocalUser}
                  localCameraStream={isLocalUser ? media.cameraStream : null}
                  isLocalSpeaking={isLocalUser ? media.isSpeaking : undefined}
                  isLocalMicOn={isLocalUser ? media.isMicOn : undefined}
                  remoteCameraStream={live.remotes[peserta.id]?.cameraStream ?? null}
                  remoteSpeaking={live.remotes[peserta.id]?.speaking}
                  remoteMicOn={live.remotes[peserta.id]?.micOn}
                  compact={true}
                />
              );
            })}
          </section>

          {/* Panggung 16:9 Rounded dengan Overlay */}
          <StageView
            presenterName={presenter}
            screenStream={stageStream}
          />

          {/* Di Mobile (<768px) & Tablet (768-1023px): Grid Peserta di Bawah Panggung */}
          <section
            aria-label="Daftar Peserta Room"
            className="room-mobile-participants"
          >
            <h2
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#26354b",
                margin: "0 0 12px 0",
              }}
            >
              Peserta ({daftarPeserta.length})
            </h2>

            {/* Grid 2 Kolom (Mobile) atau 3 Kolom (Tablet) */}
            <div className="room-participants-grid">
              {daftarPeserta.map((peserta) => {
                const isLocalUser = peserta.id === meId;

                return (
                  <ParticipantTile
                    key={peserta.id}
                    member={peserta}
                    isLocalUser={isLocalUser}
                    localCameraStream={isLocalUser ? media.cameraStream : null}
                    isLocalSpeaking={isLocalUser ? media.isSpeaking : undefined}
                    isLocalMicOn={isLocalUser ? media.isMicOn : undefined}
                    remoteCameraStream={live.remotes[peserta.id]?.cameraStream ?? null}
                    remoteSpeaking={live.remotes[peserta.id]?.speaking}
                    remoteMicOn={live.remotes[peserta.id]?.micOn}
                  />
                );
              })}
            </div>
          </section>

          {/* Control bar khusus Desktop berupa pill biru muda di tengah bawah */}
          <div className="room-desktop-controlbar">
            <ControlBar
              isMicOn={media.isMicOn}
              isCamOn={media.isCamOn}
              isScreenSharing={media.isScreenSharing}
              isScreenShareSupported={media.isScreenShareSupported}
              onToggleMic={media.toggleMic}
              onToggleCam={media.toggleCam}
              onToggleScreenShare={media.toggleScreenShare}
              onCaptureScreenshot={media.captureScreenshot}
              onOpenChat={() => setBukaChat(true)}
              onLeaveClick={() => setBukaDialogKeluar(true)}
              isPill={true}
            />
          </div>
        </div>

        {/* Sidebar Kanan Desktop (±340px) */}
        {/* Sidebar Kanan di Layar Desktop (Panel Obrolan Room) */}
        <aside
          aria-label="Panel Samping Room"
          className="room-desktop-sidebar"
        >
          {/* Panel Chat yang Selalu Tampil di Desktop */}
          <ChatPanel
            isOpen={true}
            onClose={() => {}}
            embedded={true}
            messages={messages}
            meId={meId}
            onSend={handleKirimPesan}
          />
        </aside>

      </main>

      {/* Panel Kontrol di Mobile & Tablet (Menempel di Bagian Bawah) */}
      <div className="room-mobile-controlbar">
        <ControlBar
          isMicOn={media.isMicOn}
          isCamOn={media.isCamOn}
          isScreenSharing={media.isScreenSharing}
          isScreenShareSupported={media.isScreenShareSupported}
          onToggleMic={media.toggleMic}
          onToggleCam={media.toggleCam}
          onToggleScreenShare={media.toggleScreenShare}
          onCaptureScreenshot={media.captureScreenshot}
          onOpenChat={() => setBukaChat(true)}
          onLeaveClick={() => setBukaDialogKeluar(true)}
          isPill={false}
        />
      </div>

      {/* Bottom Sheet "Siap bergabung?" sebelum masuk live room */}
      <JoinRoomSheet
        isOpen={!sudahGabung}
        room={room}
        currentParticipants={daftarPeserta}
        meId={meId}
        meNama={me?.nama ?? ""}
        onJoin={handleJoinRoom}
        onCancel={() => {
          if (room) {
            leaveRoom(room.id).catch(() => {});
          }
          router.push("/rooms");
        }}
      />

      {/* Dialog Konfirmasi "Keluar dari room?" */}
      <LeaveConfirmDialog
        isOpen={bukaDialogKeluar}
        onConfirm={handleLeaveRoom}
        onCancel={() => setBukaDialogKeluar(false)}
      />

      {/* Panel Obrolan (Chat Bottom Sheet untuk Mobile & Tablet) */}
      <ChatPanel
        isOpen={bukaChat}
        onClose={() => setBukaChat(false)}
        embedded={false}
        messages={messages}
        meId={meId}
        onSend={handleKirimPesan}
      />
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#ffffff",
            maxWidth: "430px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Memuat room...
        </div>
      }
    >
      <RoomContent />
    </Suspense>
  );
}
