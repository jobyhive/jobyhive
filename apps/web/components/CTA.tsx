"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
// bg-neutral-950
export const CTA = () => {
    return (
        <section className="py-24  px-6">
            <div className="container mx-auto">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 p-12 lg:p-20 text-center text-black">
                    {/* Decorative background circle */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                            Ready to land your <br /> next interview?
                        </h2>
                        <p className="text-black/80 max-w-xl mx-auto text-lg md:text-xl font-medium mb-10 leading-relaxed">
                            Join thousands of job seekers who have automated their career growth with Joby. Your smart assistant is waiting.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="bg-black hover:bg-neutral-900 text-white font-bold h-14 px-10 rounded-full group transition-all flex items-center justify-center">
                                Create Free Account
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <p className="text-black/60 text-sm font-semibold">No credit card required</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
