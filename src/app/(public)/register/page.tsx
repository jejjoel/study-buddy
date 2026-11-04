"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
// 1. Impor klien Supabase yang sudah dibuat sebelumnya
import { supabase } from "@/lib/supabase/client"; 
import "./registrasi.css";

export default function RegistrasiPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Tambahan state loading opsional

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // Validasi semua kolom
    if (!email.trim() || !password || !confirmPassword) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    // Validasi format email sederhana
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Masukkan alamat email yang valid.");
      return;
    }

    // Validasi panjang password
    if (password.length < 8) {
      setError("Password harus terdiri dari minimal 8 karakter.");
      return;
    }

    // Validasi konfirmasi password
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);

    try {
      // 2. Kirim data registrasi ke Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // 3. Jika berhasil, otomatis trigger database akan mencatat ke tabel profiles,
      // lalu arahkan user ke halaman pilihan bidang minat
      router.push("/bidang-minat");
    } catch (err) {
      setError("Terjadi kesalahan pada sistem.");
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <header className="register-header">
        <Link
          href="/"
          className="register-back"
          aria-label="Kembali ke halaman utama"
        >
          <span aria-hidden="true">‹</span>
        </Link>

        <h1>Registrasi</h1>

        <span
          className="register-header-spacer"
          aria-hidden="true"
        />
      </header>

      <section className="register-content">
        <form
          className="register-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Email */}
          <div className="register-field">
            <label htmlFor="register-email">
              Masukan Email Kamu
            </label>

            <div className="register-input-wrap">
              <input
                id="register-email"
                type="email"
                placeholder="Masukan email anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && (
                <span
                  className="register-valid-icon"
                  aria-label="Format email valid"
                >
                  ✓
                </span>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="register-field">
            <label htmlFor="register-password">
              Buat Password
            </label>

            <div className="register-input-wrap">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />

              <button
                className="register-visibility"
                type="button"
                onClick={() =>
                  setShowPassword((visible) => !visible)
                }
                aria-label={
                  showPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
              >
                <Image
                  src={
                    showPassword
                      ? "/images/eye-off.png"
                      : "/images/eye.png"
                  }
                  alt=""
                  width={18}
                  height={18}
                />
              </button>
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div className="register-field">
            <label htmlFor="register-confirm-password">
              Konfirmasi Password
            </label>

            <div className="register-input-wrap">
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Masukan ulang password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />

              <button
                className="register-visibility"
                type="button"
                onClick={() =>
                  setShowConfirmPassword((visible) => !visible)
                }
                aria-label={
                  showConfirmPassword
                    ? "Sembunyikan konfirmasi password"
                    : "Tampilkan konfirmasi password"
                }
              >
                <Image
                  src={
                    showConfirmPassword
                      ? "/images/eye-off.png"
                      : "/images/eye.png"
                  }
                  alt=""
                  width={18}
                  height={18}
                />
              </button>
            </div>
          </div>

          {/* Pesan error */}
          {error && (
            <p className="register-message" role="alert">
              {error}
            </p>
          )}

          {/* Tombol Registrasi */}
          <button
            className="register-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Sign up"}
          </button>
        </form>

        {/* Login */}
        <p className="register-signin">
          Sudah punya akun?{" "}
          <Link href="/login">Sign in</Link>
        </p>

        <div className="register-or">
          <span>or</span>
        </div>

        {/* Login Google dan Apple */}
        <div className="register-socials">
          <button
            type="button"
            className="register-social-button"
            onClick={() =>
              alert("Login Google belum dihubungkan.")
            }
          >
            <Image
              src="/images/Google.png"
              alt=""
              width={24}
              height={24}
            />
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            className="register-social-button"
            onClick={() =>
              alert("Login Apple belum dihubungkan.")
            }
          >
            <Image
              src="/images/Apple logo.png"
              alt=""
              width={24}
              height={24}
            />
            <span>Continue with Apple</span>
          </button>
        </div>

        {/* Indikator langkah */}
        <div
          className="register-pagination"
          aria-label="Langkah 1 dari 4"
        >
          <span className="is-active" />
          <span />
          <span />
          <span />
        </div>
      </section>
    </main>
  );
}