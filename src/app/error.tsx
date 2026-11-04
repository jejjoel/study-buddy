"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="system-page">
      <h1>Terjadi masalah</h1>
      <p>Silakan coba lagi. Jika masalah berlanjut, hubungi tim StudyBuddy.</p>
      <button type="button" onClick={reset}>Coba lagi</button>
    </main>
  );
}
