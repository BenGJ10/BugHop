"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const chartConfig = {
  pullRequests: { label: "Pull Request", color: "#f5efe7" },
  issues: { label: "Issues", color: "#9a8f86" },
} satisfies ChartConfig;

interface ActivityChartProps {
  chartData: { date: string; pullRequests: number; issues: number }[];
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
}

export function ActivityChart({
  chartData,
  timeRange,
  onTimeRangeChange,
}: ActivityChartProps) {
  return (
    <Card className="app-card">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <CardTitle className="text-white">Activity Overview</CardTitle>
          <CardDescription className="text-[#b49a8e]">PRs and Issues analyzed over time</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-40 bg-[#120b0b] border-white/[0.08] text-[#e7d6cb]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#120b0b] border-white/[0.08]">
            <SelectItem value="90d">Last 3 months</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-6 pb-2">
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillPRs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f5efe7" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f5efe7" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillIssues" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9a8f86" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#9a8f86" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#241414" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#a28d83", fontSize: 12 }}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="issues"
              type="monotone"
              fill="url(#fillIssues)"
              stroke="#9a8f86"
              stackId="a"
            />
            <Area
              dataKey="pullRequests"
              type="monotone"
              fill="url(#fillPRs)"
              stroke="#f5efe7"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
