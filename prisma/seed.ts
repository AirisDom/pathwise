import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("Demo1234!", 10);

  // ── Demo Student ──
  const student = await db.user.upsert({
    where: { email: "student@demo.com" },
    update: {},
    create: {
      email: "student@demo.com",
      name: "Demo Student",
      password: hashedPassword,
      role: "STUDENT",
      emailVerified: new Date(),
      bio: "I'm a demo student account for PathWise.",
    },
  });

  // ── Demo Creator ──
  const creator = await db.user.upsert({
    where: { email: "creator@demo.com" },
    update: {},
    create: {
      email: "creator@demo.com",
      name: "Demo Creator",
      password: hashedPassword,
      role: "CREATOR",
      emailVerified: new Date(),
      title: "Senior Web Developer & Educator",
      bio: "I'm a demo creator account for PathWise.",
      creatorProfile: {
        create: {
          headline: "Senior Web Developer & Educator",
          expertise: "Web Development",
          experienceYears: 5,
          bio: "Demo creator account — feel free to explore the creator dashboard, create courses, and see all features.",
        },
      },
    },
  });

  console.log("\n✅ Demo accounts seeded successfully!\n");
  console.log("  Role     | Email               | Password");
  console.log("  ---------|---------------------|----------");
  console.log("  Student  | student@demo.com    | Demo1234!");
  console.log("  Creator  | creator@demo.com    | Demo1234!");
  console.log("\nOr just click the demo buttons on the login page.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
