
"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./contact-us.module.css";

const CONTACT_EMAIL = "studybuddy@gmail.com";

export default function ContactUsPage() {
  const subject = encodeURIComponent("Pertanyaan untuk StudyBuddy");
  const body = encodeURIComponent(
    "Halo Tim StudyBuddy,\n\nSaya ingin bertanya mengenai...\n\nTerima kasih."
  );

  const emailLink = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

  return (
    <main className={styles.screen}>
      {/* Header */}
      <header className={styles.topHeader}>
        <Link
          href="/profile"
          className={styles.backArrow}
          aria-label="Kembali ke profil"
        >
          <svg
            width="12"
            height="20"
            viewBox="0 0 12 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 2L2 10L10 18"
              stroke="#070707"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <h1 className={styles.screenTitle}>Contact Us</h1>
        <div className={styles.headerSpacer} />
      </header>

      <div className={styles.bodyContent}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroIcon}>
            <Image
              src="/icon-profil/chat-quote-line.png"
              alt=""
              width={42}
              height={42}
              className={styles.heroImage}
            />
          </div>

          <h2>Ada yang bisa kami bantu?</h2>

          <p>
            Punya pertanyaan, saran, atau mengalami kendala saat menggunakan
            StudyBuddy? Jangan ragu untuk menghubungi kami.
          </p>
        </section>

        {/* Email Contact Card */}
        <section className={styles.contactCard}>
          <div className={styles.emailIcon}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </div>

          <h3>Email</h3>

          <p>
            Hubungi tim StudyBuddy melalui email untuk menyampaikan pertanyaan
            atau masukanmu.
          </p>

          <a href={emailLink} className={styles.emailAddress}>
            {CONTACT_EMAIL}
          </a>

          <a href={emailLink} className={styles.emailButton}>
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 2 11 13" />
              <path d="m22 2-7 20-4-9-9-4Z" />
            </svg>
            Kirim Email
          </a>
        </section>

        {/* Informasi tambahan */}
        <section className={styles.infoCard}>
          <div className={styles.infoIcon}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 11v5" />
              <path d="M12 8h.01" />
            </svg>
          </div>

          <div>
            <h3>Butuh bantuan?</h3>
            <p>
              Sertakan detail pertanyaan atau kendalamu di dalam email agar
              tim kami lebih mudah memahami kebutuhanmu.
            </p>
          </div>
        </section>

        <p className={styles.footerText}>
          Terima kasih telah menjadi bagian dari StudyBuddy.
        </p>
      </div>
    </main>
  );
}
