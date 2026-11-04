
"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import styles from "./privacy-policy.module.css";

export default function PrivacyPolicyPage() {
  const lastUpdated = "22 Oktober 2026";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/profile" className={styles.backButton}>
          <span aria-hidden="true">←</span>
          <span>Kembali</span>
        </Link>

        <h1>Kebijakan Privasi</h1>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroIcon}>
          <span aria-hidden="true">🔒</span>
        </div>

        <p className={styles.eyebrow}>STUDYBUDDY</p>

        <h2>Privasi kamu adalah prioritas kami.</h2>

        <p className={styles.heroDescription}>
          Kami berkomitmen untuk menjaga keamanan informasi pribadi
          dan memberikan pengalaman belajar yang nyaman bagi setiap
          pengguna StudyBuddy.
        </p>

        <p className={styles.updated}>
          Terakhir diperbarui: {lastUpdated}
        </p>
      </section>

      <article className={styles.content}>
        <section className={styles.policySection}>
          <span className={styles.sectionNumber}>01</span>
          <div>
            <h2>Pendahuluan</h2>
            <p>
              Kebijakan Privasi ini menjelaskan bagaimana StudyBuddy
              mengumpulkan, menggunakan, menyimpan, dan melindungi
              informasi pengguna saat menggunakan layanan kami.
              Dengan menggunakan StudyBuddy, kamu perlu membaca
              dan memahami kebijakan ini.
            </p>
          </div>
        </section>

        <section className={styles.policySection}>
          <span className={styles.sectionNumber}>02</span>
          <div>
            <h2>Informasi yang Kami Kumpulkan</h2>
            <p>
              Informasi yang dapat dikumpulkan bergantung pada fitur
              yang kamu gunakan, termasuk:
            </p>
            <ul>
              <li>
                Informasi akun, seperti nama dan alamat email.
              </li>
              <li>
                Informasi profil, seperti fakultas, program studi,
                semester, dan bidang minat jika kamu mengisinya.
              </li>
              <li>
                Informasi aktivitas penggunaan fitur, seperti
                preferensi belajar dan jadwal yang kamu buat.
              </li>
              <li>
                Pesan atau informasi yang kamu kirim melalui fitur
                diskusi, bantuan, atau komunikasi lainnya.
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.policySection}>
          <span className={styles.sectionNumber}>03</span>
          <div>
            <h2>Bagaimana Informasi Digunakan</h2>
            <p>Informasi dapat digunakan untuk:</p>
            <ul>
              <li>Membuat dan mengelola akun pengguna.</li>
              <li>Menyesuaikan pengalaman belajar sesuai minatmu.</li>
              <li>Mendukung fitur teman belajar, mentor, dan kursus.</li>
              <li>Mengelola jadwal dan aktivitas belajar.</li>
              <li>Menangani pertanyaan serta meningkatkan layanan.</li>
              <li>Menjaga keamanan dan mencegah penyalahgunaan layanan.</li>
            </ul>
          </div>
        </section>

        <section className={styles.policySection}>
          <span className={styles.sectionNumber}>04</span>
          <div>
            <h2>Penyimpanan dan Keamanan Data</h2>
            <p>
              Kami berupaya menerapkan langkah-langkah yang wajar
              untuk melindungi informasi dari akses, perubahan,
              pengungkapan, atau penggunaan yang tidak sah.
              Namun, tidak ada sistem penyimpanan maupun transmisi
              data yang dapat dijamin sepenuhnya aman.
            </p>
          </div>
        </section>

        <section className={styles.policySection}>
          <span className={styles.sectionNumber}>05</span>
          <div>
            <h2>Pembagian Informasi</h2>
            <p>
              Informasi pribadi tidak seharusnya dibagikan kepada
              pihak lain tanpa dasar yang sesuai. Informasi hanya
              dapat diproses atau dibagikan jika diperlukan untuk
              menjalankan layanan, memenuhi kewajiban hukum, atau
              berdasarkan persetujuan pengguna yang relevan.
            </p>
            <p>
              Hindari membagikan informasi sensitif di ruang diskusi
              atau profil yang dapat dilihat pengguna lain.
            </p>
          </div>
        </section>

        <section className={styles.policySection}>
          <span className={styles.sectionNumber}>06</span>
          <div>
            <h2>Hak dan Pilihan Pengguna</h2>
            <p>
              Kamu dapat memeriksa informasi profil yang tersedia
              dan memperbaruinya melalui pengaturan profil apabila
              fitur tersebut tersedia. Kamu juga dapat menghubungi
              tim StudyBuddy untuk menanyakan pengelolaan informasi
              pribadi atau mengajukan permintaan terkait data.
            </p>
          </div>
        </section>

        <section className={styles.policySection}>
          <span className={styles.sectionNumber}>07</span>
          <div>
            <h2>Privasi Pengguna di Bawah Umur</h2>
            <p>
              Jika layanan digunakan oleh pengguna di bawah umur,
              penggunaan layanan perlu mengikuti ketentuan hukum
              yang berlaku dan persyaratan persetujuan yang relevan.
            </p>
          </div>
        </section>

        <section className={styles.policySection}>
          <span className={styles.sectionNumber}>08</span>
          <div>
            <h2>Perubahan Kebijakan</h2>
            <p>
              Kebijakan ini dapat diperbarui seiring perubahan fitur
              atau kebutuhan layanan. Jika ada perubahan, versi
              terbaru akan ditampilkan pada halaman ini beserta
              tanggal pembaruannya.
            </p>
          </div>
        </section>

        <section className={styles.contactCard}>
          <div className={styles.contactIcon}>
            <span aria-hidden="true">✉</span>
          </div>

          <div className={styles.contactText}>
            <h2>Masih ada pertanyaan?</h2>
            <p>
              Hubungi kami jika kamu ingin mengetahui lebih lanjut
              tentang kebijakan privasi StudyBuddy.
            </p>
          </div>

          <Link href="/contact" className={styles.contactButton}>
            Hubungi Kami
            <span aria-hidden="true">→</span>
          </Link>
        </section>

        <p className={styles.disclaimer}>
          Catatan: Sesuaikan isi kebijakan ini dengan fitur yang
          benar-benar diterapkan, sistem penyimpanan data, dan
          praktik pengelolaan data StudyBuddy sebelum dipublikasikan.
        </p>
      </article>

      <Navbar />
    </main>
  );
}
