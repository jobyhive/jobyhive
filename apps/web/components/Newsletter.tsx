"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";

export const Newsletter = () => {
    return (
        <section className="py-24 px-6">
            <div className="container max-w-6xl mx-auto">
                <div className="p-8 md:p-12 rounded-3xl border border-neutral-800 bg-neutral-900/30 relative overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                        <div className="text-center lg:text-left">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Stay in the Loop</h2>
                            <p className="text-neutral-400 max-w-md text-lg">
                                Get updates on new features, integration. No spam, unsubscribe anytime.
                            </p>
                        </div>

                        <div className="w-full lg:w-auto">
                            <form className="flex flex-col sm:flex-row gap-3 min-w-[300px] md:min-w-[450px]" onSubmit={(e) => e.preventDefault()}>
                                <div className="relative flex-grow group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5 group-focus-within:text-amber-400 transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="w-full bg-black/50 border border-neutral-800 text-white rounded-full py-4 pl-12 pr-6 outline-none focus:border-amber-400/50 transition-all placeholder:text-neutral-600"
                                    />
                                </div>
                                <button className="bg-amber-400 hover:bg-amber-600 text-black font-bold h-14 px-8 rounded-full transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                                    Subscribe
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                            <p className="text-neutral-600 text-xs mt-4 text-center lg:text-left">
                                By subscribing, you agree to our Privacy Policy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
