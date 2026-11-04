"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./ProfileDetail.module.css";

export type ProfileDetailData = {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  followers: string;
  /** Hanya varian user */
  following?: string;
  facultyTitle?: string;
  facultySub?: string;
  /** Jumlah "n teman bersama" (varian user) */
  mutualText?: string;
};

type Course = {
  title: string;
  price: string;
  priceOld: string;
  rating: string;
  tag: string;
  icon: "figma" | "python" | "flutter";
};

type Review = {
  name: string;
  role: string;
  university: string;
  avatar: string;
  text: string;
};

const courses: Course[] = [
  {
    title: "Web & UI/UX Designer",
    price: "Rp 500.000,00",
    priceOld: "Rp 1.250.000,00",
    rating: "4.9",
    tag: "Berakhir dalam 20 hari",
    icon: "figma",
  },
  {
    title: "Bahasa Python",
    price: "Rp 350.000,00",
    priceOld: "Rp 700.000,00",
    rating: "4.8",
    tag: "Berakhir dalam 20 hari",
    icon: "python",
  },
  {
    title: "Mobile Apps Flutter",
    price: "Rp 450.000,00",
    priceOld: "Rp 900.000,00",
    rating: "4.7",
    tag: "Berakhir dalam 15 hari",
    icon: "flutter",
  },
];

const reviews: Review[] = [
  {
    name: "Annisa Onc.",
    role: "Dari : Web & UI/UX Designer",
    university: "Universitas Brawijaya",
    avatar: "/images/figma/annisa.png",
    text: "Mudah dipahami, bahasa dalam penjelasannya juga tidak terlalu berat untuk dipahami, aku udah bimbingan disini sekarang aku udah mendapatkan paid internship hehe, luar biasaa, rekomend deh pokoknya.",
  },
  {
    name: "Bangren",
    role: "Dari : Bahasa Python",
    university: "Universitas Indonesia",
    avatar: "/images/figma/bangren.png",
    text: "Belajar Python di sini jadi jauh lebih terarah! Penjelasannya simpel dan langsung ke praktik buat yang masih pemula.",
  },
];

const mutualAvatars = [
  "/images/figma/mutual_1.png",
  "/images/figma/mutual_2.png",
  "/images/figma/mutual_3.png",
];

function CourseIcon({ icon }: { icon: Course["icon"] }) {
  if (icon === "figma") {
    return (
      <svg width="26" height="38" viewBox="0 0 38 57" fill="none">
        <path
          d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z"
          fill="#1ABCFE"
        />
        <path
          d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z"
          fill="#0ACF83"
        />
        <path
          d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z"
          fill="#FF7262"
        />
        <path
          d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z"
          fill="#F24E1E"
        />
        <path
          d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z"
          fill="#A259FF"
        />
      </svg>
    );
  }

  if (icon === "python") {
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path
          d="M11.9 1.8c-2 0-3.6.2-4.8.5-1.2.4-1.8 1.4-1.8 2.9v2h6.6v.9H5.6c-1.6 0-2.9 1-3.4 2.6-.5 1.7-.5 3 0 4.6.4 1.4 1.5 2.4 3 2.4h1.6v-2.4c0-1.6 1.3-3 3-3h4.6c1.5 0 2.6-1.1 2.6-2.6V5.2c0-1.5-1.2-2.6-2.7-2.9-.9-.2-1.9-.3-2.9-.3z"
          fill="#3776AB"
        />
        <path
          d="M12.1 22.2c2 0 3.6-.2 4.8-.5 1.2-.4 1.8-1.4 1.8-2.9v-2h-6.6v-.9h6.3c1.6 0 2.9-1 3.4-2.6.5-1.7.5-3 0-4.6-.4-1.4-1.5-2.4-3-2.4h-1.6v2.4c0 1.6-1.3 3-3 3H10.6c-1.5 0-2.6 1.1-2.6 2.6v4.5c0 1.5 1.2 2.6 2.7 2.9.9.2 1.9.3 2.9.3z"
          fill="#FFD43B"
        />
      </svg>
    );
  }

  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
      <path
        d="M14.314 0L2.3 12 6 15.7 21.686 0h-7.372zm.056 10.858L7.857 17.37 14.37 23.886h7.33L14.37 16.514l4.886-4.886h-4.886z"
        fill="#02569B"
      />
    </svg>
  );
}

/**
 * Halaman detail profil penuh (Full Profile Detail).
 * Varian: `user` (Arya Putra) dan `mentor` (Frenki Herlambang).
 */
export default function ProfileDetail({
  variant,
  data,
  connected,
  onBack,
  onToggleConnect,
}: {
  variant: "user" | "mentor";
  data: ProfileDetailData;
  connected?: boolean;
  onBack: () => void;
  onToggleConnect?: () => void;
}) {
  return (
    <div
      className={`${styles.root}${
        variant === "mentor" ? ` ${styles.withBottomBar}` : ""
      }`}
    >
      {/* Top bar: tombol back + kolom pencarian */}
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backArrow}
          onClick={onBack}
          aria-label="Kembali"
        >
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
            <path
              d="M10 2L2 10L10 18"
              stroke="#070707"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className={styles.searchBar}>
          <input
            type="search"
            placeholder="Cari"
            className={styles.searchInput}
            aria-label="Cari"
          />
          <button
            type="button"
            className={styles.searchButton}
            aria-label="Cari"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M6.5 11C8.98528 11 11 8.98528 11 6.5C11 4.01472 8.98528 2 6.5 2C4.01472 2 2 4.01472 2 6.5C2 8.98528 4.01472 11 6.5 11Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 13L9.67 9.67"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Hero banner biru + avatar */}
      <div className={styles.hero}>
        <div className={styles.avatarWrap}>
          <Image
            src={data.avatar}
            alt={data.name}
            width={120}
            height={120}
            className={styles.avatar}
            priority
          />
        </div>
      </div>

      {/* Info header */}
      <div className={styles.info}>
        <div className={styles.infoLeft}>
          <h1 className={styles.name}>{data.name}</h1>
          <p className={styles.role}>{data.role}</p>
        </div>

        <div className={styles.infoRight}>
          {variant === "user" ? (
            <>
              <p className={styles.facultyTitle}>{data.facultyTitle}</p>
              <p className={styles.facultySub}>{data.facultySub}</p>
            </>
          ) : (
            <div className={styles.companyRow}>
              <Image
                src="/images/figma/vinix7_logo.png"
                alt="VINIX 7"
                width={72}
                height={20}
                className={styles.companyLogo}
              />
              <p className={styles.companyText}>
                VINIX 7 — PT Vinix Seven Aurum
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      <p className={styles.bio}>{data.bio}</p>

      {/* Statistik pengikut */}
      <div className={styles.stats}>
        <button type="button" className={styles.statLink}>
          {data.followers}
        </button>
        {data.following && (
          <button type="button" className={styles.statLink}>
            {data.following}
          </button>
        )}
      </div>

      {/* Teman bersama (varian user) */}
      {variant === "user" && data.mutualText && (
        <div className={styles.mutual}>
          <span className={styles.mutualText}>{data.mutualText}</span>
          <div className={styles.mutualAvatars}>
            {mutualAvatars.map((src) => (
              <Image
                key={src}
                src={src}
                alt=""
                width={22}
                height={22}
                className={styles.mutualAvatar}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tombol aksi (varian user) */}
      {variant === "user" && (
        <>
          <div className={styles.actions}>
            <Link href="/chat" className={styles.actionBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 3L10.5 13.5M21 3l-6.8 18-3.7-7.5L3 9.8 21 3z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Kirim Pesan
            </Link>

            <button
              type="button"
              className={styles.actionBtn}
              onClick={onToggleConnect}
            >
              {connected ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="10"
                    cy="8"
                    r="3.2"
                    stroke="currentColor"
                    strokeWidth="1.9"
                  />
                  <path
                    d="M4 19c0-3 2.7-4.8 6-4.8s6 1.8 6 4.8"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                  />
                  <path
                    d="M19 7v6M16 10h6"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {connected ? "Tersambung" : "Tambah Teman"}
            </button>
          </div>

          <div className={styles.divider} />
        </>
      )}

      {/* Section khusus mentor */}
      {variant === "mentor" && (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Kelas by {data.name}</h2>

            <div className={styles.scrollRow}>
              {courses.map((course) => (
                <article className={styles.courseCard} key={course.title}>
                  <div className={styles.courseIcon}>
                    <CourseIcon icon={course.icon} />
                  </div>

                  <div className={styles.courseInfo}>
                    <h3 className={styles.courseTitle}>{course.title}</h3>

                    <div className={styles.priceRow}>
                      <span className={styles.priceNow}>{course.price}</span>
                      <span className={styles.priceOld}>{course.priceOld}</span>
                    </div>

                    <div className={styles.courseMeta}>
                      <span className={styles.rating}>
                        <span className={styles.star}>★</span> {course.rating}{" "}
                        ulasan
                      </span>
                      <span className={styles.tag}>{course.tag}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.carouselRow}>
              <span />
              <div className={styles.dots}>
                <span className={`${styles.dot} ${styles.dotActive}`} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
              <button type="button" className={styles.moreLink}>
                Tampilkan semua &gt;&gt;
              </button>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Ulasan</h2>

            <div className={styles.scrollRow}>
              {reviews.map((review) => (
                <article className={styles.reviewCard} key={review.name}>
                  <div className={styles.reviewerRow}>
                    <Image
                      src={review.avatar}
                      alt={review.name}
                      width={42}
                      height={42}
                      className={styles.reviewerAvatar}
                    />
                    <div>
                      <h4 className={styles.reviewerName}>{review.name}</h4>
                      <p className={styles.reviewerRole}>{review.role}</p>
                      <p className={styles.reviewerUni}>
                        {review.university}
                      </p>
                    </div>
                  </div>

                  <p className={styles.reviewText}>{review.text}</p>
                </article>
              ))}
            </div>

            <div className={styles.carouselRow}>
              <span />
              <div className={styles.dots}>
                <span className={`${styles.dot} ${styles.dotActive}`} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
              <button type="button" className={styles.moreLink}>
                Tampilkan semua &gt;&gt;
              </button>
            </div>
          </section>
        </>
      )}

      {/* Tombol Konsultasi fixed (varian mentor) */}
      {variant === "mentor" && (
        <div className={styles.bottomBar}>
          <div className={styles.bottomBarInner}>
            <Link href="/chat" className={styles.consultBtn}>
              Konsultasi
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
