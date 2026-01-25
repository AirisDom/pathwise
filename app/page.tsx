import { HeroSection } from "@/components/sections/HeroSectionNew";
import FeaturedCourses from "@/components/sections/FeaturedCourses";
import GoalSelection from "@/components/sections/GoalSelection";
import { Footer2 } from "@/components/ui/footer2";

const footerData = {
  logo: {
    src: "/images/logo.png",
    alt: "PathWise",
    title: "PathWise",
    url: "/",
  },
  tagline: "Learn, Grow, Succeed.",
  menuItems: [
    {
      title: "Product",
      links: [
        { text: "Courses", url: "#courses" },
        { text: "Pricing", url: "#" },
        { text: "Specializations", url: "#" },
        { text: "Certificates", url: "#" },
        { text: "Free Courses", url: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About", url: "#" },
        { text: "Careers", url: "#" },
        { text: "Blog", url: "#" },
        { text: "Press", url: "#" },
        { text: "Contact", url: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "Help Center", url: "#" },
        { text: "Community", url: "#" },
        { text: "Student Support", url: "#" },
        { text: "Teaching Center", url: "#" },
      ],
    },
    {
      title: "Social",
      links: [
        { text: "Twitter", url: "#" },
        { text: "LinkedIn", url: "#" },
        { text: "Facebook", url: "#" },
        { text: "Instagram", url: "#" },
      ],
    },
  ],
  copyright: "© 2026 PathWise. All rights reserved.",
  bottomLinks: [
    { text: "Terms of Service", url: "#" },
    { text: "Privacy Policy", url: "#" },
    { text: "Cookie Policy", url: "#" },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <div id="courses">
        <FeaturedCourses />
      </div>
      <GoalSelection />
      <Footer2 {...footerData} />
    </div>
  );
}
