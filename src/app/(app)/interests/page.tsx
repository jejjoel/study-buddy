"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import "./bidang-minat.css";

const interestOptions = [
  "UI/UX Design",
  "Laravel",
  "Cyber Security",
  "App Flutter",
  "Web Design",
  "Database",
  "Java",
  "Laragon",
  "Blockchain",
  "Editor",
  "Content Creator",
  "Akuntansi",
  "Kedokteran",
  "Perawatan",
  "Teknik",
  "Biologi",
  "Olahraga",
  "Seni",
  "Sastra Jepang",
  "Administrasi",
  "Perhotelan",
  "Sastra English",
  "Kedokteran Hewan",
  "Lainnya",
];

export default function BidangMinatPage() {
  const router = useRouter();

  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "UI/UX Design",
    "Web Design",
    "Content Creator",
  ]);

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleInterest(interest: string) {
    setMessage("");

    setSelectedInterests((current) => {
      // Jika sudah dipilih, batalkan pilihan
      if (current.includes(interest)) {
        return current.filter((item) => item !== interest);
      }

      // Maksimal 5 pilihan
      if (current.length >= 5) {
        setMessage("Kamu hanya bisa memilih maksimal 5 bidang minat.");
        return current;
      }

      return [...current, interest];
    });
  }

  async function handleContinue() {
    if (selectedInterests.length === 0) {
      setMessage("Pilih minimal satu bidang minat atau tekan Lewati.");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("users")
          .update({
            interests: selectedInterests,
            updated_at: new Date().toISOString(),
          })
          .eq("firebase_uid", user.id);
      }
    } catch (err) {
      console.warn("Gagal menyimpan bidang minat:", err);
    } finally {
      setSaving(false);
    }

    // Lanjut ke halaman profil
    router.push("/profile/edit");
  }

  function handleSkip() {
    // Lewati pilihan minat dan lanjut ke profil
    router.push("/profile/edit");
  }

  return (
    <main className="interest-page">
      <header className="interest-header">
        <Link
          href="/register"
          className="interest-back"
          aria-label="Kembali ke registrasi"
        >
          <span aria-hidden="true">‹</span>
        </Link>

        <button
          type="button"
          className="interest-skip"
          onClick={handleSkip}
        >
          Lewati
        </button>
      </header>

      <section className="interest-content">
        <h1>
          Pilih Bidang Minat
          <br />
          Kamu
        </h1>

        <div
          className="interest-grid"
          role="group"
          aria-label="Pilihan bidang minat"
        >
          {interestOptions.map((interest) => {
            const isSelected = selectedInterests.includes(interest);

            return (
              <button
                type="button"
                key={interest}
                className={`interest-option${
                  isSelected ? " selected" : ""
                }`}
                onClick={() => toggleInterest(interest)}
                aria-pressed={isSelected}
              >
                <span className="interest-radio" aria-hidden="true" />
                <span className="interest-label">{interest}</span>
              </button>
            );
          })}
        </div>

        <p className="interest-counter">
          {selectedInterests.length}/5 bidang dipilih
        </p>

        {message && (
          <p className="interest-message" role="status">
            {message}
          </p>
        )}
      </section>

      <footer className="interest-footer">
        <button
          type="button"
          className="interest-continue"
          onClick={handleContinue}
          disabled={saving}
        >
          {saving ? "Menyimpan..." : "Selanjutnya"}
        </button>

        <div
          className="interest-pagination"
          aria-label="Langkah 2 dari 4"
        >
          <span />
          <span className="is-active" />
          <span />
          <span />
        </div>
      </footer>
    </main>
  );
}
