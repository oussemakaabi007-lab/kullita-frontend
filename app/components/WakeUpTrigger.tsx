"use client";
import { useEffect } from "react";

export default function WakeUpTrigger() {
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${baseUrl}/users/test`).catch(() => {});
  }, []);

  return null;
}