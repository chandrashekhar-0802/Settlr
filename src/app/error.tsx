"use client";

import { useEffect } from "react";
import { Button, LinkButton } from "@/components/ui";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Settlr error", error.digest ?? "");
  }, [error]);
  return (
    <main id="main" className="grid min-h-[60vh] flex-1 place-items-center px-4 text-center">
      <div>
        <h1 className="text-3xl font-extrabold">Something went wrong</h1>
        <p className="mt-2 text-muted">Your plan is safe. Try again, or head back home.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <LinkButton href="/" variant="secondary">Home</LinkButton>
        </div>
      </div>
    </main>
  );
}
