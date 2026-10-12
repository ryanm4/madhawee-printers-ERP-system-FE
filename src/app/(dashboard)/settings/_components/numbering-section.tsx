"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { getErrorMessage } from "@/lib/error-utils";
import { SettingsApi, type NumberFormat } from "@/modules/settings/api";
import { ListsError } from "./option-list-editor";
import { PanelSkeleton, SettingsSection } from "./settings-section";

/** The same checks the backend makes, so mistakes show before saving */
function problemWith(template: string): string | null {
  if (!template.trim()) return "Enter a format.";
  if (!/^[A-Za-z0-9/_\-. #]+$/.test(template)) return "Use letters, numbers, spaces and / - _ . only.";
  if (template.split("####").length !== 2) return "Put #### exactly once, where the running number goes.";
  if (template.replace("####", "").includes("#")) return "Use # only as part of ####.";
  if (template.split("YY").length > 2) return "Put YY at most once.";
  return null;
}

/** What the next job number would look like, using the current year */
function preview(template: string) {
  const year = String(new Date().getFullYear()).slice(-2);
  return template.replace("####", "0001").replace("YY", year);
}

export function NumberingSection() {
  const [formats, setFormats] = useState<NumberFormat[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    SettingsApi.getNumberFormats()
      .then(({ data }) => setFormats(data))
      .catch((err) => setError(getErrorMessage(err, "Couldn't load the number formats")));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);

  return (
    <SettingsSection
      title="Document numbering"
      description={
        <>
          How job ticket numbers are built for each purchase order type. <code className="font-mono text-[#14213D]">####</code>{" "}
          is the running number and <code className="font-mono text-[#14213D]">YY</code> is the year.
        </>
      }
    >
      {error ? (
        <ListsError message={error} onRetry={load} />
      ) : !formats ? (
        <PanelSkeleton rows={3} />
      ) : (
        <ul className="flex max-w-3xl flex-col divide-y divide-[#EEF1F5] rounded-lg border border-[#E4E8F0] bg-white">
          {formats.map((format) => (
            <FormatRow
              key={format.doc_type}
              format={format}
              onSaved={(saved) => setFormats((all) => all?.map((f) => (f.doc_type === saved.doc_type ? saved : f)) ?? null)}
            />
          ))}
        </ul>
      )}

      <p className="flex max-w-3xl items-start gap-2 text-xs leading-relaxed text-[#4B5567]">
        <TriangleAlert className="mt-px size-3.5 shrink-0 text-amber-600" aria-hidden />
        Numbers already given out don&apos;t change. Counting continues from the highest number in the
        same format, so a new format starts again at 0001.
      </p>
    </SettingsSection>
  );
}

function FormatRow({ format, onSaved }: { format: NumberFormat; onSaved: (f: NumberFormat) => void }) {
  const [draft, setDraft] = useState(format.template);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const changed = draft.trim() !== format.template;
  const id = `format-${format.doc_type}`;

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const template = draft.trim();
    const problem = problemWith(template);
    if (problem) return setError(problem);

    setSaving(true);
    try {
      const { data } = await SettingsApi.updateNumberFormat(format.doc_type, template);
      onSaved(data);
      setDraft(data.template);
      toast.success(`${format.label} format saved`);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't save the format"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <li>
      <form onSubmit={save} className="flex flex-wrap items-start gap-3 p-4">
        <Field data-invalid={error ? true : undefined} className="min-w-56 flex-1">
          <FieldLabel htmlFor={id}>{format.label}</FieldLabel>
          <Input
            id={id}
            value={draft}
            maxLength={60}
            onChange={(event) => {
              setDraft(event.target.value);
              if (error) setError(null);
            }}
            aria-invalid={!!error}
            disabled={saving}
            className="font-mono"
          />
          {error ? (
            <FieldError>{error}</FieldError>
          ) : (
            <FieldDescription>
              Looks like <span className="font-mono font-medium text-[#14213D]">{problemWith(draft) ? "…" : preview(draft)}</span>
            </FieldDescription>
          )}
        </Field>
        <div className="flex gap-2 pt-[22px]">
          {changed && !saving && (
            <Button type="button" variant="ghost" onClick={() => setDraft(format.template)}>
              Undo
            </Button>
          )}
          <Button type="submit" variant="outline" disabled={!changed || saving}>
            {saving ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}
            Save
          </Button>
        </div>
      </form>
    </li>
  );
}
