"use client";

import { useCallback, useEffect, useState } from "react";
import { Landmark, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { AlertDeleteDialog } from "@/components/shared/delete_popup";
import { getErrorMessage } from "@/lib/error-utils";
import { cn } from "@/lib/utils";
import { SettingsApi, type BankAccount, type BankAccountInput } from "@/modules/settings/api";
import { ListsError } from "./option-list-editor";
import { SettingsSection } from "./settings-section";

/**
 * Where customers pay. The default account prints on quotations. Account formats are only
 * checked for being filled in: the bank is the authority on whether a number is real.
 */
export function BankAccountsSection() {
  const [accounts, setAccounts] = useState<BankAccount[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BankAccount | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await SettingsApi.getBankAccounts(true);
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load bank accounts"));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (id: number, work: () => Promise<unknown>, success: string, failure: string) => {
    setBusyId(id);
    try {
      await work();
      await load();
      toast.success(success);
    } catch (err) {
      toast.error(getErrorMessage(err, failure));
    } finally {
      setBusyId(null);
    }
  };

  const openForm = (account: BankAccount | null) => {
    setEditing(account);
    setFormOpen(true);
  };

  return (
    <SettingsSection
      title="Bank accounts"
      description="The payment details printed on quotations. The default account is the one that prints."
      action={
        <Button onClick={() => openForm(null)}>
          <Plus aria-hidden />
          Add account
        </Button>
      }
    >
      {error ? (
        <ListsError message={error} onRetry={load} />
      ) : !accounts ? (
        <div className="grid gap-4 lg:grid-cols-2" aria-busy>
          {[0, 1].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-lg border border-[#E4E8F0] bg-[#F1F3F8]" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-[#D9DFE8] bg-white px-6 py-10 text-center">
          <Landmark className="size-6 text-[#4B5567]" aria-hidden />
          <p className="font-medium text-[#14213D]">No bank accounts yet</p>
          <p className="max-w-sm text-sm text-[#4B5567]">
            Add the account customers pay into and it will print on your quotations.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              isBusy={busyId === account.id}
              onEdit={() => openForm(account)}
              onMakeDefault={() =>
                run(account.id, () => SettingsApi.setDefaultBankAccount(account.id), "Default account changed", "Couldn't change the default")
              }
              onToggleActive={(is_active) =>
                run(
                  account.id,
                  () => SettingsApi.updateBankAccount(account.id, { is_active }),
                  is_active ? "Account switched on" : "Account switched off",
                  "Couldn't update the account"
                )
              }
              onDelete={() => setDeleteTarget(account)}
            />
          ))}
        </div>
      )}

      <AccountDialog key={editing?.id ?? "new"} open={formOpen} account={editing} onOpenChange={setFormOpen} onSaved={load} />

      <AlertDeleteDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        handleSubmit={() => {
          const target = deleteTarget;
          setDeleteTarget(null);
          if (target) {
            run(target.id, () => SettingsApi.deleteBankAccount(target.id), "Account removed", "Couldn't remove the account");
          }
        }}
      />
    </SettingsSection>
  );
}

function AccountCard({
  account,
  isBusy,
  onEdit,
  onMakeDefault,
  onToggleActive,
  onDelete,
}: {
  account: BankAccount;
  isBusy: boolean;
  onEdit: () => void;
  onMakeDefault: () => void;
  onToggleActive: (isActive: boolean) => void;
  onDelete: () => void;
}) {
  const rows: [string, string | null][] = [
    ["Account name", account.account_name],
    ["Account number", account.account_number],
    ["SWIFT", account.swift_code],
  ];

  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 overflow-hidden rounded-lg border bg-white p-4 pl-5",
        account.is_default ? "border-[#B8C4D9]" : "border-[#E4E8F0]",
        !account.is_active && "opacity-70"
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-1", account.is_default ? "bg-[#223F7A]" : "bg-[#E4E8F0]")}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate font-semibold text-[#14213D]">{account.bank_name}</p>
          {account.branch_name && <p className="truncate text-sm text-[#4B5567]">{account.branch_name} branch</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge variant="outline">{account.currency}</Badge>
          {account.is_default && <Badge className="bg-[#223F7A]">Default</Badge>}
          {!account.is_active && <Badge variant="secondary">Off</Badge>}
        </div>
      </div>

      <dl className="flex flex-col gap-1.5 text-sm">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="text-[#4B5567]">{label}</dt>
              <dd className={cn("truncate text-right text-[#14213D]", label !== "Account name" && "font-mono text-[13px]")}>
                {value}
              </dd>
            </div>
          ))}
      </dl>

      <div className="mt-auto flex flex-wrap items-center gap-1 border-t border-[#EEF1F5] pt-3">
        <label className="flex items-center gap-2 text-sm text-[#4B5567]">
          <Checkbox
            checked={account.is_active}
            // The default can't be switched off; another has to take over first
            disabled={isBusy || account.is_default}
            onCheckedChange={(checked) => onToggleActive(checked === true)}
          />
          In use
        </label>
        <div className="ml-auto flex items-center gap-1">
          {isBusy && <Loader2 className="size-4 animate-spin text-[#4B5567]" aria-hidden />}
          {!account.is_default && account.is_active && (
            <Button variant="ghost" size="sm" onClick={onMakeDefault} disabled={isBusy}>
              <Star aria-hidden />
              Make default
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onEdit} disabled={isBusy}>
            <Pencil aria-hidden />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isBusy}
            className="text-[#4B5567] hover:text-red-700"
          >
            <Trash2 aria-hidden />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}

type Form = {
  bank_name: string;
  branch_name: string;
  account_name: string;
  account_number: string;
  swift_code: string;
  currency: string;
  notes: string;
  is_default: boolean;
};

function AccountDialog({
  open,
  account,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  account: BankAccount | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState<Form>({
    bank_name: account?.bank_name ?? "",
    branch_name: account?.branch_name ?? "",
    account_name: account?.account_name ?? "",
    account_number: account?.account_number ?? "",
    swift_code: account?.swift_code ?? "",
    currency: account?.currency ?? "LKR",
    notes: account?.notes ?? "",
    is_default: account?.is_default ?? false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof Form, upper = false) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = upper ? event.target.value.toUpperCase() : event.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found: Partial<Record<keyof Form, string>> = {};
    if (!form.bank_name.trim()) found.bank_name = "Enter the bank's name.";
    if (!form.account_name.trim()) found.account_name = "Enter the name on the account.";
    if (!form.account_number.trim()) found.account_number = "Enter the account number.";
    if (!/^[A-Za-z]{3}$/.test(form.currency.trim())) found.currency = "Use a three-letter code, such as LKR.";
    if (Object.keys(found).length > 0) return setErrors(found);

    const payload: BankAccountInput = { ...form, currency: form.currency.trim().toUpperCase() };
    setSaving(true);
    try {
      if (account) await SettingsApi.updateBankAccount(account.id, payload);
      else await SettingsApi.createBankAccount(payload);
      await onSaved();
      onOpenChange(false);
      toast.success(account ? "Account updated" : "Account added");
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't save the account"));
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof Form, label: string, props: React.ComponentProps<typeof Input> = {}, upper = false) => (
    <Field data-invalid={errors[key] ? true : undefined}>
      <FieldLabel htmlFor={`bank-${key}`}>{label}</FieldLabel>
      <Input
        id={`bank-${key}`}
        value={form[key] as string}
        onChange={set(key, upper)}
        aria-invalid={!!errors[key]}
        disabled={saving}
        {...props}
      />
      {errors[key] && <FieldError>{errors[key]}</FieldError>}
    </Field>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{account ? "Edit bank account" : "Add bank account"}</DialogTitle>
          <DialogDescription>
            Enter the details exactly as your bank gives them. They print on quotations, so a typo here
            reaches your customers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <FieldGroup className="gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {field("bank_name", "Bank", { autoFocus: true })}
              {field("branch_name", "Branch")}
            </div>
            {field("account_name", "Name on the account")}
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
              {field("account_number", "Account number", { className: "font-mono" })}
              {field("currency", "Currency", { maxLength: 3, placeholder: "LKR", className: "uppercase" }, true)}
            </div>
            {field("swift_code", "SWIFT code", { className: "font-mono uppercase", placeholder: "Optional" }, true)}
            <Field>
              <FieldLabel htmlFor="bank-notes">Notes</FieldLabel>
              <Textarea id="bank-notes" rows={2} value={form.notes} onChange={set("notes")} disabled={saving} />
              <FieldDescription>For your own reference. Not printed.</FieldDescription>
            </Field>
            {!account?.is_default && (
              <label className="flex items-center gap-2 text-sm text-[#14213D]">
                <Checkbox
                  checked={form.is_default}
                  onCheckedChange={(checked) => setForm((f) => ({ ...f, is_default: checked === true }))}
                  disabled={saving}
                />
                Make this the default account on quotations
              </label>
            )}
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" aria-hidden />}
              {account ? "Save account" : "Add account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
