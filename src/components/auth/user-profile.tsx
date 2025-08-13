"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession, authClient } from "@/lib/auth-client";

export function UserProfile() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Successfully signed out");
      router.push("/");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  if (isPending) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No user session found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome back!</CardTitle>
        <CardDescription>
          You are successfully signed in to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Name</div>
          <div className="font-medium">{session.user.name || "Not provided"}</div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Email</div>
          <div className="font-medium">{session.user.email}</div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">User ID</div>
          <div className="font-mono text-xs bg-muted p-2 rounded">
            {session.user.id}
          </div>
        </div>
        <Button onClick={handleSignOut} variant="outline" className="w-full">
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
}