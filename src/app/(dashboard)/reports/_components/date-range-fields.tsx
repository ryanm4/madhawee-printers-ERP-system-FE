"use client";

import React from "react";
import { Control, FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form";
import { endOfMonth, format, startOfMonth, startOfYear, subMonths } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const iso = (d: Date) => format(d, "yyyy-MM-dd");

const PRESETS = [
    { label: "This month", range: () => [startOfMonth(new Date()), new Date()] },
    { label: "Last month", range: () => [startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))] },
    { label: "This year", range: () => [startOfYear(new Date()), new Date()] },
] as const;

function DateField<T extends FieldValues>({ control, name, label }: { control: Control<T>; name: Path<T>; label: string }) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="w-[150px]">
                    <FormLabel>{label}</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant="outline" className="w-full h-10 pl-3 text-left font-normal tabular-nums">
                                    {field.value ? format(new Date(field.value), "d MMM yyyy") : "Pick a date"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                disabled={(date) => date > new Date()}
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => field.onChange(date ? iso(date) : "")}
                                captionLayout="dropdown"
                            />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

interface DateRangeFieldsProps<T extends FieldValues> {
    form: UseFormReturn<T>;
    fromName: Path<T>;
    toName: Path<T>;
}

/** From / To pickers with one-click ranges for the periods people report on most. */
export function DateRangeFields<T extends FieldValues>({ form, fromName, toName }: DateRangeFieldsProps<T>) {
    const from = form.watch(fromName);
    const to = form.watch(toName);

    return (
        <div className="flex flex-wrap items-end gap-3">
            <DateField control={form.control} name={fromName} label="From" />
            <DateField control={form.control} name={toName} label="To" />
            <div className="flex h-10 items-center gap-1" role="group" aria-label="Quick date ranges">
                {PRESETS.map((preset) => {
                    const [start, end] = preset.range();
                    const active = from === iso(start) && to === iso(end);
                    return (
                        <Button
                            key={preset.label}
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-pressed={active}
                            className={cn("h-8 px-2.5 text-xs", active ? "bg-primary/10 text-primary hover:bg-primary/10" : "text-muted-foreground")}
                            onClick={() => {
                                form.setValue(fromName, iso(start) as PathValue<T, Path<T>>, { shouldValidate: true });
                                form.setValue(toName, iso(end) as PathValue<T, Path<T>>, { shouldValidate: true });
                            }}
                        >
                            {preset.label}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
