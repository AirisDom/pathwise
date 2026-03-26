import { HeroSection } from "@/components/sections/HeroSectionNew";
import HomeStatsBar from "@/components/sections/HomeStatsBar";
import HomeCategoryGrid from "@/components/sections/HomeCategoryGrid";
import DynamicFeaturedCourses from "@/components/sections/DynamicFeaturedCourses";
import HomeLumiSection from "@/components/sections/HomeLumiSection";
import HomeHowItWorks from "@/components/sections/HomeHowItWorks";
import HomeTeachCTA from "@/components/sections/HomeTeachCTA";
import HomeFooter from "@/components/sections/HomeFooter";

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
      <HomeFooter />
    </div>
  );
}
