import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-8 w-32 mb-2 bg-[#1b1111]" />
        <Skeleton className="h-4 w-64 bg-[#1b1111]" />
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="app-card">
            <CardHeader className="pb-2">
              <Skeleton className="h-3 w-20 mb-2 bg-[#1b1111]" />
              <Skeleton className="h-8 w-24 bg-[#1b1111]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-1.5 w-full rounded-full bg-[#1b1111]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="app-card">
        <CardHeader className="border-b border-white/[0.08] pb-4">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-5 w-36 mb-2 bg-[#1b1111]" />
              <Skeleton className="h-4 w-48 bg-[#1b1111]" />
            </div>
            <Skeleton className="h-10 w-40 bg-[#1b1111]" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Skeleton className="h-64 w-full bg-[#1b1111]" />
        </CardContent>
      </Card>
    </div>
  );
}
