"use server";

import { cookies } from "next/headers";

export async function Delete() {
  const token = (await cookies()).get("token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${baseUrl}/users/me`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
 
  if (!res.ok) {
    throw new Error("Failed to Delete username");
  }
  (await cookies()).delete("token");
  return true;
}
