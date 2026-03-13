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
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface PaperTypeComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export const PaperTypeCombobox = ({
  value,
  onChange,
}: PaperTypeComboboxProps) => {
  const [open, setOpen] = useState(false);
  const { inventoryList } = useSelector((state: RootState) => state.inventory);

  const paperTypes = Array.from(
    new Map(
      inventoryList
        .filter(
          (item) =>
            item.item_category &&
            (item.item_category.toUpperCase() === "PAPER" ||
              item.item_category.toUpperCase() === "BOARD")
        )
        .map((item) => [
          `${item.item_sub_category} ${item.item_name}`,
          {
            label: `${item.item_sub_category} ${item.item_name}`,
            value: `${item.item_sub_category} ${item.item_name}`,
            id: item.item_id,
          },
        ])
    ).values()
  );

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
              ? paperTypes.find((paper) => paper.value === value)?.label || value
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
              {paperTypes.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      item.value === value ? "opacity-100" : "opacity-0"
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
  );
};
