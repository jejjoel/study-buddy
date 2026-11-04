"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navigation: NavItem[] = [
  { label: "Home", href: "/home", icon: "/images/Home.png" },
  { label: "Chat", href: "/chat", icon: "/images/chat.png" },
  { label: "Room Server", href: "/rooms", icon: "/images/room server.png" },
  { label: "Jadwal", href: "/schedule", icon: "/images/logo jadwal.png" },
  { label: "Profil", href: "/profile", icon: "/images/Profile.png" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="bottom-nav"
      aria-label="Navigasi Utama"
      style={{
        zIndex: 40,
        paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {navigation.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" &&
            item.href !== "/home" &&
            pathname?.startsWith(item.href));

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-label={item.label}
            className={`bottom-nav-item ${isActive ? "selected" : ""}`}
            style={{ textDecoration: "none", cursor: "pointer" }}
          >
            <Image
              src={item.icon}
              alt={item.label}
              width={24}
              height={24}
              className="bottom-nav-icon"
              style={{ objectFit: "contain" }}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
