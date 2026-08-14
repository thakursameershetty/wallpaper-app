"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

// Simple utility to merge classes (replaces the need for @/lib/utils in this file)
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

export interface NavItem {
    label: string;
    href: string;
}

export interface SpotlightNavbarProps {
    items?: NavItem[];
    className?: string;
    onItemClick?: (item: NavItem, index: number) => void;
    defaultActiveIndex?: number;
}

export default function SpotlightNavbar({
    items = [
        { label: "Home", href: "#" },
        { label: "Gallery", href: "#gallery" },
        { label: "Motion", href: "#motion" },
        { label: "Contact", href: "#contact" },
    ],
    className,
    onItemClick,
    defaultActiveIndex = 0,
}: SpotlightNavbarProps) {
    const navRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
    const [hoverX, setHoverX] = useState<number | null>(null);

    const spotlightX = useRef(0);
    const ambienceX = useRef(0);

    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = nav.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setHoverX(x);
            spotlightX.current = x;
            nav.style.setProperty("--spotlight-x", `${x}px`);
        };

        const handleMouseLeave = () => {
            setHoverX(null);
            const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);
            if (activeItem) {
                const navRect = nav.getBoundingClientRect();
                const itemRect = activeItem.getBoundingClientRect();
                const targetX = itemRect.left - navRect.left + itemRect.width / 2;

                animate(spotlightX.current, targetX, {
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    onUpdate: (v) => {
                        spotlightX.current = v;
                        nav.style.setProperty("--spotlight-x", `${v}px`);
                    },
                });
            }
        };

        nav.addEventListener("mousemove", handleMouseMove);
        nav.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            nav.removeEventListener("mousemove", handleMouseMove);
            nav.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [activeIndex]);

    useEffect(() => {
        if (!navRef.current) return;
        const nav = navRef.current;
        const activeItem = nav.querySelector(`[data-index="${activeIndex}"]`);

        if (activeItem) {
            const navRect = nav.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();
            const targetX = itemRect.left - navRect.left + itemRect.width / 2;

            animate(ambienceX.current, targetX, {
                type: "spring",
                stiffness: 200,
                damping: 20,
                onUpdate: (v) => {
                    ambienceX.current = v;
                    nav.style.setProperty("--ambience-x", `${v}px`);
                },
            });
        }
    }, [activeIndex]);

    const handleItemClick = (item: NavItem, index: number) => {
        setActiveIndex(index);
        onItemClick?.(item, index);

        // Smooth scroll to the target section
        if (item.href && item.href.startsWith("#")) {
            const targetId = item.href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const navbarHeight = 80; // Account for fixed navbar
                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                    top: elementPosition - navbarHeight,
                    behavior: "smooth",
                });
            }
        }
    };

    return (
        <div className={cn("fixed top-6 left-1/2 -translate-x-1/2 z-50", className)}>
            <nav
                ref={navRef}
                className={cn(
                    /* LIQUID GLASS EFFECT CLASSES */
                    "backdrop-blur-xl bg-white/40 border border-white/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)]",
                    "relative h-10 md:h-12 rounded-full transition-all duration-300 overflow-hidden"
                )}
                // Injecting the light colors directly via style to avoid <style jsx>
                style={{
                    "--spotlight-color": "rgba(0,0,0,0.05)",
                    "--ambience-color": "rgba(0,0,0,0.6)",
                } as React.CSSProperties}
            >
                <ul className="relative flex items-center h-full px-1 md:px-2 gap-0 md:gap-1 z-[10]">
                    {items.map((item, idx) => (
                        <li key={idx} className="relative h-full flex items-center justify-center">
                            <a
                                href={item.href}
                                data-index={idx}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleItemClick(item, idx);
                                }}
                                className={cn(
                                    "px-2 md:px-5 py-1.5 text-[11px] md:text-sm font-medium transition-colors duration-300 rounded-full",
                                    activeIndex === idx
                                        ? "text-black"
                                        : "text-neutral-500 hover:text-black"
                                )}
                            >
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* 1. The Moving Spotlight (Follows Mouse) */}
                <div
                    className="pointer-events-none absolute bottom-0 left-0 w-full h-full z-[1] transition-opacity duration-300"
                    style={{
                        opacity: hoverX !== null ? 1 : 0,
                        background: `radial-gradient(100px circle at var(--spotlight-x) 50%, var(--spotlight-color) 0%, transparent 50%)`,
                    }}
                />

                {/* 2. The Active State Ambience (Bottom glowing line) */}
                <div
                    className="pointer-events-none absolute bottom-0 left-0 w-full h-[2px] z-[2]"
                    style={{
                        background: `radial-gradient(40px circle at var(--ambience-x) 0%, var(--ambience-color) 0%, transparent 100%)`,
                    }}
                />
            </nav>
        </div>
    );
}