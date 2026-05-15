import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LogsLoading() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-8 w-36 mb-2 bg-[#1b1111]" />
        <Skeleton className="h-4 w-80 bg-[#1b1111]" />
      </div>
      <Card className="app-card mb-6">
        <CardHeader>
          <Skeleton className="h-5 w-20 mb-2 bg-[#1b1111]" />
          <Skeleton className="h-4 w-64 bg-[#1b1111]" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-10 w-48 bg-[#1b1111]" />
            <Skeleton className="h-10 w-[200px] bg-[#1b1111]" />
            <Skeleton className="h-10 w-[150px] bg-[#1b1111]" />
            <Skeleton className="h-10 w-[150px] bg-[#1b1111]" />
          </div>
        </CardContent>
      </Card>
      <Card className="app-card">
        <CardHeader>
          <Skeleton className="h-5 w-26 mb-2 bg-[#1b1111]" />
          <Skeleton className="h-4 w-32 bg-[#1b1111]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-6 w-16 bg-[#1b1111]" />
                <Skeleton className="h-6 w-12 bg-[#1b1111]" />
                <Skeleton className="h-6 flex-1 bg-[#1b1111]" />
                <Skeleton className="h-6 w-32 bg-[#1b1111]" />
                <Skeleton className="h-6 w-36 bg-[#1b1111]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
