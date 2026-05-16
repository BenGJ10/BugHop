"use client";

import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface LogEntry {
  id: string;
  type: "pr" | "issue";
  number: number;
  title: string;
  repository: string;
  date: string;
}

interface LogTableProps {
  logs: LogEntry[];
  hasActiveFilters: boolean;
}

export function LogTable({ logs, hasActiveFilters }: LogTableProps) {
  return (
    <Card className="app-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Logs</CardTitle>
            <CardDescription className="text-[#b49a8e]">{logs.length} entries found</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-12 text-[#b49a8e]">
            <p className="text-lg mb-2">No logs found</p>
            <p className="text-sm text-[#a28d83]">
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "Logs will appear here once the bot reviews something"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.08] hover:bg-transparent">
                  <TableHead className="text-[#d6c2b8] whitespace-nowrap">Type</TableHead>
                  <TableHead className="text-[#d6c2b8] whitespace-nowrap">Number</TableHead>
                  <TableHead className="text-[#d6c2b8] whitespace-nowrap">Title</TableHead>
                  <TableHead className="text-[#d6c2b8] whitespace-nowrap">Repository</TableHead>
                  <TableHead className="text-[#d6c2b8] whitespace-nowrap">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} className="border-white/[0.08] hover:bg-[#1b1111]">
                    <TableCell>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${log.type === "pr"
                            ? "bg-[#f5efe7]/10 text-[#f5efe7]"
                            : "bg-[#9a8f86]/15 text-[#9a8f86]"
                          }`}
                      >
                        {log.type === "pr" ? "PR" : "Issue"}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-[#d6c2b8] whitespace-nowrap">#{log.number}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-[#f5efe7]">
                      {log.title}
                    </TableCell>
                    <TableCell className="text-[#b49a8e] whitespace-nowrap">
                      {log.repository}
                    </TableCell>
                    <TableCell className="text-[#b49a8e] whitespace-nowrap">
                      {format(new Date(log.date), "MMM d, yyyy h:mm a")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
