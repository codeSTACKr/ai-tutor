import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Server-side utility to get authenticated user session
 * Redirects to login if no session exists
 */
export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      redirect("/auth/login");
    }

    return session;
  } catch (error) {
    console.error("Server session validation error:", error);
    redirect("/auth/login");
  }
}

/**
 * Server-side utility to check if user is authenticated
 * Returns session or null (doesn't redirect)
 */
export async function getOptionalServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    return session?.user ? session : null;
  } catch (error) {
    console.error("Server session check error:", error);
    return null;
  }
}