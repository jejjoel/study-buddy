"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
// 1. Impor klien Supabase
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Status loading saat proses login

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      // 2. Autentikasi user dengan Supabase Auth
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }

      // 3. Jika berhasil, arahkan ke halaman home
      router.push("/home");
    } catch (err) {
      setError("Terjadi kesalahan pada sistem.");
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      {/* Brand / Logo Utama Atas */}
      <Link href="/" className="brand login-brand flex items-center gap-2">
        <Image
          src="/images/logo study buddy 2.png"
          alt="Study Buddy Logo"
          width={100}
          height={80}
          className="object-contain"
        />
        <span className="font-bold text-xl">StudyBuddy</span>
      </Link>

      <section className="login-card">
        <div className="login-welcome flex flex-col items-center text-center">
          {/* Logo Study Buddy di Kartu Login */}
          <div className="login-logo mb-2">
            <Image
              src="/images/logo study buddy 2.png"
              alt="Study Buddy Logo"
              width={100}
              height={90}
              className="object-contain"
            />
          </div>
          <h1>Selamat Datang!</h1>
          <p>Masuk untuk melanjutkan perjalanan belajarmu.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <div className="password-label">
            <label htmlFor="password">Password</label>
            <a href="/forgot-password">Lupa password?</a>
          </div>

          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="password-toggle flex items-center justify-center"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword
                  ? "Sembunyikan password"
                  : "Tampilkan password"
              }
            >
              {showPassword ? (
                <Image
                  src="/images/sembunyikan passwoard.jpg"
                  alt="Sembunyikan Password"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              ) : (
                <Image
                  src="/images/perlihat passwoard.jpg"
                  alt="Perlihatkan Password"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              )}
            </button>
          </div>

          {error && <p className="form-error">{error}</p>}

          <label className="remember-option">
            <input type="checkbox" />
            Ingat saya
          </label>

          <button 
            type="submit" 
            className="btn btn-primary login-submit"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="login-divider">
          <span>atau masuk dengan</span>
        </div>

        {/* Tombol Social Login dengan Ikon Gambar */}
        <div className="social-login">
          <button
            type="button"
            className="social-button flex items-center justify-center gap-2"
            onClick={() =>
              alert("Login Google belum dihubungkan.")
            }
          >
            <Image
              src="/images/Google.png"
              alt="Google Logo"
              width={20}
              height={20}
              className="object-contain"
            />
            <span>Google</span>
          </button>

          <button
            type="button"
            className="social-button flex items-center justify-center gap-2"
            onClick={() =>
              alert("Login Apple belum dihubungkan.")
            }
          >
            <Image
              src="/images/Apple logo.png"
              alt="Apple Logo"
              width={20}
              height={20}
              className="object-contain"
            />
            <span>Apple</span>
          </button>
        </div>

        <p className="signup-text">
          Belum punya akun? <Link href="/register">Daftar sekarang</Link>
        </p>

        <Link href="/" className="back-link">
          ← Kembali ke halaman utama
        </Link>
      </section>
    </main>
  );
}