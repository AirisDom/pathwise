import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import FeaturedCourses from "@/components/sections/FeaturedCourses";
import Features from "@/components/sections/Features";

export default function House() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <FeaturedCourses />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
