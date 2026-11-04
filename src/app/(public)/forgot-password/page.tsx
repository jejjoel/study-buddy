"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/auth/forgot-password/Shell";
import ForgotPassword from "@/components/auth/forgot-password/ForgotPassword";

// Halaman 1: masukkan email  ->  /lupa-sandi
export default function LupaSandiPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <Shell>
      <ForgotPassword
        email={email}
        setEmail={setEmail}
        onNext={() => router.push(`/otp?email=${encodeURIComponent(email)}`)}
      />
    </Shell>
  );
}