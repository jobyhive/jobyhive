'use client';

import React from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body className="antialiased flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
                <div className="max-w-md w-full text-center space-y-6">
                    <h2 className="text-3xl font-bold text-amber-400">Something went wrong!</h2>
                    <p className="text-neutral-400">
                        A global error occurred. This might be due to a technical issue on our end.
                    </p>
                    <div className="p-4 bg-neutral-900 rounded-lg text-left overflow-auto max-h-40">
                        <pre className="text-xs text-red-400">
                            {error.message || "Unknown error"}
                            {error.digest && `\nDigest: ${error.digest}`}
                        </pre>
                    </div>
                    <button
                        onClick={() => reset()}
                        className="px-8 py-3 bg-amber-400 text-black font-bold rounded-full hover:bg-amber-500 transition-all"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
