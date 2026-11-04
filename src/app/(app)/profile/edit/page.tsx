
"use client";

import {
  useRef,
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import styles from "./edit.module.css";

export default function EditProfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data profil
  const [foto, setFoto] = useState("/images/figma/aditya.png");
  const [fileFoto, setFileFoto] = useState<File | null>(null);
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [telepon, setTelepon] = useState("");
  const [gender, setGender] = useState("Laki-laki");
  const [semester, setSemester] = useState("1");
  const [fakultas, setFakultas] = useState("");
  const [prodi, setProdi] = useState("");
  const [ipk, setIpk] = useState("");

  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // 1. Mengambil data profil dari Supabase
  useEffect(() => {
    let mounted = true;

    async function fetchUserData() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from("users")
          .select("*")
          .eq("firebase_uid", user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!mounted) return;

        setNama(profile?.name || "");
        setEmail(profile?.email || user.email || "");
        setTelepon(profile?.phone_number || "");
        setGender(profile?.genre || "Laki-laki");
        setSemester(
          profile?.semester ? String(profile.semester) : "1"
        );
        setFakultas(profile?.faculty || "");
        setProdi(profile?.major || "");
        setIpk(
          profile?.gpa !== null && profile?.gpa !== undefined
            ? String(profile.gpa)
            : ""
        );

        if (profile?.avatar_url) {
          setFoto(profile.avatar_url);
        }
      } catch (error: any) {
        console.error("Gagal mengambil profil:", error);
        if (mounted) {
          alert("Gagal mengambil data profil: " + error.message);
        }
      } finally {
        if (mounted) setReady(true);
      }
    }

    fetchUserData();

    return () => {
      mounted = false;
    };
  }, [router]);

  // 2. Memilih foto profil
  function handleFoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Silakan pilih file gambar.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran foto maksimal 5 MB.");
      e.target.value = "";
      return;
    }

    // Membuat preview foto
    const previewUrl = URL.createObjectURL(file);

    setFoto(previewUrl);
    setFileFoto(file);
  }

  // 3. Mengunggah foto ke Supabase Storage
  async function uploadFoto(userId: string, file: File) {
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath = `${userId}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // 4. Menyimpan seluruh data profil
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      !nama.trim() ||
      !email.trim() ||
      !telepon.trim() ||
      !gender ||
      !semester ||
      !fakultas.trim() ||
      !prodi.trim() ||
      !ipk.trim()
    ) {
      alert("Mohon lengkapi semua data profil.");
      return;
    }

    const nilaiIpk = Number(ipk);

    if (
      !Number.isFinite(nilaiIpk) ||
      nilaiIpk < 0 ||
      nilaiIpk > 4
    ) {
      alert("IPK harus berada di antara 0 sampai 4.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        throw new Error("Sesi telah habis. Silakan login kembali.");
      }

      // Memperbarui email Auth jika berubah
      if (email.trim() !== (user.email || "")) {
        const { error: emailError } =
          await supabase.auth.updateUser({
            email: email.trim(),
          });

        if (emailError) {
          throw new Error(
            "Gagal memperbarui email: " + emailError.message
          );
        }
      }

      // Mempertahankan foto lama jika tidak memilih foto baru
      let avatarUrl = foto.startsWith("blob:") ? null : foto;

      // Upload foto baru jika pengguna memilih foto
      if (fileFoto) {
        avatarUrl = await uploadFoto(user.id, fileFoto);
      }

      // Menyimpan ke tabel users
      const { error: profileError } = await supabase
        .from("users")
        .upsert(
          {
            firebase_uid: user.id,
            name: nama.trim(),
            email: email.trim(),
            phone_number: telepon.trim(),
            genre: gender,
            semester: semester,
            faculty: fakultas.trim(),
            major: prodi.trim(),
            gpa: nilaiIpk,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "firebase_uid",
          }
        );

      if (profileError) {
        throw profileError;
      }

      alert("Profil berhasil diperbarui!");

      // Kembali ke halaman profil
      router.back();
    } catch (error: any) {
      console.error("Detail error penyimpanan:", error);

      alert(
        "Gagal menyimpan: " +
          (error?.message || "Terjadi kesalahan.")
      );
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return <main className={styles.page} />;
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label="Kembali"
        >
          <svg
            width="12"
            height="20"
            viewBox="0 0 12 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 2L2 10L10 18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <h1>Profil Kamu</h1>
        <div className={styles.headerSpace} />
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* FOTO PROFIL */}
        <section className={styles.photoSection}>
          <button
            type="button"
            className={styles.photoButton}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Pilih foto profil"
          >
            <Image
              src={foto}
              alt="Foto profil"
              width={100}
              height={100}
              className={styles.photo}
              unoptimized
            />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFoto}
          />

          <button
            type="button"
            className={styles.changePhoto}
            onClick={() => fileInputRef.current?.click()}
          >
            Ganti Foto
          </button>
        </section>

        {/* DATA PROFIL */}
        <section className={styles.fields}>
          <label className={styles.field}>
            <span>Nama</span>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Nomor handphone</span>
            <input
              type="tel"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              required
            />
          </label>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span>Gender</span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
                <option value="Memilih tidak menjawab">
                  Memilih tidak menjawab
                </option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Semester</span>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                required
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <option
                    key={index + 1}
                    value={String(index + 1)}
                  >
                    {index + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className={styles.field}>
            <span>Fakultas</span>
            <input
              type="text"
              value={fakultas}
              onChange={(e) => setFakultas(e.target.value)}
              required
            />
          </label>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span>Prodi</span>
              <input
                type="text"
                value={prodi}
                onChange={(e) => setProdi(e.target.value)}
                required
              />
            </label>

            <label className={styles.field}>
              <span>IPK</span>
              <input
                type="number"
                min="0"
                max="4"
                step="0.01"
                value={ipk}
                onChange={(e) => setIpk(e.target.value)}
                required
              />
            </label>
          </div>
        </section>

        {/* TOMBOL SIMPAN */}
        <button
          type="submit"
          className={styles.nextButton}
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Konfirmasi"}
        </button>
      </form>
    </main>
  );
}
