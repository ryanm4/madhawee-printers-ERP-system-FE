"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormControl } from "@/components/ui/form";

interface ComboboxItem {
  value: string;
  label: string;
}

interface ComboboxGroup {
  label: string;
  items: ComboboxItem[];
}

interface ComboboxProps {
  items?: ComboboxItem[];
  groups?: ComboboxGroup[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;

  // Optional: allow users to create a custom value
  allowCreate?: boolean;
  createLabel?: (value: string) => string;
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
  allowCreate = false,
  createLabel = (value) => `+ Add "${value}"`,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const allItems = React.useMemo(() => {
    const result: ComboboxItem[] = [];

    if (items) result.push(...items);
    if (groups) result.push(...groups.flatMap((group) => group.items));

    return result;
  }, [items, groups]);

  const hasExactMatch = React.useMemo(() => {
    const text = search.trim().toLowerCase();

    if (!text) return false;

    return allItems.some(
      (item) =>
        item.label.toLowerCase() === text || item.value.toLowerCase() === text
    );
  }, [allItems, search]);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue === value ? "" : selectedValue);
    setSearch("");
    setOpen(false);
  };

  const handleCreate = () => {
    const newValue = search.trim();

    if (!newValue) return;

    onValueChange(newValue);
    setSearch("");
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);

        if (!isOpen) {
          setSearch("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
            disabled={disabled}
          >
            <span className="truncate">
              {value
                ? allItems.find((item) => item.value === value)?.label || value
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            <CommandEmpty>
              {allowCreate && search.trim() ? (
                <CommandItem value={search} onSelect={handleCreate}>
                  {createLabel(search.trim())}
                </CommandItem>
              ) : (
                emptyMessage
              )}
            </CommandEmpty>

            <div
              style={{ maxHeight: "240px", overflowY: "auto" }}
              onWheel={(e) => e.stopPropagation()}
            >
              {groups ? (
                <>
                  {groups.map((group) => (
                    <CommandGroup key={group.label} heading={group.label}>
                      {group.items.map((item) => (
                        <CommandItem
                          key={item.value}
                          value={item.label}
                          onSelect={() => handleSelect(item.value)}
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
                  ))}

                  {allowCreate && search.trim() && !hasExactMatch && (
                    <CommandGroup>
                      <CommandItem value={search} onSelect={handleCreate}>
                        {createLabel(search.trim())}
                      </CommandItem>
                    </CommandGroup>
                  )}
                </>
              ) : (
                <>
                  <CommandGroup>
                    {allItems.map((item) => (
                      <CommandItem
                        key={item.value}
                        value={item.label}
                        onSelect={() => handleSelect(item.value)}
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

                  {allowCreate && search.trim() && !hasExactMatch && (
                    <CommandGroup>
                      <CommandItem value={search} onSelect={handleCreate}>
                        {createLabel(search.trim())}
                      </CommandItem>
                    </CommandGroup>
                  )}
                </>
              )}
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
