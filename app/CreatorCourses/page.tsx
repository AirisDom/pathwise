"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreatorCourses() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/CreatorCourses/all");
  }, [router]);

  return null;
}
