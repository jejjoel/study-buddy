"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Shell from "@/components/auth/forgot-password/Shell";
import OtpConfirm from "@/components/auth/forgot-password/OtpConfirm";

function OtpContent() {
  const router = useRouter();
  const email = useSearchParams().get("email") ?? "";

  return (
    <OtpConfirm
      email={email}
      onBack={() => router.back()}
      onNext={() => router.push("/login")}
    />
  );
}

// Halaman 2: konfirmasi OTP  ->  /otp
export default function OtpPage() {
  return (
    <Shell>
      <Suspense fallback={null}>
        <OtpContent />
      </Suspense>
    </Shell>
  );
}
