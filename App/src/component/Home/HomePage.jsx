import AboutSection from "./components/AboutSection";
import AIFlashcardsSection from "./components/AIFlashcardsSection";
import FeaturesSection from "./components/FeaturesSection";
import FinalCTASection from "./components/FinalCTASection";
import HomeFooter from "./components/HomeFooter";
import HomeHeader from "./components/HomeHeader";
import HeroSection from "./components/HeroSection";
import HowItWorksSection from "./components/HowItWorksSection";
import useTheme from "./hooks/useTheme";

export default function HomePage() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-slate-100">
      <HomeHeader darkMode={darkMode} onToggleTheme={toggleTheme} />

      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <AIFlashcardsSection />
        <AboutSection />
        <FinalCTASection />
      </main>

      <HomeFooter />
    </div>
  );
}
