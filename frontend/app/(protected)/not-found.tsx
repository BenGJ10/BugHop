import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
      <h2 className="text-xl font-semibold text-white">Page not found</h2>
      <p className="text-[#666] text-sm">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/dashboard">
        <Button className="border-white/[0.06] text-[#ccc] hover:bg-white/[0.04] bg-transparent border cursor-pointer">Go to Dashboard</Button>
      </Link>
    </div>
  );
}
