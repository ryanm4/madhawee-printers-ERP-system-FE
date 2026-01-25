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

interface ComboboxProps {
    items: { value: string; label: string }[]
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
    value,
    onValueChange,
    placeholder = "Select item...",
    emptyMessage = "No item found.",
    searchPlaceholder = "Search item...",
    className,
    disabled = false,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

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
                            ? items.find((item) => item.value === value)?.label || value
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
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.label}
                                    onSelect={(currentValue) => {
                                        // Match by label to find the correct value because CommandItem value filtering is by text
                                        const selectedItem = items.find(i => i.label.toLowerCase() === currentValue.toLowerCase())
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
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
