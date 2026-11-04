"use client";

import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import Dots from "./Dots";

type Props = { email: string; onBack: () => void; onNext: () => void };

const START = 12;

export default function OtpConfirm({ email, onBack, onNext }: Props) {
  const [code, setCode] = useState(["", "", "", ""]);
  const [seconds, setSeconds] = useState(START);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    setCode((c) => c.map((x, idx) => (idx === i ? d : x)));
    if (d && i < 3) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const complete = code.every(Boolean);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

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
        <p className="fp-otp-text">Kode OTP 4 digit telah dikirim ke ...</p>
        <p className="fp-otp-email">{email || "email@anda.com"}</p>

        <div className="fp-otp-row">
          {code.map((d, i) => (
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

        <button type="button" disabled={!complete} onClick={onNext} className="fp-button">
          Verify
        </button>

        <button
          type="button"
          disabled={seconds > 0}
          onClick={() => { setSeconds(START); setCode(["", "", "", ""]); refs.current[0]?.focus(); }}
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
