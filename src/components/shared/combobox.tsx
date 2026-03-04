"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { FormControl } from "@/components/ui/form"

interface ComboboxItem {
    value: string;
    label: string;
}

interface ComboboxGroup {
    label: string;
    items: ComboboxItem[];
}

interface ComboboxProps {
    items?: ComboboxItem[]
    groups?: ComboboxGroup[]
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    emptyMessage?: string
    searchPlaceholder?: string
    className?: string
    disabled?: boolean
}

export function Combobox({
    items,
    groups,
    value,
    onValueChange,
    placeholder = "Select item...",
    emptyMessage = "No item found.",
    searchPlaceholder = "Search item...",
    className,
    disabled = false,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    const allItems = React.useMemo(() => {
        const result: ComboboxItem[] = [];
        if (items) result.push(...items);
        if (groups) result.push(...groups.flatMap(group => group.items));
        return result;
    }, [items, groups]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn("w-full justify-between", className)}
                        disabled={disabled}
                    >
                        {value
                            ? allItems.find((item) => item.value === value)?.label || value
                            : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        {groups ? (
                            groups.map((group) => (
                                <CommandGroup key={group.label} heading={group.label}>
                                    {group.items.map((item) => (
                                        <CommandItem
                                            key={item.value}
                                            value={item.label}
                                            onSelect={(currentValue) => {
                                                const selectedItem = allItems.find(i => i.label.toLowerCase() === currentValue.toLowerCase())
                                                const newValue = selectedItem ? selectedItem.value : ""
                                                onValueChange(newValue === value ? "" : newValue)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === item.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {item.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ))
                        ) : (
                            <CommandGroup>
                                {allItems.map((item) => (
                                    <CommandItem
                                        key={item.value}
                                        value={item.label}
                                        onSelect={(currentValue) => {
                                            const selectedItem = allItems.find(i => i.label.toLowerCase() === currentValue.toLowerCase())
                                            const newValue = selectedItem ? selectedItem.value : ""
                                            onValueChange(newValue === value ? "" : newValue)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === item.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {item.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
