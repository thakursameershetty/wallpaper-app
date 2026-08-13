"use client";

import { useSearch } from "@/context/SearchContext";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useSearch();
  const pathname = usePathname();

  return (
    <div className={cn("relative flex-1 max-w-[400px]", pathname === "/admin" ? "mr-[60px]" : "")}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 text-zinc-400">
          <circle cx="11" cy="11" r="8" strokeWidth="2.5"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2.5" strokeLinecap="round"></line>
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-400/50 shadow-sm text-[14px] font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-shadow"
      />
    </div>
  );
}
