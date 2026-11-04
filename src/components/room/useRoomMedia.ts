"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface UseRoomMediaReturn {
  isMicOn: boolean;
  isCamOn: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  isScreenShareSupported: boolean;
  micStream: MediaStream | null;
  cameraStream: MediaStream | null;
  screenStream: MediaStream | null;
  toastMessage: string | null;
  toggleMic: () => Promise<void>;
  toggleCam: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  captureScreenshot: () => void;
  showToast: (msg: string) => void;
  hideToast: () => void;
}

export function useRoomMedia(): UseRoomMediaReturn {
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isScreenShareSupported] = useState<boolean>(() => {
    return (
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getDisplayMedia === "function"
    );
  });
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const audioStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fungsi helper menampilkan Toast
  const showToast = useCallback((pesan: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(pesan);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  const hideToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(null);
  }, []);

  // Penanganan error getUserMedia / getDisplayMedia dalam Bahasa Indonesia
  const handleMediaError = useCallback(
    (err: unknown) => {
      const error = err as { name?: string; message?: string };
      if (error?.name === "NotAllowedError") {
        showToast("Izin akses mikrofon atau kamera ditolak.");
      } else if (error?.name === "NotFoundError") {
        showToast("Perangkat mikrofon atau kamera tidak ditemukan.");
      } else if (error?.name === "NotReadableError") {
        showToast("Perangkat sedang digunakan oleh aplikasi lain.");
      } else {
        showToast("Gagal mengakses perangkat media.");
      }
    },
    [showToast]
  );

  // Setup AnalyserNode untuk deteksi berbicara (AudioContext)
  const setupAudioDetection = useCallback((stream: MediaStream) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!ctx || ctx.state === "closed") return;

        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        const audioTrack = stream.getAudioTracks()[0];
        // Jika mic aktif dan volume melebihi ambang batas suara
        if (audioTrack && audioTrack.enabled && average > 24) {
          setIsSpeaking(true);
        } else {
          setIsSpeaking(false);
        }

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch {
      // Abaikan jika browser membatasi AudioContext autoplay
    }
  }, []);

  // 1. Toggle Mikrofon
  const toggleMic = useCallback(async () => {
    try {
      // Jika belum pernah meminta izin mic, panggil getUserMedia({audio: true})
      if (!audioStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        audioStreamRef.current = stream;
        setMicStream(stream);
        setIsMicOn(true);
        setupAudioDetection(stream);
      } else {
        // Toggle lewat track.enabled
        const audioTrack = audioStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
          const nextState = !audioTrack.enabled;
          audioTrack.enabled = nextState;
          setIsMicOn(nextState);
          if (!nextState) {
            setIsSpeaking(false);
          }
        }
      }
    } catch (err) {
      handleMediaError(err);
    }
  }, [handleMediaError, setupAudioDetection]);

  // 2. Toggle Kamera
  const toggleCam = useCallback(async () => {
    // Jika kamera aktif, matikan dengan track.stop()
    if (isCamOn) {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
      setCameraStream(null);
      setIsCamOn(false);
    } else {
      // Nyalakan kamera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        cameraStreamRef.current = stream;
        setCameraStream(stream);
        setIsCamOn(true);
      } catch (err) {
        handleMediaError(err);
      }
    }
  }, [isCamOn, handleMediaError]);

  // 3. Toggle Berbagi Layar (Share Screen)
  const toggleScreenShare = useCallback(async () => {
    if (!isScreenShareSupported) {
      showToast("Berbagi layar belum didukung di perangkat ini");
      return;
    }

    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      setScreenStream(null);
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        screenStreamRef.current = stream;
        setScreenStream(stream);
        setIsScreenSharing(true);

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          // Dengarkan event ended agar tombol ikut berubah jika user menghentikan share dari browser
          videoTrack.addEventListener("ended", () => {
            screenStreamRef.current = null;
            setScreenStream(null);
            setIsScreenSharing(false);
          });
        }
      } catch (err: unknown) {
        const error = err as { name?: string };
        if (error?.name !== "AbortError") {
          handleMediaError(err);
        }
      }
    }
  }, [isScreenShareSupported, isScreenSharing, showToast, handleMediaError]);

  // 4. Tangkapan Layar (Screenshot ke Canvas -> Download PNG)
  const captureScreenshot = useCallback(() => {
    const stream = screenStreamRef.current || cameraStreamRef.current;
    if (!stream) {
      showToast("Nyalakan kamera atau share screen dulu");
      return;
    }

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) {
      showToast("Nyalakan kamera atau share screen dulu");
      return;
    }

    // Buat elemen video temporer untuk menangkap frame terkini
    const videoEl = document.createElement("video");
    videoEl.srcObject = stream;
    videoEl.muted = true;
    videoEl.playsInline = true;

    videoEl.onloadedmetadata = async () => {
      try {
        await videoEl.play();
        const canvas = document.createElement("canvas");
        canvas.width = videoEl.videoWidth || 1280;
        canvas.height = videoEl.videoHeight || 720;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Jika kamera lokal, mirror gambar agar sesuai preview
          if (!screenStreamRef.current && cameraStreamRef.current) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

          // Unduh sebagai PNG
          const dataUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.download = `StudyBuddy-Screenshot-${Date.now()}.png`;
          downloadLink.href = dataUrl;
          downloadLink.click();
          showToast("Tangkapan layar berhasil disimpan");
        }
      } catch {
        showToast("Gagal mengambil tangkapan layar");
      } finally {
        videoEl.pause();
        videoEl.srcObject = null;
      }
    };
  }, [showToast]);

  // Cleanup: Hentikan semua track dan tutup AudioContext saat unmount / pagehide
  useEffect(() => {
    const cleanup = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
      }
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };

    window.addEventListener("pagehide", cleanup);
    return () => {
      cleanup();
      window.removeEventListener("pagehide", cleanup);
    };
  }, []);

  return {
    isMicOn,
    isCamOn,
    isScreenSharing,
    isSpeaking,
    isScreenShareSupported,
    micStream,
    cameraStream,
    screenStream,
    toastMessage,
    toggleMic,
    toggleCam,
    toggleScreenShare,
    captureScreenshot,
    showToast,
    hideToast,
  };
}
