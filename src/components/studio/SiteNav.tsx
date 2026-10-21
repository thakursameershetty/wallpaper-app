"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "Work", href: "#work" },
  { label: "Wall art", href: "#wall-art" },
  { label: "Reel", href: "#reel" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // off the home page the section links lead back to it ("/#about"), not to a section that is not here
  const home = usePathname() === "/";
  const to = (href: string) => (home ? href : `/${href}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200 ${
        scrolled || open ? "border-[var(--rule)] bg-paper/95" : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <a href={to("#top")} className="flex items-center" aria-label="Abishek — back to top">
          <Image src="/desk/logo-abishek.webp" alt="Abishek" width={900} height={553} className="h-8 w-auto" preload />
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={to(l.href)} className="text-sm font-medium text-ink/65 transition-colors hover:text-ink">
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <Link href="/gallery" className="btn-solid inline-block rounded-full px-4 py-2 text-sm font-medium">
              Wallpapers ↗
            </Link>
          </li>
        </ul>

        <button
          className="-mr-2 flex h-10 w-10 items-center justify-center md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <ul className="fade-in mx-auto flex max-w-6xl flex-col px-5 pb-4 md:hidden">
          {[...LINKS, { label: "Wallpapers ↗", href: "/gallery" }].map((l) => (
            <li key={l.href} className="border-t border-[var(--rule)]">
              <a
                href={l.href.startsWith("#") ? to(l.href) : l.href}
                onClick={() => setOpen(false)}
                className="block py-3.5 text-lg font-medium"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
