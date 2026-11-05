"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Header from "./Header";
import Dots from "./Dots";

type Props = { email: string; setEmail: (v: string) => void; onNext: () => void };

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function ForgotPassword({ email, setEmail, onNext }: Props) {
  const valid = isValidEmail(email);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSendOtp() {
    if (!valid || loading) return;
    setErrorMsg("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        setErrorMsg(error.message || "Gagal mengirim kode pemulihan.");
        setLoading(false);
        return;
      }
      onNext();
    } catch {
      setErrorMsg("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="Lupa Sandi" />
      <section className="fp-section">
        <img
          src="/images/lupa-sandi.png"
          alt="Ilustrasi lupa kata sandi"
          className="fp-illustration"
        />

        <h2 className="fp-heading">Lupa Kata Sandi?</h2>
        <p className="fp-lead">
          Jangan khawatir! Hal seperti ini bisa terjadi. Silakan masukkan alamat email yang terkait dengan akun Anda.
        </p>

        <label htmlFor="email" className="fp-label">Email</label>
        <div className="fp-field">
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMsg("");
            }}
            placeholder="nama@email.com"
            className="fp-input"
          />
          {valid && (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-label="Email valid">
              <circle cx="12" cy="12" r="11" fill="#111" /><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        {email && !valid && <p className="fp-error">Format email belum benar.</p>}
        {errorMsg && <p className="fp-error">{errorMsg}</p>}

        <button
          type="button"
          disabled={!valid || loading}
          onClick={handleSendOtp}
          className="fp-button"
        >
          {loading ? "Mengirim..." : "Kirim OTP"}
        </button>
      </section>
      <Dots total={2} active={0} />
    </>
  );
}
