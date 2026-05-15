"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

//refer to this here : https://nextjs.org/docs/app/getting-started/error-handling

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
      <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
      <p className="text-[#666] text-sm">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={reset} className="border-white/[0.06] text-[#ccc] hover:bg-white/[0.04] bg-transparent border cursor-pointer">
        Try Again
      </Button>
    </div>
  );
}
