/**
 * Seed script: Populate published courses with sections & lessons
 * Run: npx tsx prisma/seed-lessons.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// Sample video URLs (publicly accessible, CORS-friendly)
const SAMPLE_VIDEOS = [
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://www.w3schools.com/html/movie.mp4",
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4",
  "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
];

// Course content templates
const COURSE_CONTENT: Record<
  string,
  {
    sections: {
      title: string;
      description: string;
      lessons: {
        title: string;
        description: string;
        type: "VIDEO" | "ARTICLE";
        videoDuration?: number;
        articleContent?: string;
        isFree?: boolean;
        isPreview?: boolean;
      }[];
    }[];
  }
> = {
  // Fallback template used for any course
  default: {
    sections: [
      {
        title: "Getting Started",
        description: "Introduction and setup to get you up and running",
        lessons: [
          {
            title: "Welcome & Course Overview",
            description: "An overview of what you'll learn in this course",
            type: "VIDEO",
            videoDuration: 180,
            isFree: true,
            isPreview: true,
          },
          {
            title: "Setting Up Your Environment",
            description: "Install the required tools and configure your workspace",
            type: "VIDEO",
            videoDuration: 420,
          },
          {
            title: "Course Resources & Community",
            description: "Where to find additional resources and get help",
            type: "ARTICLE",
            articleContent:
              "<h3>Resources</h3><p>Throughout this course, you'll have access to downloadable resources, code samples, and a supportive community.</p><ul><li>Course GitHub repository with all code examples</li><li>Discussion forum for questions</li><li>Downloadable cheat sheets and reference guides</li></ul>",
          },
        ],
      },
      {
        title: "Core Fundamentals",
        description: "Learn the essential concepts and building blocks",
        lessons: [
          {
            title: "Understanding the Basics",
            description: "A deep dive into the fundamental concepts",
            type: "VIDEO",
            videoDuration: 600,
          },
          {
            title: "Key Terminology & Concepts",
            description: "Important terms and ideas you need to know",
            type: "VIDEO",
            videoDuration: 480,
          },
          {
            title: "Your First Hands-On Exercise",
            description: "Practice what you've learned with a guided exercise",
            type: "VIDEO",
            videoDuration: 720,
          },
          {
            title: "Summary & Key Takeaways",
            description: "Review of core concepts covered in this section",
            type: "ARTICLE",
            articleContent:
              "<h3>Section Summary</h3><p>In this section, you learned:</p><ol><li>The fundamental building blocks</li><li>Key terminology used throughout the industry</li><li>How to apply concepts through hands-on practice</li></ol><p>Make sure you're comfortable with these concepts before moving on!</p>",
          },
        ],
      },
      {
        title: "Intermediate Techniques",
        description: "Level up your skills with more advanced patterns",
        lessons: [
          {
            title: "Advanced Patterns & Best Practices",
            description: "Learn industry-standard patterns used by professionals",
            type: "VIDEO",
            videoDuration: 900,
          },
          {
            title: "Working with Real-World Data",
            description: "Apply your skills to realistic scenarios",
            type: "VIDEO",
            videoDuration: 780,
          },
          {
            title: "Debugging & Problem Solving",
            description: "Learn how to identify and fix common issues",
            type: "VIDEO",
            videoDuration: 540,
          },
        ],
      },
      {
        title: "Building a Project",
        description: "Put it all together with a complete project",
        lessons: [
          {
            title: "Project Planning & Architecture",
            description: "Plan and design your project before coding",
            type: "VIDEO",
            videoDuration: 660,
          },
          {
            title: "Building the Core Features",
            description: "Implement the main functionality step by step",
            type: "VIDEO",
            videoDuration: 1200,
          },
          {
            title: "Adding Polish & Final Touches",
            description: "Refine your project with professional finishing touches",
            type: "VIDEO",
            videoDuration: 840,
          },
          {
            title: "Deployment & Next Steps",
            description: "Deploy your project and learn where to go from here",
            type: "VIDEO",
            videoDuration: 600,
          },
        ],
      },
    ],
  },
};

async function main() {
  console.log("🌱 Seeding sections and lessons for published courses...\n");

  // Find published courses that have no sections yet
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    include: {
      _count: { select: { sections: true } },
    },
  });

  if (courses.length === 0) {
    console.log("❌ No published courses found.");
    return;
  }

  for (const course of courses) {
    if (course._count.sections > 0) {
      console.log(
        `⏭️  Skipping "${course.title}" — already has ${course._count.sections} sections`
      );
      continue;
    }

    console.log(`📚 Populating "${course.title}" (${course.id})...`);

    const template = COURSE_CONTENT.default;
    let videoIdx = 0;

    for (let sIdx = 0; sIdx < template.sections.length; sIdx++) {
      const sec = template.sections[sIdx];

      const section = await prisma.section.create({
        data: {
          courseId: course.id,
          title: sec.title,
          description: sec.description,
          order: sIdx + 1,
        },
      });

      console.log(`  📂 Section ${sIdx + 1}: ${sec.title}`);

      for (let lIdx = 0; lIdx < sec.lessons.length; lIdx++) {
        const les = sec.lessons[lIdx];

        await prisma.lesson.create({
          data: {
            sectionId: section.id,
            title: les.title,
            description: les.description,
            type: les.type,
            order: lIdx + 1,
            videoUrl:
              les.type === "VIDEO"
                ? SAMPLE_VIDEOS[videoIdx++ % SAMPLE_VIDEOS.length]
                : null,
            videoDuration: les.videoDuration ?? null,
            articleContent: les.articleContent ?? null,
            isFree: les.isFree ?? false,
            isPreview: les.isPreview ?? false,
          },
        });

        console.log(`    📄 Lesson ${lIdx + 1}: ${les.title} (${les.type})`);
      }
    }

    console.log(`  ✅ Done — added ${template.sections.length} sections\n`);
  }

  console.log("🎉 Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
