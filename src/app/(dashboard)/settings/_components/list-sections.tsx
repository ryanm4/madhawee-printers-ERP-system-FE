"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OptionListKey } from "@/modules/settings/api";
import { SettingsSection } from "./settings-section";
import { ListsError, OptionListEditor, definitionFor, useSettingsOptionLists } from "./option-list-editor";

const NOTHING_DELETED =
  "Nothing here is deleted. Switching an entry off takes it out of the dropdowns, and records that already use it keep showing it.";

/** Item categories and sub-categories, side by side: the stock form picks one of each */
export function CategoriesSection() {
  const { data, error, isLoading, reload } = useSettingsOptionLists();

  return (
    <SettingsSection
      title="Item categories"
      description="How stock is grouped. Both lists appear when you add or edit a stock item, and in the inventory reports."
    >
      {error ? (
        <ListsError message={error} onRetry={reload} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {(
            [
              ["item_category", "Categories"],
              ["item_sub_category", "Sub-categories"],
            ] as [OptionListKey, string][]
          ).map(([key, label]) => (
            <div key={key} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-[#14213D]">{label}</h3>
              <OptionListEditor
                definition={definitionFor(data, key, label)}
                data={data}
                isLoading={isLoading}
                reload={reload}
                showDescription={false}
              />
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-[#4B5567]">{NOTHING_DELETED}</p>
    </SettingsSection>
  );
}

export function UnitsSection() {
  const { data, error, isLoading, reload } = useSettingsOptionLists();

  return (
    <SettingsSection
      title="Units of measure"
      description="How stock is counted or weighed, such as KG, SHEET or REEL. Each stock item has one, and it shows on goods received and issue notes."
    >
      {error ? (
        <ListsError message={error} onRetry={reload} />
      ) : (
        <div className="max-w-xl">
          <OptionListEditor
            definition={definitionFor(data, "unit_of_measure", "Units of measure")}
            data={data}
            isLoading={isLoading}
            reload={reload}
            showDescription={false}
            uppercase
          />
        </div>
      )}
      <p className="text-xs text-[#4B5567]">{NOTHING_DELETED}</p>
    </SettingsSection>
  );
}

const DROPDOWN_LISTS: [OptionListKey, string][] = [
  ["product_type", "Product types"],
  ["coating_type", "Coating types"],
  ["plate_status", "Plate status"],
  ["ink_status", "Ink status"],
];

/** The remaining choices on quotation, PO and job ticket forms */
export function DropdownListsSection() {
  const { data, error, isLoading, reload } = useSettingsOptionLists();

  return (
    <SettingsSection
      title="Dropdown lists"
      description="The choices on job ticket forms. Rename anything to match how your team talks about it."
    >
      {error ? (
        <ListsError message={error} onRetry={reload} />
      ) : (
        <Tabs defaultValue={DROPDOWN_LISTS[0][0]}>
          <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
            {DROPDOWN_LISTS.map(([key, label]) => (
              <TabsTrigger key={key} value={key}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          {DROPDOWN_LISTS.map(([key, label]) => (
            <TabsContent key={key} value={key} className="max-w-xl pt-3">
              <OptionListEditor
                definition={definitionFor(data, key, label)}
                data={data}
                isLoading={isLoading}
                reload={reload}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
      <p className="text-xs text-[#4B5567]">{NOTHING_DELETED}</p>
    </SettingsSection>
  );
}
