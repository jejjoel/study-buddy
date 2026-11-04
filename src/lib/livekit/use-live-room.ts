"use client";

// app/lib/useLiveRoom.ts
// Menghubungkan room StudyBuddy ke LiveKit supaya mic, kamera, dan share screen
// terkirim ke peserta lain (dan sebaliknya).

import { useEffect, useRef, useState } from "react";
import {
  Room as LiveKitRoom,
  RoomEvent,
  Track,
  type LocalTrackPublication,
  type RemoteTrack,
} from "livekit-client";
import { supabase } from "@/lib/supabase/client";

export interface RemoteInfo {
  id: string;
  nama: string;
  cameraStream: MediaStream | null;
  screenStream: MediaStream | null;
  micOn: boolean;
  speaking: boolean;
}

interface UseLiveRoomArgs {
  roomId: string | null;
  me: { id: string; nama: string } | null;
  /** Aktifkan setelah user berhasil join room */
  enabled: boolean;
  micStream: MediaStream | null;
  cameraStream: MediaStream | null;
  screenStream: MediaStream | null;
  isMicOn: boolean;
  onError?: (pesan: string) => void;
}

function snapshot(room: LiveKitRoom): Record<string, RemoteInfo> {
  const hasil: Record<string, RemoteInfo> = {};
  room.remoteParticipants.forEach((p) => {
    const cam = p.getTrackPublication(Track.Source.Camera);
    const screen = p.getTrackPublication(Track.Source.ScreenShare);
    const mic = p.getTrackPublication(Track.Source.Microphone);
    hasil[p.identity] = {
      id: p.identity,
      nama: p.name || p.identity,
      cameraStream: cam && !cam.isMuted ? (cam.track?.mediaStream ?? null) : null,
      screenStream: screen && !screen.isMuted ? (screen.track?.mediaStream ?? null) : null,
      micOn: Boolean(mic && !mic.isMuted),
      speaking: p.isSpeaking,
    };
  });
  return hasil;
}

export function useLiveRoom({
  roomId,
  me,
  enabled,
  micStream,
  cameraStream,
  screenStream,
  isMicOn,
  onError,
}: UseLiveRoomArgs) {
  const [liveRoom, setLiveRoom] = useState<LiveKitRoom | null>(null);
  const [remotes, setRemotes] = useState<Record<string, RemoteInfo>>({});
  const micPubRef = useRef<LocalTrackPublication | null>(null);
  const isMicOnRef = useRef(isMicOn);
  const onErrorRef = useRef(onError);
  const meId = me?.id ?? null;
  const meNama = me?.nama ?? "";

  useEffect(() => {
    onErrorRef.current = onError;
    isMicOnRef.current = isMicOn;
  }, [onError, isMicOn]);

  // 1. Hubungkan ke LiveKit setelah user join room
  useEffect(() => {
    if (!roomId || !meId || !enabled) return;

    let batal = false;
    const room = new LiveKitRoom({ adaptiveStream: false, dynacast: false });
    const audioEls = new Set<HTMLMediaElement>();

    const update = () => {
      if (!batal) setRemotes(snapshot(room));
    };

    const onSubscribed = (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Audio) {
        const el = track.attach();
        el.style.display = "none";
        document.body.appendChild(el);
        audioEls.add(el);
      }
      update();
    };
    const onUnsubscribed = (track: RemoteTrack) => {
      track.detach().forEach((el) => {
        el.remove();
        audioEls.delete(el);
      });
      update();
    };
    const onAudioBlocked = () => {
      if (!room.canPlaybackAudio) room.startAudio().catch(() => {});
    };

    room
      .on(RoomEvent.TrackSubscribed, onSubscribed)
      .on(RoomEvent.TrackUnsubscribed, onUnsubscribed)
      .on(RoomEvent.TrackMuted, update)
      .on(RoomEvent.TrackUnmuted, update)
      .on(RoomEvent.TrackPublished, update)
      .on(RoomEvent.ParticipantConnected, update)
      .on(RoomEvent.ParticipantDisconnected, update)
      .on(RoomEvent.ActiveSpeakersChanged, update)
      .on(RoomEvent.AudioPlaybackStatusChanged, onAudioBlocked);

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;
        if (!accessToken) throw new Error("Sesi login tidak ditemukan.");

        const res = await fetch("/api/livekit-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ roomId, nama: meNama }),
        });
        const json = (await res.json().catch(() => ({}))) as {
          token?: string;
          url?: string;
          error?: string;
        };
        if (!res.ok || !json.token || !json.url) {
          throw new Error(json.error || "Gagal mengambil token video.");
        }

        await room.connect(json.url, json.token);
        if (batal) {
          room.disconnect();
          return;
        }
        room.startAudio().catch(() => {});
        setLiveRoom(room);
        update();
      } catch (err) {
        if (!batal) {
          const pesan = err instanceof Error ? err.message : "Gagal terhubung ke video room.";
          onErrorRef.current?.(pesan);
        }
      }
    })();

    return () => {
      batal = true;
      audioEls.forEach((el) => el.remove());
      audioEls.clear();
      room.removeAllListeners();
      room.disconnect();
      micPubRef.current = null;
      setLiveRoom(null);
      setRemotes({});
    };
  }, [roomId, meId, meNama, enabled]);

  // 2. Kirim mikrofon
  useEffect(() => {
    const track = micStream?.getAudioTracks()[0];
    if (!liveRoom || !track) return;
    let aktif = true;

    liveRoom.localParticipant
      .publishTrack(track, { source: Track.Source.Microphone })
      .then((pub) => {
        if (!aktif) return;
        micPubRef.current = pub;
        if (!isMicOnRef.current) pub.mute().catch(() => {});
      })
      .catch(() => onErrorRef.current?.("Gagal mengirim suara ke room."));

    return () => {
      aktif = false;
      micPubRef.current = null;
      liveRoom.localParticipant.unpublishTrack(track, false).catch(() => {});
    };
  }, [liveRoom, micStream]);

  // Sinkronkan status mute mic ke peserta lain
  useEffect(() => {
    const pub = micPubRef.current;
    if (!pub) return;
    if (isMicOn) pub.unmute().catch(() => {});
    else pub.mute().catch(() => {});
  }, [isMicOn, liveRoom, micStream]);

  // 3. Kirim kamera
  useEffect(() => {
    const track = cameraStream?.getVideoTracks()[0];
    if (!liveRoom || !track) return;

    liveRoom.localParticipant
      .publishTrack(track, { source: Track.Source.Camera })
      .catch(() => onErrorRef.current?.("Gagal mengirim video kamera."));

    return () => {
      liveRoom.localParticipant.unpublishTrack(track, false).catch(() => {});
    };
  }, [liveRoom, cameraStream]);

  // 4. Kirim share screen
  useEffect(() => {
    const track = screenStream?.getVideoTracks()[0];
    if (!liveRoom || !track) return;

    liveRoom.localParticipant
      .publishTrack(track, { source: Track.Source.ScreenShare })
      .catch(() => onErrorRef.current?.("Gagal membagikan layar."));

    return () => {
      liveRoom.localParticipant.unpublishTrack(track, false).catch(() => {});
    };
  }, [liveRoom, screenStream]);

  return { remotes, connected: liveRoom !== null };
}
