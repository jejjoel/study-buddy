"use client";

import { useState } from "react";
import Header from "./Header";
import Dots from "./Dots";

type Props = { onBack: () => void; onDone: () => void };

const OPTIONS = [
  "Tampilkan Nama & Jurusan",
  "Sembunyikan Nomor Handphone",
  "Sembunyikan IPK Akademik",
];

export default function PrivacySettings({ onBack, onDone }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const toggle = (o: string) =>
    setSelected((s) => (s.includes(o) ? s.filter((x) => x !== o) : [...s, o]));

  return (
    <>
      <Header
        title="Pengaturan Privasi"
        onBack={onBack}
        right={<button type="button" onClick={() => setOpen(true)} className="fp-skip">Lewati</button>}
      />
      <section className="fp-section fp-section--wide">
        <h2 className="fp-heading fp-heading--left">Pilih Informasi yang ingin ditampilkan</h2>
        <ul className="fp-options">
          {OPTIONS.map((o) => {
            const on = selected.includes(o);
            return (
              <li key={o}>
                <label className="fp-option-label">
                  <input type="checkbox" checked={on} onChange={() => toggle(o)} className="fp-sr-only" />
                  <span className={`fp-radio${on ? " fp-radio--on" : ""}`}>
                    {on && <span className="fp-radio-dot" />}
                  </span>
                  {o}
                </label>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fp-button fp-button--pill fp-button--bottom"
        >
          Konfirmasi
        </button>
      </section>
      <Dots total={4} active={3} />

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="fp-modal-title" className="fp-overlay">
          <div className="fp-modal">
            <div className="fp-modal-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </div>
            <h3 id="fp-modal-title" className="fp-modal-title">Pengaturan tersimpan</h3>
            <p className="fp-modal-text">
              {selected.length ? selected.join(", ") + "." : "Tidak ada pilihan privasi yang diubah."}
            </p>
            <button type="button" onClick={onDone} className="fp-modal-button">
              Selesai
            </button>
          </div>
        </div>
      )}
    </>
  );
}
