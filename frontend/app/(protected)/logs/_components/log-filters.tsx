"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Repository {
  id: string;
  fullName: string;
}

interface LogFiltersProps {
  typeFilter: "all" | "pr" | "issue";
  onTypeFilterChange: (value: "all" | "pr" | "issue") => void;
  repoFilter: string;
  onRepoFilterChange: (value: string) => void;
  repositories: Repository[];
  startDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  endDate: Date | undefined;
  onEndDateChange: (date: Date | undefined) => void;
  onClearFilters: () => void;
}

export function LogFilters({
  typeFilter,
  onTypeFilterChange,
  repoFilter,
  onRepoFilterChange,
  repositories,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClearFilters,
}: LogFiltersProps) {
  return (
    <Card className="app-card mb-6">
      <CardHeader>
        <CardTitle className="text-lg text-white">Filters</CardTitle>
        <CardDescription className="text-[#b49a8e]">
          Filter logs by type, repository or date range
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-sm font-medium block mb-2 text-[#d6c2b8]">Type</label>
            <Tabs
              value={typeFilter}
              onValueChange={(v) =>
                onTypeFilterChange(v as "all" | "pr" | "issue")
              }
            >
              <TabsList className="bg-[#120b0b] border border-white/[0.08]">
                <TabsTrigger value="all" className="data-[state=active]:bg-[#f5efe7]/10 data-[state=active]:text-[#f5efe7] text-[#b49a8e]">All</TabsTrigger>
                <TabsTrigger value="pr" className="data-[state=active]:bg-[#f5efe7]/10 data-[state=active]:text-[#f5efe7] text-[#b49a8e]">Pull Requests</TabsTrigger>
                <TabsTrigger value="issue" className="data-[state=active]:bg-[#f5efe7]/10 data-[state=active]:text-[#f5efe7] text-[#b49a8e]">Issues</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2 text-[#d6c2b8]">Repository</label>
            <Select value={repoFilter} onValueChange={onRepoFilterChange}>
              <SelectTrigger className="w-50 bg-[#120b0b] border-white/[0.08] text-[#f5efe7]">
                <SelectValue placeholder="All Repositories" />
              </SelectTrigger>
              <SelectContent className="bg-[#120b0b] border-white/[0.08]">
                <SelectItem value="all">All Repositories</SelectItem>
                {repositories.map((repo) => (
                  <SelectItem key={repo.id} value={repo.id}>
                    {repo.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2 text-[#d6c2b8]">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-37.5 justify-start text-left font-normal bg-[#120b0b] border-white/[0.08] text-[#f5efe7] hover:bg-[#1b1111]"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {startDate ? format(startDate, "MMM d, yyyy") : "Pick Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#120b0b] border-white/[0.08]" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={onStartDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2 text-[#d6c2b8]">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-37.5 justify-start text-left font-normal bg-[#120b0b] border-white/[0.08] text-[#f5efe7] hover:bg-[#1b1111]"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {endDate ? format(endDate, "MMM d, yyyy") : "Pick Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#120b0b] border-white/[0.08]" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={onEndDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button variant="ghost" onClick={onClearFilters} className="text-[#b49a8e] hover:text-white hover:bg-[#1b1111] cursor-pointer">
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
