"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" fillRule="evenodd" d="M16 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0m-2 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0" clipRule="evenodd" />
          <path fill="currentColor" fillRule="evenodd" d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1M3 12c0 2.09.713 4.014 1.908 5.542A8.99 8.99 0 0 1 12.065 14a8.98 8.98 0 0 1 7.092 3.458A9 9 0 1 0 3 12m9 9a8.96 8.96 0 0 1-5.672-2.012A6.99 6.99 0 0 1 12.065 16a6.99 6.99 0 0 1 5.689 2.92A8.96 8.96 0 0 1 12 21" clipRule="evenodd" />
        </svg>
      )
    },
    {
      href: "/gallery",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M5.127 3.502 5.25 3.5h9.5q.062 0 .123.002A2.25 2.25 0 0 0 12.75 2h-5.5a2.25 2.25 0 0 0-2.123 1.502M1 10.25A2.25 2.25 0 0 1 3.25 8h13.5A2.25 2.25 0 0 1 19 10.25v5.5A2.25 2.25 0 0 1 16.75 18H3.25A2.25 2.25 0 0 1 1 15.75zM3.25 6.5l-.123.002A2.25 2.25 0 0 1 5.25 5h9.5c.98 0 1.814.627 2.123 1.502L16.75 6.5z" />
        </svg>
      )
    },
    {
      href: "/explore",
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" fillRule="evenodd" d="M1.045 6.954a2.8 2.8 0 0 1 .217-.678L2.53 3.58A2.75 2.75 0 0 1 5.019 2h9.962a2.75 2.75 0 0 1 2.488 1.58l1.27 2.696q.152.325.216.678A1 1 0 0 1 19 7.25v1.5a2.75 2.75 0 0 1-2.75 2.75H3.75A2.75 2.75 0 0 1 1 8.75v-1.5a1 1 0 0 1 .045-.296m2.843-2.736A1.25 1.25 0 0 1 5.02 3.5h9.962c.484 0 .925.28 1.13.718l.957 2.032H14a1 1 0 0 0-.86.49l-.606 1.02a1 1 0 0 1-.86.49H8.236a1 1 0 0 1-.894-.553l-.448-.894A1 1 0 0 0 6 6.25H2.932z" clipRule="evenodd" />
          <path fill="currentColor" d="M1 14a1 1 0 0 1 1-1h4a1 1 0 0 1 .894.553l.448.894a1 1 0 0 0 .894.553h3.438a1 1 0 0 0 .86-.49l.606-1.02A1 1 0 0 1 14 13h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2z" />
        </svg>
      )
    }
  ];

  const activeIndex = navItems.findIndex(item => item.href === pathname);

  // if not found, default to 0 for demo purposes, or -1 if we don't want to show selection
  const safeActiveIndex = activeIndex === -1 ? 0 : activeIndex;

  if (pathname === "/admin") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="relative flex items-center p-1.5 bg-white dark:bg-zinc-900 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.05)] border border-zinc-100 dark:border-zinc-800 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80">

        {/* Moving Pill Background */}
        <div
          className="absolute left-1.5 top-1.5 bottom-1.5 w-14 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            transform: `translateX(${safeActiveIndex * 100}%)`,
            backgroundColor: 'rgba(223, 31, 45, 0.1)' // #DF1F2D with 10% opacity
          }}
        />

        {navItems.map((item, idx) => {
          const isActive = idx === safeActiveIndex;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center justify-center w-14 h-12 rounded-full z-10 transition-colors duration-300",
                isActive ? "text-[#DF1F2D]" : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              )}
              aria-label={`Navigate to ${item.href === "/" ? "home" : item.href.slice(1)}`}
            >
              {item.icon}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
