"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getErrorMessage } from "@/lib/error-utils";
import { invalidateOptionLists } from "@/hooks/use-option-list";
import {
  SettingsApi,
  type OptionListDefinition,
  type OptionListKey,
  type OptionListsResponse,
} from "@/modules/settings/api";
import { EditableList, type EditableRow } from "./editable-list";

/** Every list including switched-off entries, with a reload for after each change */
export function useSettingsOptionLists() {
  const [data, setData] = useState<OptionListsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const response = await SettingsApi.getOptionLists(true);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load the lists"));
    }
  }, []);

  useEffect(() => {
    // Fetching on mount is the point of this hook
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  return { data, error, isLoading: !data && !error, reload };
}

/** Add, rename and switch entries of one list on or off */
export function OptionListEditor({
  definition,
  data,
  isLoading,
  reload,
  showDescription = true,
  uppercase = false,
}: {
  definition: OptionListDefinition;
  data: OptionListsResponse | null;
  isLoading: boolean;
  reload: () => Promise<void>;
  showDescription?: boolean;
  /** Save names in capitals, as unit codes like KG and REEL are written */
  uppercase?: boolean;
}) {
  const listKey = definition.key as OptionListKey;
  const [busyId, setBusyId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const name = definition.label.toLowerCase();

  const afterChange = async () => {
    invalidateOptionLists();
    await reload();
  };

  const add = async (label: string) => {
    setIsAdding(true);
    try {
      await SettingsApi.createOption(listKey, label);
      await afterChange();
      toast.success(`Added "${label}"`);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't add that"));
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  const update = async (id: number, change: { label?: string; is_active?: boolean }) => {
    setBusyId(id);
    try {
      await SettingsApi.updateOption(listKey, id, change);
      await afterChange();
      if (change.is_active === false) toast.success("Switched off. It no longer shows in the dropdown.");
      if (change.is_active === true) toast.success("Switched back on");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't save that change"));
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const rows: EditableRow[] = (data?.lists[listKey] ?? []).map((option) => ({
    id: option.id,
    label: option.label,
    // After a rename, older records still hold the original text; worth saying so
    secondary: option.value !== option.label.toUpperCase() ? `Saved on records as ${option.value}` : undefined,
    isActive: option.is_active,
  }));

  return (
    <div className="flex flex-col gap-3">
      {showDescription && <p className="text-sm text-[#4B5567]">{definition.description}</p>}

      {definition.is_workflow_state && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <TriangleAlert aria-hidden />
          <AlertTitle>These are stages a job moves through</AlertTitle>
          <AlertDescription className="text-amber-900/80">
            Renaming is safe. Switching one off leaves jobs already at that stage showing a value you
            can no longer pick.
          </AlertDescription>
        </Alert>
      )}

      <EditableList
        rows={rows}
        isLoading={isLoading}
        busyId={busyId}
        isAdding={isAdding}
        onAdd={(label) => add(uppercase ? label.toUpperCase() : label)}
        onRename={(id, label) => update(id, { label: uppercase ? label.toUpperCase() : label })}
        onSetActive={(id, is_active) => void update(id, { is_active })}
        addLabel="Add"
        addPlaceholder={`New entry in ${name}`}
        emptyText={`No ${name} yet. Add the first one below.`}
      />
    </div>
  );
}

/** Shown when a panel can't load, usually because the backend migration hasn't run */
export function ListsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Alert variant="destructive" className="bg-white">
      <TriangleAlert aria-hidden />
      <AlertTitle>This section didn&apos;t load</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        <button type="button" onClick={onRetry} className="mt-1 font-medium underline underline-offset-2">
          Try again
        </button>
      </AlertDescription>
    </Alert>
  );
}

/** The definition for a key, falling back to a plain name while the response is loading */
export function definitionFor(data: OptionListsResponse | null, key: OptionListKey, label: string): OptionListDefinition {
  return data?.definitions.find((d) => d.key === key) ?? { key, label, description: "" };
}
