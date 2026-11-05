"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Header from "./Header";
import Dots from "./Dots";

type Props = { email: string; onBack: () => void; onNext: () => void };

const START = 60;

export default function OtpConfirm({ email, onBack, onNext }: Props) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(START);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    setErrorMsg("");
    setCode((c) => c.map((x, idx) => (idx === i ? d : x)));
    if (d && i < code.length - 1) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const token = code.join("");
  const complete = token.length >= 4 && code.slice(0, 4).every(Boolean);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  async function handleVerify() {
    if (!complete || verifying) return;
    if (!email.trim()) {
      setErrorMsg("Alamat email tidak ditemukan. Silakan kembali dan masukkan email.");
      return;
    }

    setErrorMsg("");
    setVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: "recovery",
      });
      if (error) {
        setErrorMsg(error.message || "Kode OTP tidak valid atau sudah kedaluwarsa.");
        setVerifying(false);
        return;
      }
      onNext();
    } catch {
      setErrorMsg("Gagal memverifikasi kode OTP.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (seconds > 0) return;
    setErrorMsg("");
    setSeconds(START);
    setCode(["", "", "", "", "", ""]);
    refs.current[0]?.focus();
    if (email.trim()) {
      await supabase.auth.resetPasswordForEmail(email.trim()).catch(() => {});
    }
  }

  return (
    <>
      <Header title="Konfirmasi" onBack={onBack} />
      <section className="fp-section">
        <div className="fp-otp-badge">
          <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>

        <h2 className="fp-heading fp-heading--muted">Masukan OTP</h2>
        <p className="fp-otp-text">Kode pemulihan telah dikirim ke ...</p>
        <p className="fp-otp-email">{email || "email@anda.com"}</p>

        <div className="fp-otp-row">
          {code.slice(0, 4).map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              inputMode="numeric"
              maxLength={1}
              aria-label={`Digit OTP ${i + 1}`}
              className="fp-otp-input"
            />
          ))}
        </div>

        {errorMsg && <p className="fp-error">{errorMsg}</p>}

        <button
          type="button"
          disabled={!complete || verifying}
          onClick={handleVerify}
          className="fp-button"
        >
          {verifying ? "Memverifikasi..." : "Verify"}
        </button>

        <button
          type="button"
          disabled={seconds > 0}
          onClick={handleResend}
          className="fp-resend"
        >
          Kirim ulang OTP{" "}
          {seconds > 0 ? <span className="fp-accent">({mm}:{ss})</span> : <span className="fp-accent">sekarang</span>}
        </button>
      </section>
      <Dots total={2} active={1} />
    </>
  );
}
