import { Hero } from "../components/Hero";
import { Features } from "../components/Features";
import { HowItWorks } from "../components/HowItWorks";
import { Agents } from "../components/Agents";
import { CTA } from "../components/CTA";
import { Footer } from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen font-sans selection:bg-amber-500/30">
      <Hero />
      <Features />
      <HowItWorks />
      <Agents />
      <CTA />
      <Footer />
    </main>
  );
}
