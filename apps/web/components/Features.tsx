"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Zap, FileText, Calendar, Shield, MousePointer2 } from "lucide-react";

const features = [
    {
        title: "AI Job Discovery",
        description: "Our intelligent agents scan thousands of job boards to find the perfect matches based on your unique profile.",
        icon: Search,
    },
    {
        title: "CV Optimization",
        description: "Joby automatically tailors your CV for each application, highlighting the most relevant skills for the role.",
        icon: FileText,
    },
    {
        title: "Auto-Apply",
        description: "Save hundreds of hours. Joby fills out application forms and submits them on your behalf automatically.",
        icon: Zap,
    },
    {
        title: "Interview Scheduling",
        description: "Once you get a bite, Joby helps coordinate interview times that fit your current schedule seamlessly.",
        icon: Calendar,
    },
    {
        title: "Smart Tracking",
        description: "Monitor every application, status update, and response from a single, unified dashboard.",
        icon: MousePointer2,
    },
    {
        title: "Data Privacy",
        description: "Your data is encrypted and secure. We only share information with employers when you're ready.",
        icon: Shield,
    },
];

export const Features = () => {
    return (
        <section id="features" className="py-24  text-white relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful Features for <br /> <span className="text-amber-500">Modern Job Seekers</span></h2>
                    <p className="text-neutral-400 max-w-2xl mx-auto">
                        Everything you need to automate your job search and land your next big role with ease.
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
                            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
                                <feature.icon className="w-6 h-6 text-amber-500" />
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
