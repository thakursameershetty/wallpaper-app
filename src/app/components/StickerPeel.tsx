"use client";

import { useRef, useEffect, useMemo, useId } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import "./StickerPeel.css";

interface StickerPeelProps {
    imageSrc: string;
    rotate?: number;
    peelBackHoverPct?: number;
    peelBackActivePct?: number;
    peelEasing?: string;
    peelHoverEasing?: string;
    width?: number;
    shadowIntensity?: number;
    lightingIntensity?: number;
    peelDirection?: number;
    className?: string;
    style?: React.CSSProperties;
    layoutId?: string;
}

const StickerPeel = ({
    imageSrc,
    rotate = 30,
    peelBackHoverPct = 30,
    peelBackActivePct = 40,
    peelEasing = "power3.out",
    peelHoverEasing = "power2.out",
    width = 200,
    shadowIntensity = 0.6,
    lightingIntensity = 0.1,
    peelDirection = 0,
    className = "",
    style,
    layoutId,
}: StickerPeelProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const pointLightRef = useRef<SVGFEPointLightElement>(null);
    const pointLightFlippedRef = useRef<SVGFEPointLightElement>(null);

    // Unique IDs so multiple stickers don't conflict
    const uniqueId = useId();
    const safeId = uniqueId.replace(/:/g, "_");
    const pointLightId = `pointLight_${safeId}`;
    const pointLightFlippedId = `pointLightFlipped_${safeId}`;
    const dropShadowId = `dropShadow_${safeId}`;
    const expandAndFillId = `expandAndFill_${safeId}`;
    const outlineId = `outline_${safeId}`;

    const defaultPadding = 12; // Large enough to accommodate rotation without clipping corners

    useEffect(() => {
        const updateLight = (e: MouseEvent) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            gsap.set(pointLightRef.current, { attr: { x, y } });

            const normalizedAngle = Math.abs(peelDirection % 360);
            if (normalizedAngle !== 180) {
                gsap.set(pointLightFlippedRef.current, {
                    attr: { x, y: rect.height - y },
                });
            } else {
                gsap.set(pointLightFlippedRef.current, {
                    attr: { x: -1000, y: -1000 },
                });
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener("mousemove", updateLight);
            return () => container.removeEventListener("mousemove", updateLight);
        }
    }, [peelDirection]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleTouchStart = () => container.classList.add("touch-active");
        const handleTouchEnd = () => container.classList.remove("touch-active");

        container.addEventListener("touchstart", handleTouchStart);
        container.addEventListener("touchend", handleTouchEnd);
        container.addEventListener("touchcancel", handleTouchEnd);

        return () => {
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchend", handleTouchEnd);
            container.removeEventListener("touchcancel", handleTouchEnd);
        };
    }, []);

    const cssVars = useMemo(
        () =>
            ({
                "--sticker-rotate": `${rotate}deg`,
                "--sticker-p": `${defaultPadding}px`,
                "--sticker-peelback-hover": `${peelBackHoverPct}%`,
                "--sticker-peelback-active": `${peelBackActivePct}%`,
                "--sticker-peel-easing": peelEasing,
                "--sticker-peel-hover-easing": peelHoverEasing,
                "--sticker-width": `${width}px`,
                "--sticker-shadow-opacity": shadowIntensity,
                "--sticker-lighting-constant": lightingIntensity,
                "--peel-direction": `${peelDirection}deg`,
            }) as React.CSSProperties,
        [rotate, peelBackHoverPct, peelBackActivePct, peelEasing, peelHoverEasing, width, shadowIntensity, lightingIntensity, peelDirection]
    );

    return (
        <div className={`sticker-wrapper ${className}`} style={{ ...cssVars, ...style }}>
            <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                    {/* Filter for creating the white sticker outline on the front */}
                    <filter id={outlineId} x="-20%" y="-20%" width="140%" height="140%">
                        <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="dilated" />
                        <feFlood floodColor="white" result="outlineColor" />
                        <feComposite in="outlineColor" in2="dilated" operator="in" result="outline" />
                        <feMerge>
                            <feMergeNode in="outline" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id={pointLightId}>
                        <feGaussianBlur stdDeviation="1" result="blur" />
                        <feSpecularLighting result="spec" in="blur" specularExponent={100} specularConstant={lightingIntensity} lightingColor="white">
                            <fePointLight ref={pointLightRef} x="100" y="100" z="300" />
                        </feSpecularLighting>
                        <feComposite in="spec" in2="SourceGraphic" result="lit" />
                        <feComposite in="lit" in2="SourceAlpha" operator="in" />
                    </filter>

                    <filter id={pointLightFlippedId}>
                        <feGaussianBlur stdDeviation="10" result="blur" />
                        <feSpecularLighting result="spec" in="blur" specularExponent={100} specularConstant={lightingIntensity * 7} lightingColor="white">
                            <fePointLight ref={pointLightFlippedRef} x="100" y="100" z="300" />
                        </feSpecularLighting>
                        <feComposite in="spec" in2="SourceGraphic" result="lit" />
                        <feComposite in="lit" in2="SourceAlpha" operator="in" />
                    </filter>

                    <filter id={dropShadowId}>
                        <feDropShadow dx="2" dy="4" stdDeviation={3 * shadowIntensity} floodColor="black" floodOpacity={shadowIntensity} />
                    </filter>

                    {/* Filter for the back flap: Creates the white outline AND the gray back core */}
                    <filter id={expandAndFillId} x="-20%" y="-20%" width="140%" height="140%">
                        <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="dilated" />
                        <feFlood floodColor="white" result="outlineColor" />
                        <feComposite in="outlineColor" in2="dilated" operator="in" result="outline" />

                        <feOffset dx="0" dy="0" in="SourceAlpha" result="shape" />
                        <feFlood floodColor="rgb(200,200,200)" result="flood" />
                        <feComposite operator="in" in="flood" in2="shape" result="core" />

                        <feMerge>
                            <feMergeNode in="outline" />
                            <feMergeNode in="core" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>

            <div className="sticker-container" ref={containerRef}>
                <div className="sticker-main" style={{ filter: `url(#${dropShadowId})` }}>
                    <div className="sticker-lighting" style={{ filter: `url(#${pointLightId})` }}>
                        {layoutId ? (
                            <motion.img
                                layoutId={layoutId}
                                src={imageSrc}
                                alt=""
                                className="sticker-image"
                                draggable="false"
                                onContextMenu={(e) => e.preventDefault()}
                                style={{ filter: `url(#${outlineId})` }}
                            />
                        ) : (
                            <img
                                src={imageSrc}
                                alt=""
                                className="sticker-image"
                                draggable="false"
                                onContextMenu={(e) => e.preventDefault()}
                                style={{ filter: `url(#${outlineId})` }}
                            />
                        )}
                    </div>
                </div>

                <div className="flap">
                    <div className="flap-lighting" style={{ filter: `url(#${pointLightFlippedId})` }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageSrc}
                            alt=""
                            className="flap-image"
                            draggable="false"
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ filter: `url(#${expandAndFillId})` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StickerPeel;