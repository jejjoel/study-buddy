import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main>
      {/* Navbar */}
      <nav className="navbar">
        <Link href="/" className="brand flex items-center gap-2">
          <Image
            src="/images/logo study buddy 2.png"
            alt="Logo Study Buddy"
            width={90}
            height={70}
            className="object-contain"
          />
          <span className="font-bold text-lg">StudyBuddy</span>
        </Link>

        <div className="nav-links">
          <a href="#fitur">Fitur</a>
          <a href="#tentang">Tentang Kami</a>
          <Link href="/login" className="btn btn-outline">
            Masuk
          </Link>
          <Link href="/register" className="btn btn-primary">
            Gabung Sekarang
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">
            ✨ Teman belajar terbaikmu
          </span>

          <h1>
            Belajar Bersama,
            <br />
            <span className="text-blue">Tumbuh Bersama.</span>
          </h1>

          <p>
            Temukan teman belajar, diskusikan ide, dan capai
            tujuan akademikmu bersama komunitas StudyBuddy.
          </p>

          <div className="hero-actions">
            <Link href="/login" className="btn btn-primary btn-large">
              Mulai Sekarang →
            </Link>
            <a href="#fitur" className="btn btn-outline btn-large">
              Pelajari Fitur
            </a>
          </div>

          <div className="hero-stats">
            <div>
              <strong>1.000+</strong>
              <span>Teman Belajar</span>
            </div>
            <div>
              <strong>250+</strong>
              <span>Grup Diskusi</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>Semangat Belajar</span>
            </div>
          </div>
        </div>

        {/* Hero Visual dengan Ilustrasi Gambar */}
        <div className="hero-visual">
          <div className="hero-illustration overflow-hidden rounded-2xl shadow-lg border border-gray-100 bg-white p-2">
            <Image
              src="/images/orang belajar.jpg"
              alt="Ilustrasi Orang Belajar"
              width={420}
              height={280}
              className="w-full h-auto object-cover rounded-xl"
            />
            <div className="illustration-caption mt-2 text-center">
              <strong>Grow Together!</strong>
              <p>Belajar tidak harus sendirian.</p>
            </div>
          </div>

          <div className="floating-card card-top">
            📖 Belajar bersama teman
          </div>
          <div className="floating-card card-bottom">
            💡 Temukan ide baru
          </div>
        </div>
      </section>

      {/* Feature Section dengan Ikon Gambar */}
      <section id="fitur" className="features section">
        <div className="section-heading">
          <span className="eyebrow">FITUR STUDYBUDDY</span>
          <h2>Semua yang kamu butuhkan untuk belajar</h2>
          <p>
            Terhubung, berdiskusi, dan berkembang bersama
            komunitas belajar.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon mb-3">
              <Image
                src="/images/logo cari teman .jpg"
                alt="Logo Cari Teman"
                width={56}
                height={56}
                className="object-contain mx-auto"
              />
            </div>
            <h3>Temukan Teman</h3>
            <p>
              Temukan teman belajar dengan minat yang sama.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon mb-3">
              <Image
                src="/images/logo diskusi.jpg"
                alt="Logo Ruang Diskusi"
                width={56}
                height={56}
                className="object-contain mx-auto"
              />
            </div>
            <h3>Ruang Diskusi</h3>
            <p>
              Bertukar ide dan menyelesaikan masalah bersama.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon mb-3">
              <Image
                src="/images/logo jadwal belajar.jpg"
                alt="Logo Jadwal Belajar"
                width={56}
                height={56}
                className="object-contain mx-auto"
              />
            </div>
            <h3>Jadwal Belajar</h3>
            <p>
              Atur jadwal agar kegiatan belajarmu terorganisasi.
            </p>
          </article>
        </div>
      </section>

      {/* CTA Section */}
      <section id="tentang" className="cta-section">
        <h2>Siap memulai perjalanan belajarmu?</h2>
        <p>
          Bergabung dengan StudyBuddy dan berkembang
          bersama teman-temanmu.
        </p>
        <Link href="/register" className="btn btn-white btn-large">
          Gabung StudyBuddy →
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <Link href="/" className="brand flex items-center justify-center gap-2 mb-2">
          <Image
            src="/images/logo study buddy 2.png"
            alt="Logo Study Buddy"
            width={90}
            height={80}
            className="object-contain"
          />
          <span className="font-bold">StudyBuddy</span>
        </Link>
        <p>© 2026 StudyBuddy. Belajar bersama, tumbuh bersama.</p>
      </footer>
    </main>
  );
}
