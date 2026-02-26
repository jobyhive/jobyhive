"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, Sparkles, BrainCircuit, MessageSquareCode } from "lucide-react";

const agents = [
    {
        name: "Scout",
        role: "Job Market Analyst",
        description: "Analyzes millions of job postings to find the ones best suited for your career trajectory.",
        icon: Bot,
        color: "bg-amber-400",
    },
    {
        name: "Writer",
        role: "Content Optimizer",
        description: "Tailors your CV and cover letters with surgical precision using advanced LLMs.",
        icon: Sparkles,
        color: "bg-yellow-400",
    },
    {
        name: "Strategy",
        role: "Career Pathing",
        description: "Provides insights on which skills to highlight to increase your match score for top-tier roles.",
        icon: BrainCircuit,
        color: "bg-orange-500",
    },
    {
        name: "Assistant",
        role: "Process Manager",
        description: "Handles follow-up emails and application tracking, keeping you updated in real-time.",
        icon: MessageSquareCode,
        color: "bg-amber-600",
    },
];

export const Agents = () => {
    return (
        <section id="agents" className="py-24  text-white overflow-hidden">
            <div className="container max-w-6xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Built with <br /> <span className="text-amber-400">Intelligent Agents</span></h2>
                        <p className="text-neutral-400 mb-8 leading-relaxed text-lg">
                            Joby isn&apos;t just a bot. It&apos;s a team of specialized AI agents working together to ensure your job search is professional, efficient, and successful.
                        </p>
                        <div className="space-y-4">
                            {['24/7 Monitoring', 'Personalized Strategy', 'Real-time Insights'].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                                    </div>
                                    <span className="text-neutral-300 font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {agents.map((agent, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 relative group overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-24 h-24 ${agent.color} opacity-[0.03] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500`} />
                                <agent.icon className="w-10 h-10 text-amber-400 mb-4" />
                                <h3 className="text-xl font-bold mb-1">{agent.name}</h3>
                                <p className="text-amber-400/80 text-xs font-semibold uppercase tracking-wider mb-3">{agent.role}</p>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    {agent.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
