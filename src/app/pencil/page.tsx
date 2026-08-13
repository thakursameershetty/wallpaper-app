"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PencilPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] p-5 relative overflow-hidden bg-[#f0f2f5] dark:bg-zinc-950">

      {/* Back button */}
      <Link href="/" className="absolute top-6 left-6 p-3 bg-white/40 dark:bg-white/10 rounded-full backdrop-blur-md hover:scale-105 transition-transform z-10 shadow-sm">
        <ArrowLeft className="w-5 h-5 text-black dark:text-white" />
      </Link>

      {/* Spiderman Hanging */}
      <motion.img
        src="/spiderman-hanging.png"
        alt="Spiderman"
        className="absolute top-0 right-4 md:right-12 w-20 md:w-32 h-auto object-contain drop-shadow-2xl z-20 cursor-pointer origin-top"
        initial={{ y: -250, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          rotate: [-3, 3]
        }}
        transition={{
          y: { type: "spring", bounce: 0.25, duration: 1.5, delay: 0.2 },
          opacity: { duration: 1, delay: 0.2 },
          rotate: {
            repeat: Infinity,
            repeatType: "mirror",
            duration: 2.5,
            ease: "easeInOut",
          }
        }}
        whileTap={{ rotate: -15, scale: 0.95, transition: { type: "spring", duration: 0.3 } }}
      />

      <div className="flex flex-col items-center gap-8 max-w-sm w-full relative z-10 mt-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full aspect-[4/5] relative rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pencil-abhishek-photo.webp"
            alt="Pencil Abhishek"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.img
          layoutId="app-logo"
          src="/logo.png"
          alt="Logo"
          className="h-20 w-auto object-contain drop-shadow-2xl"
          transition={{
            layout: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col items-center gap-3 mt-4"
        >
          <a
            href="https://www.instagram.com/pencill.7/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-black/10 dark:border-white/10 flex items-center gap-2 backdrop-blur-sm"
          >
            <span className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">
              Instagram @pencill.7
            </span>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
