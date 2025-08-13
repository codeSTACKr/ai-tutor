import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { getOptionalServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  // If user is already authenticated, redirect to tutor
  const session = await getOptionalServerSession();
  if (session) {
    redirect("/tutor");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="hover:text-brand underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/"
            className="hover:text-brand underline underline-offset-4"
          >
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}