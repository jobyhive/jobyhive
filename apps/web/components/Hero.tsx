"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { X, Play } from "lucide-react";
import Image from "next/image";

export const Hero = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden text-white pt-20">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/10 blur-[120px] rounded-full" />

            <div className="container max-w-6xl mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm font-medium mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                        </span>
                        Meet Joby — Your AI Job Assistant
                    </div>

                    <motion.div
                        animate={{
                            y: [0, -12, 0],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Image src="/imgs/joby.png" alt="Joby" width={200} height={200} className="mx-auto" />
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
                        Secure Your Dream Job <br />
                        <span className="gradient-text-01">Without Lifting a Finger</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg text-neutral-400 mb-10 leading-relaxed">
                        Joby leverages AI to search, optimize, and apply for relevant roles on your behalf.
                        By analyzing your CV, we boost your chances of landing interviews while you focus on what matters.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-amber-400 hover:bg-amber-500 text-black font-semibold h-12 px-8 rounded-full transition-all hover:scale-105 active:scale-95"
                        >
                            Meet Your AI Job Assistant
                        </button>
                        <button className="border border-neutral-800 text-white h-12 px-8 rounded-full hover:bg-neutral-900 transition-all">
                            How it works
                        </button>
                    </div>
                </motion.div>

                {/* Decorative elements */}
                <div className="mt-20 relative px-4">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setIsVideoModalOpen(true)}
                        className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-2 md:p-4 backdrop-blur-sm overflow-hidden aspect-video max-w-4xl mx-auto shadow-2xl cursor-pointer group relative"
                    >
                        <Image
                            src="/imgs/dashboard-preview.png"
                            alt="Joby Dashboard"
                            fill
                            className="object-cover rounded-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                <Play className="text-black ml-1" fill="currentColor" size={32} />
                            </div>
                        </div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-white font-medium text-sm">Watch the Demo ✨</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-center"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-black transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-black mb-2">Start with Joby</h3>
                                <p className="text-neutral-600">Scan the QR code to meet Joby — your AI Job Assistant.</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl inline-block mb-6">
                                <QRCodeSVG
                                    value="https://t.me/JobyHiveBot"
                                    size={200}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: "/imgs/joby.png",
                                        x: undefined,
                                        y: undefined,
                                        height: 40,
                                        width: 40,
                                        excavate: true,
                                    }}
                                />
                            </div>

                            <div className="space-y-3">
                                <a
                                    href="https://t.me/JobyHiveBot"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-3 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-xl transition-colors"
                                >
                                    Open in Telegram
                                </a>
                                <p className="text-xs text-neutral-400">
                                    Already have Telegram? Just click the button above.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Video Modal */}
            <AnimatePresence>
                {isVideoModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-20">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsVideoModalOpen(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <button
                                onClick={() => setIsVideoModalOpen(false)}
                                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black text-white transition-colors rounded-full"
                            >
                                <X size={24} />
                            </button>

                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/cM0tMFaNRAI?autoplay=1"
                                title="Joby Demo Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            ></iframe>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};
