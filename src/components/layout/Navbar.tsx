"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

type NavItem = {
  label: string;
  icon: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Home", icon: "/images/Home.png", href: "/home" },
  { label: "Chat", icon: "/images/chat.png", href: "/chat" },
  { label: "Room Server", icon: "/images/room server.png", href: "/rooms" },
  { label: "Jadwal", icon: "/images/logo jadwal.png", href: "/schedule" },
  { label: "Profil", icon: "/images/Profile.png", href: "/profile" },
];

/**
 * Bottom navigation yang dipakai di seluruh halaman.
 * Tampilan & ukurannya sama dengan navbar halaman /home.
 *
 * Status aktif ditentukan otomatis dari URL saat ini, tapi bisa
 * ditimpa lewat prop `active` (mis. halaman /search dianggap "Home").
 */
export default function Navbar({ active }: { active?: string }) {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = active ? active === item.label : pathname === item.href;

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`${styles.navItem}${isActive ? ` ${styles.selected}` : ""}`}
          >
            <Image
              src={item.icon}
              alt=""
              width={24}
              height={24}
              className={styles.navIcon}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
