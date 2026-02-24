"use client";

import React from "react";
import { motion } from "framer-motion";

export const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden  text-white pt-20">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full" />

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        Meet Joby — Your AI Job Assistant
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
                        Secure Your Dream Job <br />
                        <span className="text-amber-500">Without Lifting a Finger</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg text-neutral-400 mb-10 leading-relaxed">
                        Joby leverages AI to search, optimize, and apply for relevant roles on your behalf.
                        By analyzing your CV, we boost your chances of landing interviews while you focus on what matters.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold h-12 px-8 rounded-full transition-all hover:scale-105">
                            Start Applying Now
                        </button>
                        <button className="border border-neutral-800 text-white h-12 px-8 rounded-full hover:bg-neutral-900 transition-all">
                            How it works
                        </button>
                    </div>
                </motion.div>

                {/* Decorative elements */}
                <div className="mt-20 relative px-4">
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent z-10 h-full" />
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 backdrop-blur-sm overflow-hidden aspect-video max-w-4xl mx-auto shadow-2xl">
                        <div className="w-full h-full bg-neutral-800 rounded-lg animate-pulse flex items-center justify-center">
                            <span className="text-neutral-500 font-mono text-sm">Dashboard Preview ✨</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
