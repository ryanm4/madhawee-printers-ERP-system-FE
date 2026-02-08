"use client";

import { useState } from "react";
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
import { PAPER_TYPES } from "@/config/enum";

interface PaperTypeComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export const PaperTypeCombobox = ({
  value,
  onChange,
}: PaperTypeComboboxProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between pl-3 font-normal",
              !value && "text-muted-foreground"
            )}
          >
            {value
              ? Object.values(PAPER_TYPES).find((paper) => paper === value)
              : "Select Paper Type"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search paper type..." />
          <CommandList>
            <CommandEmpty>No paper type found.</CommandEmpty>
            <CommandGroup>
              {Object.entries(PAPER_TYPES).map(([key, itemValue]) => (
                <CommandItem
                  key={key}
                  value={itemValue}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      itemValue === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {itemValue}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
