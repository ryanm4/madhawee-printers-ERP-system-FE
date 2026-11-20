"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Landmark } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsApi, type BankAccount } from "@/modules/settings/api";
import type { BankDetailsMode, QuotationBankChoice } from "@/modules/quotations/types";
import { cn } from "@/lib/utils";

const MODES: { value: BankDetailsMode; label: string; hint: string }[] = [
  { value: "NONE", label: "Don't show", hint: "No bank details on the printout" },
  { value: "FULL", label: "Show all details", hint: "Including the account number" },
  { value: "HIDE_NUMBER", label: "Hide account number", hint: "Bank, branch and account name only" },
];

const accountLabel = (a: BankAccount) =>
  [a.bank_name, a.branch_name, a.currency].filter(Boolean).join(", ") + (a.is_default ? " (default)" : "");

/**
 * Which bank account a quotation prints, and whether its account number is shown.
 * An account that has since been removed falls back to the default, as the printout does.
 */
export function BankDetailsPicker({
  value,
  onChange,
}: {
  value: QuotationBankChoice;
  onChange: (value: QuotationBankChoice) => void;
}) {
  const [accounts, setAccounts] = useState<BankAccount[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Include retired accounts so an older quotation still shows the one it was saved with
    SettingsApi.getBankAccounts(true)
      .then((response) => !cancelled && setAccounts(response.data ?? []))
      .catch(() => !cancelled && setAccounts([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const active = (accounts ?? []).filter((a) => a.is_active || a.id === value.bank_account_id);
  const fallback = active.find((a) => a.is_default && a.is_active) ?? active.find((a) => a.is_active);
  const chosen = active.find((a) => a.id === value.bank_account_id) ?? fallback;
  const showing = value.bank_details !== "NONE";

  const setMode = (mode: BankDetailsMode) =>
    onChange({ bank_details: mode, bank_account_id: value.bank_account_id ?? fallback?.id ?? null });

  return (
    <fieldset className="flex min-w-0 flex-col gap-3 rounded-lg border border-[#E4E8F0] p-4">
      <legend className="flex items-center gap-2 px-1 text-sm font-medium text-[#14213D]">
        <Landmark className="size-4 text-[#4B5567]" aria-hidden />
        Bank details on the printout
      </legend>

      <RadioGroup
        value={value.bank_details}
        onValueChange={(mode) => setMode(mode as BankDetailsMode)}
        className="grid gap-2"
      >
        {MODES.map((mode) => (
          <Label
            key={mode.value}
            htmlFor={`bank-mode-${mode.value}`}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 font-normal transition-colors",
              value.bank_details === mode.value ? "border-[#223F7A] bg-[#F3F6FC]" : "border-[#E4E8F0] hover:bg-[#F7F9FC]"
            )}
          >
            <RadioGroupItem id={`bank-mode-${mode.value}`} value={mode.value} />
            <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-medium text-[#14213D]">{mode.label}</span>
              <span className="text-xs text-[#4B5567]">{mode.hint}</span>
            </span>
          </Label>
        ))}
      </RadioGroup>

      {showing &&
        (accounts === null ? (
          <p className="text-xs text-[#4B5567]">Loading bank accounts…</p>
        ) : active.length === 0 ? (
          <p className="text-sm text-[#4B5567]">
            No bank accounts saved yet.{" "}
            <Link href="/settings" className="font-medium text-[#223F7A] underline">
              Add one in Settings
            </Link>
            , then pick it here.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bank-account" className="text-sm font-medium text-[#14213D]">
              Bank account
            </Label>
            <Select
              value={chosen ? String(chosen.id) : undefined}
              onValueChange={(id) => onChange({ ...value, bank_account_id: Number(id) })}
            >
              <SelectTrigger id="bank-account" className="w-full sm:max-w-md">
                <SelectValue placeholder="Choose an account" />
              </SelectTrigger>
              <SelectContent>
                {active.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {accountLabel(a)}
                    {!a.is_active && " (retired)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {chosen && (
              <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 rounded-md bg-[#F7F8FA] px-3 py-2 text-xs">
                <dt className="text-[#4B5567]">Account name</dt>
                <dd className="text-[#14213D]">{chosen.account_name}</dd>
                <dt className="text-[#4B5567]">Account number</dt>
                <dd className={value.bank_details === "HIDE_NUMBER" ? "italic text-[#4B5567]" : "text-[#14213D]"}>
                  {value.bank_details === "HIDE_NUMBER" ? "Not printed" : chosen.account_number}
                </dd>
                {chosen.swift_code && (
                  <>
                    <dt className="text-[#4B5567]">SWIFT code</dt>
                    <dd className="text-[#14213D]">{chosen.swift_code}</dd>
                  </>
                )}
              </dl>
            )}
          </div>
        ))}
    </fieldset>
  );
}
