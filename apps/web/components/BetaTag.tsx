"use client";

import React from "react";
import { motion } from "framer-motion";

export const BetaTag = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        delay: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="fixed top-4 right-4 md:top-8 md:right-8 z-[100] pointer-events-none select-none"
    >
      <div className="relative group pointer-events-auto cursor-default">
        {/* Ambient background glow */}
        <div className="absolute -inset-4 bg-amber-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition duration-700"></div>

        <motion.div
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-4 md:py-2 bg-neutral-950/80 backdrop-blur-2xl border border-white/10 rounded-xl md:rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-amber-500/50 hover:bg-black/90"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute w-2 h-2 bg-amber-500 rounded-full animate-ping opacity-40"></div>
            <div className="relative w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]"></div>
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-[9px] md:text-xs font-black  uppercase bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Beta Phase
            </span>
            <span className="text-[8px] md:text-[9px] font-medium text-neutral-500 tracking-wider">
              v1.1.0-alpha
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
