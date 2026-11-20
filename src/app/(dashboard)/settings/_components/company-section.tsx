"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { getErrorMessage } from "@/lib/error-utils";
import { SettingsApi, type CompanySettings } from "@/modules/settings/api";
import { ListsError } from "./option-list-editor";
import { PanelSkeleton, SettingsDivider, SettingsSection } from "./settings-section";

/** Company details and the terms printed on every quotation */
export function CompanySection() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    SettingsApi.getCompany()
      .then(({ data }) => setSettings(data))
      .catch((err) => setError(getErrorMessage(err, "Couldn't load company details")));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);

  if (error) {
    return (
      <SettingsSection title="Company details">
        <ListsError message={error} onRetry={load} />
      </SettingsSection>
    );
  }
  if (!settings) {
    return (
      <SettingsSection title="Company details" description="Loading…">
        <PanelSkeleton rows={6} />
      </SettingsSection>
    );
  }
  // Mounted once the details are here, so each field starts from the saved value
  return <CompanyForm settings={settings} onSaved={setSettings} />;
}

type Errors = Partial<Record<keyof CompanySettings, string>>;

function CompanyForm({ settings, onSaved }: { settings: CompanySettings; onSaved: (s: CompanySettings) => void }) {
  const [draft, setDraft] = useState<CompanySettings>(settings);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const changed = (Object.keys(draft) as (keyof CompanySettings)[]).some((key) => draft[key] !== settings[key]);

  const set = (key: keyof CompanySettings) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found: Errors = {};
    if (!draft.company_name.trim()) found.company_name = "Enter the company name.";
    if (draft.company_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.company_email.trim())) {
      found.company_email = "Enter a valid email address.";
    }
    if (Object.keys(found).length > 0) return setErrors(found);

    setSaving(true);
    try {
      const { data } = await SettingsApi.updateCompany(draft);
      onSaved(data);
      setDraft(data);
      toast.success("Company details saved");
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't save the company details"));
    } finally {
      setSaving(false);
    }
  };

  const text = (key: keyof CompanySettings, label: string, props: React.ComponentProps<typeof Input> = {}, hint?: string) => (
    <Field data-invalid={errors[key] ? true : undefined}>
      <FieldLabel htmlFor={key}>{label}</FieldLabel>
      <Input id={key} value={draft[key]} onChange={set(key)} aria-invalid={!!errors[key]} disabled={saving} {...props} />
      {hint && <FieldDescription>{hint}</FieldDescription>}
      {errors[key] && <FieldError>{errors[key]}</FieldError>}
    </Field>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <SettingsSection
        title="Company details"
        description="Printed at the top of every quotation you download."
      >
        <FieldGroup className="max-w-3xl gap-5">
          {text("company_name", "Company name")}
          <Field>
            <FieldLabel htmlFor="company_address">Address</FieldLabel>
            <Textarea id="company_address" rows={2} value={draft.company_address} onChange={set("company_address")} disabled={saving} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            {text("company_phone", "Phone", { type: "tel" })}
            {text("company_email", "Email", { type: "email" })}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {text("company_website", "Website", { placeholder: "www.example.lk" })}
            {text("company_registration_number", "Business registration number", { placeholder: "PV 00000" })}
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {text("vat_registration_number", "VAT registration number", {}, "Leave blank if you don't want it on documents.")}
          </div>
        </FieldGroup>
      </SettingsSection>

      <SettingsDivider />

      <SettingsSection
        title="Quotation terms"
        description="The terms and conditions printed at the foot of every quotation. Put each term on its own line."
      >
        <Field className="max-w-3xl">
          <FieldLabel htmlFor="quotation_terms" className="sr-only">
            Quotation terms
          </FieldLabel>
          <Textarea
            id="quotation_terms"
            rows={7}
            value={draft.quotation_terms}
            onChange={set("quotation_terms")}
            disabled={saving}
            className="leading-relaxed"
          />
        </Field>
      </SettingsSection>

      <div className="flex max-w-3xl items-center justify-end gap-3">
        {changed && !saving && <span className="text-sm text-[#4B5567]">You have unsaved changes</span>}
        <Button type="submit" disabled={saving || !changed}>
          {saving ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}
          Save changes
        </Button>
      </div>
    </form>
  );
}
