"use client";

import { useState } from "react";
import { Building2, Coins, FolderTree, Hash, Landmark, ListChecks, Ruler, type LucideIcon } from "lucide-react";
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb";
import { cn } from "@/lib/utils";
import { CompanySection } from "./_components/company-section";
import { CurrencySection } from "./_components/currency-section";
import { BankAccountsSection } from "./_components/bank-accounts-section";
import { CategoriesSection, DropdownListsSection, UnitsSection } from "./_components/list-sections";
import { NumberingSection } from "./_components/numbering-section";

/**
 * Settings, laid out as an index of places rather than a wall of cards: each panel is a
 * separate job, and only the chosen one renders, so opening Settings doesn't load everything.
 */
interface SettingsPanel {
  id: string;
  label: string;
  /** Shown under the label so the right panel is obvious from the nav */
  hint: string;
  icon: LucideIcon;
  render: () => React.ReactNode;
}

const PANELS: SettingsPanel[] = [
  { id: "company", label: "Company", hint: "Details and quotation terms", icon: Building2, render: () => <CompanySection /> },
  { id: "currency", label: "Currency", hint: "The USD rate", icon: Coins, render: () => <CurrencySection /> },
  { id: "bank", label: "Bank accounts", hint: "Where customers pay", icon: Landmark, render: () => <BankAccountsSection /> },
  { id: "categories", label: "Item categories", hint: "How stock is grouped", icon: FolderTree, render: () => <CategoriesSection /> },
  { id: "units", label: "Units of measure", hint: "How stock is counted", icon: Ruler, render: () => <UnitsSection /> },
  { id: "lists", label: "Dropdown lists", hint: "The choices on your forms", icon: ListChecks, render: () => <DropdownListsSection /> },
  { id: "numbering", label: "Document numbering", hint: "Job ticket number formats", icon: Hash, render: () => <NumberingSection /> },
];

export default function SettingsPage() {
  const [activeId, setActiveId] = useState(PANELS[0].id);
  const active = PANELS.find((p) => p.id === activeId) ?? PANELS[0];

  return (
    <div className="mt-3 flex flex-1 flex-col gap-6 p-4 pt-0 sm:p-6 sm:pt-0">
      <PageTitleWithBreadcrumb
        title="Settings"
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* A scrolling row of chips on a phone; the sidebar index from lg */}
        <nav
          aria-label="Settings sections"
          className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:sticky lg:top-4 lg:mx-0 lg:w-60 lg:shrink-0 lg:flex-col lg:self-start lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {PANELS.map((panel) => {
            const isActive = panel.id === active.id;
            const Icon = panel.icon;
            return (
              <button
                key={panel.id}
                type="button"
                onClick={() => setActiveId(panel.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex shrink-0 items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#223F7A]/40",
                  isActive
                    ? "bg-white text-[#14213D] shadow-[0_0_0_1px_#E4E8F0]"
                    : "text-[#4B5567] hover:bg-white/70 hover:text-[#14213D]"
                )}
              >
                {isActive && (
                  <span aria-hidden className="absolute inset-y-2 left-0 hidden w-0.5 rounded-full bg-[#223F7A] lg:block" />
                )}
                <Icon className={cn("mt-0.5 size-4 shrink-0", isActive && "text-[#223F7A]")} aria-hidden />
                <span className="flex flex-col gap-0.5">
                  <span className={cn("whitespace-nowrap text-sm", isActive && "font-semibold")}>{panel.label}</span>
                  <span className="hidden text-xs text-[#4B5567] lg:block">{panel.hint}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1 pb-6">{active.render()}</div>
      </div>
    </div>
  );
}
