import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-8 w-24 mb-2 bg-[#1b1111]" />
        <Skeleton className="h-4 w-64 bg-[#1b1111]" />
      </div>

      {[...Array(4)].map((_, i) => (
        <Card key={i} className="app-card mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-24 mb-2 bg-[#1b1111]" />
            <Skeleton className="h-4 w-48 bg-[#1b1111]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Skeleton className="h-3 w-16 mb-1 bg-[#1b1111]" />
              <Skeleton className="h-5 w-48 bg-[#1b1111]" />
            </div>
            <div>
              <Skeleton className="h-3 w-16 mb-1 bg-[#1b1111]" />
              <Skeleton className="h-5 w-64 bg-[#1b1111]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
