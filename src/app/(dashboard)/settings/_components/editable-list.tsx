"use client";

import { useState } from "react";
import { Check, Loader2, Pencil, Plus, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { PanelSkeleton } from "./settings-section";

/**
 * The editor behind every list in Settings: categories, units and each dropdown.
 *
 * Every list needs the same four things: see what is there, add, rename and switch off
 * or back on. Nothing is deleted, because records store the value as text and removing
 * it would leave them pointing at nothing. Editing happens inline: these are one-field
 * records, and a dialog would hide the list the new name has to be distinct from.
 */

export interface EditableRow {
  id: number;
  label: string;
  /** Detail shown under the name, e.g. what older records store */
  secondary?: string;
  isActive: boolean;
}

export function EditableList({
  rows,
  isLoading = false,
  busyId = null,
  isAdding = false,
  onAdd,
  onRename,
  onSetActive,
  addLabel = "Add",
  addPlaceholder = "New entry",
  emptyText,
  className,
}: {
  rows: EditableRow[];
  isLoading?: boolean;
  /** The row being saved, which disables it */
  busyId?: number | null;
  isAdding?: boolean;
  /** Resolves true when the entry was saved, so the field only clears on success */
  onAdd: (label: string) => Promise<boolean>;
  onRename: (id: number, label: string) => Promise<boolean>;
  onSetActive: (id: number, isActive: boolean) => void;
  addLabel?: string;
  addPlaceholder?: string;
  emptyText: string;
  className?: string;
}) {
  const [draft, setDraft] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const submitNew = async (event: React.FormEvent) => {
    event.preventDefault();
    const label = draft.trim().replace(/\s+/g, " ");
    if (!label) return setAddError("Enter a name first.");
    // Caught here so the person sees the clash without losing what they typed
    const clash = rows.find((r) => r.label.toLowerCase() === label.toLowerCase());
    if (clash) {
      return setAddError(
        clash.isActive
          ? `"${clash.label}" is already on this list.`
          : `"${clash.label}" is already on this list but switched off. Switch it back on instead.`
      );
    }
    setAddError(null);
    if (await onAdd(label)) setDraft("");
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {isLoading ? (
        <PanelSkeleton />
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#D9DFE8] bg-white px-4 py-6 text-center text-sm text-[#4B5567]">
          {emptyText}
        </p>
      ) : (
        <ul className="divide-y divide-[#EEF1F5] rounded-lg border border-[#E4E8F0] bg-white">
          {rows.map((row) =>
            editingId === row.id ? (
              <li key={row.id} className="p-2.5">
                <RowEditor
                  row={row}
                  isBusy={busyId === row.id}
                  siblings={rows}
                  onCancel={() => setEditingId(null)}
                  onSave={async (label) => {
                    if (await onRename(row.id, label)) setEditingId(null);
                  }}
                />
              </li>
            ) : (
              <ListRow
                key={row.id}
                row={row}
                isBusy={busyId === row.id}
                onEdit={() => setEditingId(row.id)}
                onSetActive={(isActive) => onSetActive(row.id, isActive)}
              />
            )
          )}
        </ul>
      )}

      <form onSubmit={submitNew} className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <Input
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              if (addError) setAddError(null);
            }}
            placeholder={addPlaceholder}
            aria-label={addPlaceholder}
            aria-invalid={!!addError}
            disabled={isAdding}
            className="flex-1 bg-white"
          />
          <Button type="submit" variant="outline" disabled={isAdding || !draft.trim()} className="shrink-0">
            {isAdding ? <Loader2 className="animate-spin" aria-hidden /> : <Plus aria-hidden />}
            {addLabel}
          </Button>
        </div>
        {addError && <FieldError>{addError}</FieldError>}
      </form>
    </div>
  );
}

/** Mounted only while editing, so the field starts from the saved name every time */
function RowEditor({
  row,
  isBusy,
  siblings,
  onCancel,
  onSave,
}: {
  row: EditableRow;
  isBusy: boolean;
  siblings: EditableRow[];
  onCancel: () => void;
  onSave: (label: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(row.label);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const label = draft.trim().replace(/\s+/g, " ");
    if (!label) return setError("A name is required.");
    if (label === row.label) return onCancel();
    if (siblings.some((s) => s.id !== row.id && s.label.toLowerCase() === label.toLowerCase())) {
      return setError(`"${label}" is already on this list.`);
    }
    await onSave(label);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(event) => event.key === "Escape" && onCancel()}
          aria-label={`Rename ${row.label}`}
          aria-invalid={!!error}
          disabled={isBusy}
          autoFocus
          className="flex-1"
        />
        <Button type="submit" size="icon" variant="outline" disabled={isBusy} aria-label="Save name">
          {isBusy ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
        </Button>
        <Button type="button" size="icon" variant="ghost" onClick={onCancel} disabled={isBusy} aria-label="Cancel">
          <X aria-hidden />
        </Button>
      </div>
      {error && <FieldError>{error}</FieldError>}
    </form>
  );
}

function ListRow({
  row,
  isBusy,
  onEdit,
  onSetActive,
}: {
  row: EditableRow;
  isBusy: boolean;
  onEdit: () => void;
  onSetActive: (isActive: boolean) => void;
}) {
  return (
    <li className="flex items-center gap-3 px-3 py-2">
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            "truncate text-sm font-medium text-[#14213D]",
            !row.isActive && "text-[#8A93A3] line-through"
          )}
        >
          {row.label}
        </span>
        {row.secondary && <span className="truncate text-xs text-[#4B5567]">{row.secondary}</span>}
      </div>

      {!row.isActive && (
        <Badge variant="secondary" className="shrink-0">
          Off
        </Badge>
      )}

      <div className="flex shrink-0 items-center gap-0.5">
        {isBusy && <Loader2 className="size-4 animate-spin text-[#4B5567]" aria-hidden />}
        <Button size="icon" variant="ghost" onClick={onEdit} disabled={isBusy} aria-label={`Rename ${row.label}`} title="Rename">
          <Pencil aria-hidden />
        </Button>
        {row.isActive ? (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onSetActive(false)}
            disabled={isBusy}
            aria-label={`Switch off ${row.label}`}
            title="Switch off"
            className="text-[#4B5567] hover:text-red-700"
          >
            <X aria-hidden />
          </Button>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onSetActive(true)}
            disabled={isBusy}
            aria-label={`Switch ${row.label} back on`}
            title="Switch back on"
          >
            <RotateCcw aria-hidden />
          </Button>
        )}
      </div>
    </li>
  );
}
