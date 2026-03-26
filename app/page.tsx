import { HeroSection } from "@/components/sections/HeroSection";
import HomeStatsBar from "@/components/sections/home/StatsBar";
import HomeCategoryGrid from "@/components/sections/home/CategoryGrid";
import DynamicFeaturedCourses from "@/components/sections/DynamicFeaturedCourses";
import HomeLumiSection from "@/components/sections/home/LumiSection";
import HomeHowItWorks from "@/components/sections/home/HowItWorks";
import HomeTeachCTA from "@/components/sections/home/TeachCTA";
import SiteFooter from "@/components/layout/SiteFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <HomeStatsBar />
      <HomeCategoryGrid />
      <DynamicFeaturedCourses />
      <HomeLumiSection />
      <HomeHowItWorks />
      <HomeTeachCTA />
      <SiteFooter />
    </div>
  );
}
