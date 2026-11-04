
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import styles from "./help-support.module.css";

const categories = [
  { id: "all", label: "Semua", icon: "⌕" },
  { id: "akun", label: "Akun", icon: "♙" },
  { id: "teman", label: "Teman Belajar", icon: "♧" },
  { id: "mentor", label: "Mentor", icon: "✦" },
  { id: "kursus", label: "Kursus", icon: "▤" },
  { id: "jadwal", label: "Jadwal", icon: "▦" },
];

const faqs = [
  {
    id: 1,
    category: "akun",
    question: "Bagaimana cara mengubah informasi profil?",
    answer:
      "Buka menu Profil, pilih Edit Informasi Profil, lalu ubah informasi yang ingin diperbarui. Setelah selesai, tekan tombol Konfirmasi untuk menyimpan perubahan.",
  },
  {
    id: 2,
    category: "akun",
    question: "Bagaimana jika saya lupa kata sandi?",
    answer:
      "Gunakan fitur Lupa Kata Sandi pada halaman login jika tersedia. Ikuti petunjuk pemulihan akun yang ditampilkan untuk membuat kata sandi baru.",
  },
  {
    id: 3,
    category: "teman",
    question: "Bagaimana cara menemukan teman belajar?",
    answer:
      "Pilih fitur Teman Belajar, lalu cari atau pilih teman berdasarkan bidang minat yang sesuai. Pastikan kamu melengkapi informasi profil agar calon teman belajar lebih mudah mengenalmu.",
  },
  {
    id: 4,
    category: "teman",
    question: "Apakah saya bisa belajar dalam kelompok?",
    answer:
      "Kamu dapat menggunakan ruang diskusi atau komunitas belajar yang tersedia untuk berdiskusi dengan beberapa orang sesuai fitur yang disediakan StudyBuddy.",
  },
  {
    id: 5,
    category: "mentor",
    question: "Bagaimana cara mencari mentor?",
    answer:
      "Buka menu Mentor dan lihat mentor yang sesuai dengan kebutuhan belajarmu. Periksa informasi profil dan bidang keahlian mentor sebelum memilih.",
  },
  {
    id: 6,
    category: "kursus",
    question: "Bagaimana cara menemukan kursus?",
    answer:
      "Buka menu Kursus untuk melihat pilihan materi pembelajaran. Pilih kursus sesuai minat dan kebutuhan belajarmu, lalu ikuti petunjuk yang tersedia.",
  },
  {
    id: 7,
    category: "jadwal",
    question: "Bagaimana cara mengatur jadwal belajar?",
    answer:
      "Masuk ke fitur jadwal belajar, pilih waktu yang sesuai, kemudian ikuti petunjuk untuk membuat atau memperbarui jadwalmu.",
  },
  {
    id: 8,
    category: "jadwal",
    question: "Bagaimana jika jadwal belajar berubah?",
    answer:
      "Periksa jadwal yang sudah dibuat dan ubah waktu atau detailnya jika fitur pengeditan jadwal tersedia. Pastikan perubahan jadwal dikomunikasikan kepada teman belajar atau mentor terkait.",
  },
];

export default function HelpSupportPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState<number | null>(1);

  const filteredFaqs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "all" ||
        faq.category === activeCategory;

      const matchesSearch =
        !keyword ||
        faq.question.toLowerCase().includes(keyword) ||
        faq.answer.toLowerCase().includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  function handleCategoryChange(categoryId: string) {
    setActiveCategory(categoryId);
    setOpenFaq(null);
  }

  return (
    <main className={styles.screen}>
      {/* Header */}
      <header className={styles.topHeader}>
        <Link
          href="/profile"
          className={styles.backButton}
          aria-label="Kembali ke profil"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <h1 className={styles.headerTitle}>Help &amp; Support</h1>

        <div className={styles.headerSpacer} />
      </header>

      <div className={styles.content}>
        {/* Hero dan pencarian */}
        <section className={styles.hero}>
          <div className={styles.heroIcon} aria-hidden="true">
            <svg
              width="38"
              height="38"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M8.5 9A3.5 3.5 0 0 1 15.5 9C15.5 11.5 12 12 12 14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle cx="12" cy="17.5" r="1" fill="currentColor" />
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <h2>Ada yang bisa kami bantu?</h2>
          <p>
            Temukan jawaban dan panduan untuk pengalaman
            belajar yang lebih nyaman bersama StudyBuddy.
          </p>

          <label className={styles.searchBox}>
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M16 16L21 21"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari pertanyaan atau bantuan..."
              aria-label="Cari pertanyaan bantuan"
            />

            {search && (
              <button
                type="button"
                className={styles.clearSearch}
                onClick={() => setSearch("")}
                aria-label="Hapus pencarian"
              >
                ×
              </button>
            )}
          </label>
        </section>

        {/* Kategori bantuan */}
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <h2>Kategori Bantuan</h2>
              <p>Pilih topik yang ingin kamu ketahui.</p>
            </div>
          </div>

          <div className={styles.categoryList}>
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                className={`${styles.categoryButton} ${
                  activeCategory === category.id
                    ? styles.categoryActive
                    : ""
                }`}
                onClick={() => handleCategoryChange(category.id)}
                aria-pressed={activeCategory === category.id}
              >
                <span className={styles.categoryIcon}>
                  {category.icon}
                </span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.section}>
          <div className={styles.faqHeading}>
            <div>
              <h2>Pertanyaan yang Sering Diajukan</h2>
              <p>
                Temukan jawaban dari pertanyaan umum pengguna.
              </p>
            </div>

            <span className={styles.faqCount}>
              {filteredFaqs.length} pertanyaan
            </span>
          </div>

          <div className={styles.faqList}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isOpen = openFaq === faq.id;

                return (
                  <article
                    key={faq.id}
                    className={`${styles.faqItem} ${
                      isOpen ? styles.faqItemOpen : ""
                    }`}
                  >
                    <button
                      type="button"
                      className={styles.faqQuestion}
                      onClick={() =>
                        setOpenFaq(isOpen ? null : faq.id)
                      }
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>

                      <span
                        className={`${styles.faqToggle} ${
                          isOpen ? styles.faqToggleOpen : ""
                        }`}
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </button>

                    {isOpen && (
                      <div className={styles.faqAnswer}>
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>?</span>
                <h3>Pertanyaan tidak ditemukan</h3>
                <p>
                  Coba kata kunci lain atau pilih kategori
                  bantuan yang berbeda.
                </p>
                <button
                  type="button"
                  className={styles.resetButton}
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("all");
                    setOpenFaq(1);
                  }}
                >
                  Tampilkan semua pertanyaan
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Contact Us */}
        <section className={styles.contactCard}>
          <div className={styles.contactIcon} aria-hidden="true">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 5H20V17H13L8 21V17H4V5Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M8 9H16M8 13H14"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className={styles.contactText}>
            <h2>Masih butuh bantuan?</h2>
            <p>
              Tim kami siap membantu jika kamu belum menemukan
              jawaban yang dibutuhkan.
            </p>
          </div>

          <Link
            href="/contact"
            className={styles.contactButton}
          >
            Hubungi Kami
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>

      {/* Navigasi bawah StudyBuddy */}
      <Navbar />
    </main>
  );
}
