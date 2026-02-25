"use client";

import React from "react";
import { Github, Twitter, Linkedin, Heart } from "lucide-react";

export const Footer = () => {
    return (
        <footer className=" py-16 border-t border-neutral-900">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-2xl font-black tracking-tighter text-white">Joby<span className="text-amber-500">Hive</span></span>
                        </div>
                        <p className="text-neutral-400 max-w-xs leading-relaxed mb-6">
                            Joby is an intelligent job automation platform. We help you find, optimize, and apply for jobs so you can focus on winning the interview.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Twitter, Github, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-amber-500 hover:border-amber-500 transition-all">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Platform</h4>
                        <ul className="space-y-4 text-neutral-400">
                            {['Features', 'How it Works', 'Pricing', 'Security'].map((link) => (
                                <li key={link}>
                                    <a href={`#${link.toLowerCase().replace(/ /g, '-')}`} className="hover:text-amber-500 transition-colors">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-neutral-400">
                            {['About Us', 'Careers', 'Contact', 'Privacy Policy'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="hover:text-amber-500 transition-colors">{link}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-neutral-500 text-sm">
                        {new Date().getFullYear()} © JobyHive.
                    </p>
                    <div className="flex items-center gap-1 text-neutral-500 text-sm">
                        Joby, a smart job assistant made with
                        <Heart className="w-4 h-4 text-red-500 fill-red-500 inline" />
                        by <a href="https://github.com/airqb" target="_blank" rel="noopener noreferrer" className="underline text-amber-500">Ahmed.M.Yassin</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
