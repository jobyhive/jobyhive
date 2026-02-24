"use client";

import React from "react";
import { motion } from "framer-motion";
import { Upload, Cpu, Send, CheckCircle } from "lucide-react";

const steps = [
    {
        title: "Upload Your CV",
        description: "Simply drop your current Resume/CV. Our AI analyzes your experience, skills, and preferences.",
        icon: Upload,
    },
    {
        title: "Joby Finds Matches",
        description: "Our agents scan the web for roles that align perfectly with your career goals and expertise.",
        icon: Cpu,
    },
    {
        title: "Automatic Submission",
        description: "Joby optimizes your application and submits it to multiple platforms—without you lifting a finger.",
        icon: Send,
    },
    {
        title: "Get Interviewed",
        description: "Sit back and wait for the interview invites to roll into your inbox. Joby handles the tedious work.",
        icon: CheckCircle,
    },
];

export const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-24  text-white relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">How It <span className="text-amber-500">Works</span></h2>
                    <p className="text-neutral-400 max-w-2xl mx-auto">
                        Getting your dream job has never been this simple. Four steps to a better career.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-neutral-800 -translate-y-1/2 z-0" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                                    <step.icon className="w-8 h-8 text-black" />
                                </div>
                                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                                    <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                                    <p className="text-neutral-400 text-sm leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
