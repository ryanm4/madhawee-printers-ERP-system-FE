"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { REPORT_CATALOG, ReportEntry, findReport, reportKey } from "./report-catalog";

interface ReportPickerProps {
    selectedKey: string | null;
    onSelect: (report: ReportEntry) => void;
}

/** Full list of reports on wide screens; a grouped dropdown on narrow ones (outside any form, so no Combobox). */
export function ReportPicker({ selectedKey, onSelect }: ReportPickerProps) {
    const [query, setQuery] = useState("");

    const groups = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return REPORT_CATALOG;
        return REPORT_CATALOG.map((group) => ({
            ...group,
            reports: group.reports.filter(
                (r) => r.label.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
            ),
        })).filter((group) => group.reports.length > 0);
    }, [query]);

    return (
        <>
            <div className="lg:hidden">
                <Select
                    value={selectedKey ?? ""}
                    onValueChange={(key) => {
                        const report = findReport(key);
                        if (report) onSelect(report);
                    }}
                >
                    <SelectTrigger className="w-full h-10" aria-label="Report">
                        <SelectValue placeholder="Choose a report" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[60vh]">
                        {REPORT_CATALOG.map((group) => (
                            <SelectGroup key={group.label}>
                                <SelectLabel>{group.label}</SelectLabel>
                                {group.reports.map((r) => (
                                    <SelectItem key={reportKey(r)} value={reportKey(r)}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <nav aria-label="Reports" className="hidden lg:flex flex-col gap-4 w-72 shrink-0 sticky top-4 max-h-[calc(100vh-6rem)]">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search reports"
                        aria-label="Search reports"
                        className="pl-8"
                    />
                </div>

                <div className="overflow-y-auto pr-1 -mr-1 space-y-5 pb-4">
                    {groups.length === 0 && (
                        <p className="text-sm text-muted-foreground px-3">No report matches &ldquo;{query}&rdquo;.</p>
                    )}
                    {groups.map((group) => (
                        <section key={group.label} aria-labelledby={`report-group-${group.label}`}>
                            <h2
                                id={`report-group-${group.label}`}
                                className="px-3 mb-1 text-[13px] font-semibold text-foreground/70"
                            >
                                {group.label}
                            </h2>
                            <ul className="space-y-px">
                                {group.reports.map((report) => {
                                    const key = reportKey(report);
                                    const selected = key === selectedKey;
                                    return (
                                        <li key={key}>
                                            <button
                                                type="button"
                                                onClick={() => onSelect(report)}
                                                aria-current={selected ? "page" : undefined}
                                                className={cn(
                                                    "w-full text-left rounded-md px-3 py-2 border-l-[3px] transition-colors",
                                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                                    selected
                                                        ? "border-primary bg-primary/[0.06]"
                                                        : "border-transparent hover:bg-muted"
                                                )}
                                            >
                                                <span className={cn("block text-sm", selected ? "font-semibold text-primary" : "font-medium")}>
                                                    {report.label}
                                                </span>
                                                {report.description && (
                                                    <span className="block text-xs text-muted-foreground leading-snug mt-0.5">
                                                        {report.description}
                                                    </span>
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ))}
                </div>
            </nav>
        </>
    );
}
