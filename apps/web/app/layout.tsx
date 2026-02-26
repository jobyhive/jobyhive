import React from "react";
import "./globals.css";

export const metadata = {
  title: 'JobyHive',
  description: 'AI Job Assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
