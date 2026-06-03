import { redirect } from "next/navigation";

/**
 * Root route entry. Automatically redirects users to the application
 * dashboard flow (which handles login redirects if unauthenticated).
 */
export default function Home() {
  redirect("/dashboard");
}
