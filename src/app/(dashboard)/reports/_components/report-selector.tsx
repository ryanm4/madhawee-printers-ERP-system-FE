"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { REPORT_CATALOG, ReportEntry, ReportGroup, findGroup, reportKey } from "./report-catalog";

interface AreaTabsProps {
    selectedKey: string | null;
    onSelect: (report: ReportEntry) => void;
}

/** One tab per area of the business; choosing one opens its first report. */
export function ReportAreaTabs({ selectedKey, onSelect }: AreaTabsProps) {
    const activeGroup = findGroup(selectedKey);

    return (
        <div
            role="group"
            aria-label="Report areas"
            className="flex w-full gap-1 overflow-x-auto rounded-lg bg-muted p-1"
        >
            {REPORT_CATALOG.map((group) => {
                const Icon = group.icon;
                const active = group.id === activeGroup?.id;
                return (
                    <button
                        key={group.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => !active && onSelect(group.reports[0])}
                        className={cn(
                            "flex h-9 shrink-0 items-center gap-2 rounded-md px-3.5 text-sm font-medium transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                            active
                                ? "bg-background text-primary shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4" aria-hidden />
                        {group.label}
                    </button>
                );
            })}
        </div>
    );
}

interface ReportSelectProps {
    group: ReportGroup;
    selectedKey: string | null;
    onSelect: (report: ReportEntry) => void;
}

/** The reports in the current area, with a one-line hint for the chosen one. */
export function ReportSelect({ group, selectedKey, onSelect }: ReportSelectProps) {
    const selected = group.reports.find((r) => reportKey(r) === selectedKey);

    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor="report-select">Report</Label>
            <Select
                value={selectedKey ?? ""}
                onValueChange={(key) => {
                    const report = group.reports.find((r) => reportKey(r) === key);
                    if (report) onSelect(report);
                }}
            >
                <SelectTrigger id="report-select" className="h-10 w-full sm:w-[300px]">
                    <SelectValue placeholder="Choose a report" />
                </SelectTrigger>
                <SelectContent>
                    {group.reports.map((r) => (
                        <SelectItem key={reportKey(r)} value={reportKey(r)}>
                            {r.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {selected && <p className="text-[13px] text-muted-foreground">{selected.description}</p>}
        </div>
    );
}
