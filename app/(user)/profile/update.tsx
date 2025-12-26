"use server";

import { cookies } from "next/headers";

export async function Update(newUsername: string) {
  const token = (await cookies()).get("token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${baseUrl}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      userName: newUsername
    })
  });
  
  if (!res.ok) {
    throw new Error("Failed to update username");
  }
  const data= await res.json();
   (await cookies()).set("token", data.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });
  return true;
}
