import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function BillingLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-4 w-16 mb-2 bg-[#1b1111]" />
        <Skeleton className="h-8 w-32 mb-2 bg-[#1b1111]" />
        <Skeleton className="h-4 w-64 bg-[#1b1111]" />
      </div>
      
      <Card className="app-card mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2 bg-[#1b1111]" />
          <Skeleton className="h-4 w-48 bg-[#1b1111]" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-2xl border-2 border-white/[0.08] bg-[#0f0909] p-5">
                <Skeleton className="h-5 w-16 mb-2 bg-[#1b1111]" />
                <Skeleton className="h-8 w-24 mb-6 bg-[#1b1111]" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full bg-[#1b1111]" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
