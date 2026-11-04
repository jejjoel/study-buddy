import "./forgot-password.css";

// Pembungkus bersama untuk 3 halaman: latar abu-abu + kartu selebar ponsel
export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="fp-page">
      <div className="fp-card">{children}</div>
    </main>
  );
}
