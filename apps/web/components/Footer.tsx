"use client";

import React from "react";
import { Github, Linkedin } from "lucide-react";
import Image from "next/image";

const XIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
    </svg>
);

export const Footer = () => {
    return (
        <footer className="py-16 border-t border-neutral-900">
            <div className="container max-w-6xl mx-auto px-6 text-center">
                <div className="flex flex-col items-center mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <Image alt="" src={"/imgs/joby-logo-text-light.png"} width={300} height={100} />
                    </div>
                    <p className="text-neutral-400 max-w-md leading-relaxed mb-8 text-lg">
                        Joby is an intelligent job automation assistant. that helps you find, optimize, and apply for jobs so you can focus on winning the interview.
                    </p>
                    <div className="flex items-center gap-4">
                        {[
                            { Icon: XIcon, href: "https://x.com/jobyhive" },
                            { Icon: Github, href: "https://github.com/jobyhive" },
                            { Icon: Linkedin, href: "https://www.linkedin.com/showcase/jobyhive" }
                        ].map(({ Icon, href }, i) => (
                            <a
                                key={i}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-amber-400 hover:border-amber-400 transition-all hover:bg-amber-400/5"
                            >
                                <Icon className="w-5 h-5" />
                            </a>
                        ))}
                    </div>
                </div>

                <div className="pt-8 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-neutral-500 text-sm font-medium">
                        {new Date().getFullYear()} © JobyHive. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 text-neutral-500 text-sm font-medium">
                        Made with 🍯 by <a href="https://github.com/airqb" target="_blank" rel="noopener noreferrer" className="underline text-amber-400 hover:text-amber-400 transition-colors">Ahmed.M.Yassin</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
