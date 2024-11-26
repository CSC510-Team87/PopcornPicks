// app/page.tsx
"use client";

import React, { useEffect } from "react";
import { APP_CONSTANTS } from "@/app/lib/constants";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function LandingPage() {
  const { data: session, status } = useSession();

  // If user is not logged in, redirect to login page
  console.log("status:", status)
  console.log("key:", !localStorage.getItem("token"))
  if (!localStorage.getItem("token")) {
    redirect("/login");
  }

  const { theme } = useTheme();
  const router = useRouter();

  return (
    <>
        {/* Main Content */}
        <main className="flex-grow flex">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold">
                🎬 PopcornPicks 🍿: Pick a Movie! 🎬
              </h2>
              <div className="space-y-2 text-lg text-muted-foreground">
                <p>
                  Discover personalized movie recommendations by selecting up to
                  5 of your favorite films.
                </p>
                <p>
                  Create a watchlist and have it conveniently sent to your
                  email.
                </p>
                <p>Enjoy movies at your own pace, on your terms.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <Button
                size="lg"
                className="w-full"
                onClick={() => router.push("/search")}
                color="primary"
              >
                Get Started!
              </Button>
              <Button
                size="lg"
                className="w-full"
                onClick={() => router.push("/wall")}
                color="primary"
              >
                Go to Wall!
              </Button>
              <Button
                size="lg"
                className="w-full"
                onClick={() => router.push("/review")}
                color="primary"
              >
                Review a Movie!
              </Button>
              <Button
                size="lg"
                className="w-full"
                onClick={() => router.push("/profile")}
                color="primary"
              >
                Profile
              </Button>
              <Button
                size="lg"
                className="w-full"
                onClick={() => router.push("/watchlist")}
                color="primary"
              >
                See your Watchlist!
              </Button>
            </div>
          </div>
        </main>
    </>
  );
}