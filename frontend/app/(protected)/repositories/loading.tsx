import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RepositoriesLoading() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-4 w-32 mb-2 bg-[#1b1111]" />
          <Skeleton className="h-8 w-48 mb-2 bg-[#1b1111]" />
          <Skeleton className="h-4 w-64 bg-[#1b1111]" />
        </div>
        <Skeleton className="h-10 w-32 bg-[#1b1111]" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="app-card">
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-3/4 mb-2 bg-[#1b1111]" />
              <Skeleton className="h-4 w-1/2 bg-[#1b1111]" />
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-[#0f0909] rounded-xl border border-white/[0.08]">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-16 bg-[#1b1111]" />
                  <Skeleton className="h-4 w-20 bg-[#1b1111]" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full bg-[#1b1111] mt-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
