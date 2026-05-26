"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect this path to the new /auth/reset-password path for consistency
export default function UpdatePasswordRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/auth/reset-password");
  }, [router]);

  return null;
}
