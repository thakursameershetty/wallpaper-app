import Image from "next/image";

// About sits right under the hero, so on phones it gives up its place in the bar
const LINKS = [
  { label: "About", href: "#about", wide: true },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

/** The logo, and a strip of paper with the way around pinned to the top right. */
export function Nav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[10000] flex items-center justify-between px-5 py-5 md:px-10">
      <a href="#top" className="pointer-events-auto shrink-0 rounded-full bg-[#f8f4ea] px-4 py-1.5 shadow-[0_6px_18px_rgb(0_0_0/0.25)]" aria-label="Abishek — back to top">
        <Image src="/desk/logo-abishek.webp" alt="Abishek" width={900} height={553} className="h-8 w-auto" preload />
      </a>
      <nav className="pointer-events-auto flex items-center gap-0.5 whitespace-nowrap rounded-full bg-[#f8f4ea] p-1 text-[13px] font-medium sm:gap-1 sm:text-sm text-[#161616] shadow-[0_6px_18px_rgb(0_0_0/0.25)]">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className={`${"wide" in l ? "hidden sm:block" : ""} rounded-full px-3 py-2 transition-colors sm:px-3.5 duration-200 hover:bg-[#161616]/[0.07]`}>
            {l.label}
          </a>
        ))}
        {/* a full page load: the gallery is its own app, and the browser shows its loading spinner straight away */}
        <a href="/gallery" className="rounded-full bg-[#161616] px-3 py-2 sm:px-3.5 text-white transition-colors duration-200 hover:bg-black">
          Wallpapers ↗
        </a>
      </nav>
    </header>
  );
}
