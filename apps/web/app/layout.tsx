import React from "react";
import "./globals.css";
import { BetaTag } from "../components/BetaTag";
import GoogleAnalytics from "../components/GoogleAnalytics";

export const metadata = {
  title: "JobyHive - Your AI Job Assistant",
  description:
    "Joby leverages AI to search, optimize, and apply for relevant roles on your behalf. Secure your dream job without lifting a finger.",
  metadataBase: new URL("https://www.jobyhive.com"),
  alternates: {
    canonical: "https://www.jobyhive.com",
  },
  openGraph: {
    title: "JobyHive - Your AI Job Assistant",
    description:
      "Secure your dream job without lifting a finger. Joby leverages AI to search, optimize, and apply for relevant roles on your behalf.",
    url: "https://www.jobyhive.com",
    siteName: "JobyHive",
    images: [
      {
        url: "https://jobyhive.com/og-image.png",
        alt: "JobyHive - Your AI Job Assistant",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JobyHive - Your AI Job Assistant",
    description:
      "Secure your dream job without lifting a finger. Joby leverages AI to search, optimize, and apply for relevant roles on your behalf.",
    images: ["https://jobyhive.com/og-image.png"],
    creator: "@jobyhive",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <GoogleAnalytics />
        <BetaTag />
        {children}
      </body>
    </html>
  );
}
