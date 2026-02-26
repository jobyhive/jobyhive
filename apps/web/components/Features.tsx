"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Zap, FileText, MessageCircle, Brain, Cloud, Cpu } from "lucide-react";

const features = [
    {
        title: "No need Machine to Runs",
        description: "Cloud-powered and always available — no dedicated machine required. Private and secure by design.",
        icon: Cloud,
    },
    {
        title: "Any Chat App",
        description: "Currently available on Telegram. Works in both direct messages and group chats.",
        icon: MessageCircle,
    },
    {
        title: "Persistent Memory",
        description: "Remembers you and becomes uniquely yours. Your preferences, your context, your AI.",
        icon: Brain,
    },
    {
        title: "AI Job Discovery",
        description: "Continuously scans thousands of job boards to find the best opportunities tailored to your profile.",
        icon: Search,
    },
    {
        title: "CV Optimization",
        description: "Automatically tailors your CV for each role, highlighting the most relevant skills and improving ATS compatibility.",
        icon: FileText,
    },
    {
        title: "Auto-Apply",
        description: "Saves hundreds of hours by filling out applications and submitting them on your behalf.",
        icon: Zap,
    },
    {
        title: "Smart Automation",
        description: "Handles repetitive job-search tasks end-to-end, so you can focus on interviews and career growth.",
        icon: Cpu,
    },
];

export const Features = () => {
    return (
        <section id="features" className="py-24 text-white relative">
            <div className="container max-w-6xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 gradient-text-01">What It Does</h2>
                    <p className="text-neutral-400 max-w-2xl mx-auto">
                        Automate your entire job search process with Joby&apos;s intelligent features.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-8 rounded-2xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/50 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-lg bg-amber-400/10 flex items-center justify-center mb-6 group-hover:bg-amber-400/20 transition-colors">
                                <feature.icon className="w-6 h-6 text-amber-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                            <p className="text-neutral-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
