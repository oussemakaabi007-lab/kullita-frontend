"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthSync() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthChange = (event: StorageEvent) => {
      if (event.key === "login_event") {
        router.push("/dashboard"); 
        router.refresh();
      }
      if (event.key === "logout_event") {
        window.location.href = "/login";
      }
    };

    window.addEventListener("storage", handleAuthChange);
    return () => window.removeEventListener("storage", handleAuthChange);
  }, [router]);

  return null;
}