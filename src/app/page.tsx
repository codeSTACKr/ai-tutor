import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getOptionalServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function Home() {
  // Server-side authentication check - prevents content flashing
  const session = await getOptionalServerSession();
  
  // If user is authenticated, redirect to tutor
  if (session) {
    redirect("/tutor");
  }

  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 gap-16">
      {/* Header */}
      <header className="w-full flex items-center justify-between max-w-6xl">
        <h1 className="text-2xl font-bold">AI Tutor Demo</h1>
        <nav className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex flex-col gap-8 row-start-2 items-center text-center max-w-2xl">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
            AI Tutor Demo
          </h2>
          <p className="text-xl text-muted-foreground">
            An AI-powered tutoring application that generates interactive flashcards
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-blue-800 font-medium text-center">
              🧠 Sign in to access your AI tutoring dashboard and start learning with flashcards!
            </p>
          </div>
        </div>

        {/* Demo Features Preview */}
        <div className="w-full max-w-4xl">
          <h3 className="text-2xl font-bold text-center mb-6">What you&apos;ll get after signing in</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg space-y-3 text-center">
              <div className="text-3xl mb-2">🧠</div>
              <h4 className="font-semibold">AI-Generated Flashcards</h4>
              <p className="text-sm text-muted-foreground">
                Get personalized flashcards and explanations for any subject
              </p>
            </div>
            <div className="p-6 border rounded-lg space-y-3 text-center">
              <div className="text-3xl mb-2">📚</div>
              <h4 className="font-semibold">Interactive Learning</h4>
              <p className="text-sm text-muted-foreground">
                Flip cards, track progress, and learn at your own pace
              </p>
            </div>
            <div className="p-6 border rounded-lg space-y-3 text-center">
              <div className="text-3xl mb-2">💬</div>
              <h4 className="font-semibold">Chat Interface</h4>
              <p className="text-sm text-muted-foreground">
                Talk to your AI tutor and ask for help on any topic
              </p>
            </div>
          </div>
        </div>


        <div className="space-y-4 mt-8">
          <div className="text-center">
            <p className="text-lg font-medium mb-4">Ready to start learning with AI?</p>
          </div>
          <div className="flex gap-4 items-center justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Create Account & Start</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/login">Sign In to Tutor</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="row-start-3 text-center text-sm text-muted-foreground">
        <p>Built with Next.js, Better Auth, MongoDB, and shadcn/ui</p>
      </footer>
    </div>
  );
}