"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { getErrorMessage } from "@/lib/error-utils";
import { formatAmount } from "@/components/shared/record-view";
import { SettingsApi } from "@/modules/settings/api";
import { PanelSkeleton, SettingsSection } from "./settings-section";

/**
 * The USD to LKR rate. Typed in rather than fetched, because the business converts at
 * the rate its own bank quotes, not the market rate.
 */
export function CurrencySection() {
  const [saved, setSaved] = useState<string | null>(null);
  const [rate, setRate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    SettingsApi.getCurrencyRate()
      .then(({ data }) => {
        const value = data?.rate != null ? String(Number(data.rate)) : "";
        setSaved(value);
        setRate(value);
      })
      .catch((err) => {
        // 404 just means no rate has been saved yet
        if (err?.response?.status !== 404) toast.error(getErrorMessage(err, "Couldn't load the rate"));
        setSaved("");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(rate);
    if (!rate || !Number.isFinite(value) || value <= 0) {
      return setError("Enter a rate above zero, such as 302.50.");
    }
    setSaving(true);
    try {
      await SettingsApi.updateCurrencyRate({ rate: value });
      setSaved(String(value));
      toast.success("Rate saved");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save the rate"));
    } finally {
      setSaving(false);
    }
  };

  const changed = saved !== null && rate !== saved;

  return (
    <SettingsSection
      title="Currency"
      description="The rate for converting US dollars to rupees. Enter the rate your bank gives you and update it when it changes."
    >
      {loading ? (
        <PanelSkeleton rows={1} />
      ) : (
        <form onSubmit={handleSave} className="flex max-w-xl flex-col gap-4 rounded-lg border border-[#E4E8F0] bg-white p-5">
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="usd-rate">1 USD in rupees</FieldLabel>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-[#4B5567]">
                  Rs
                </span>
                <Input
                  id="usd-rate"
                  inputMode="decimal"
                  className="pl-9 tabular-nums"
                  placeholder="302.50"
                  value={rate}
                  onChange={(e) => {
                    setRate(e.target.value);
                    if (error) setError(null);
                  }}
                  aria-invalid={!!error}
                  disabled={saving}
                />
              </div>
              <Button type="submit" disabled={saving || !changed} className="shrink-0">
                {saving ? <Loader2 className="animate-spin" aria-hidden /> : <Save aria-hidden />}
                Save rate
              </Button>
            </div>
            {error ? (
              <FieldError>{error}</FieldError>
            ) : (
              <FieldDescription>
                {saved
                  ? `Currently 1 USD = Rs ${formatAmount(saved)}.`
                  : "No rate saved yet."}
              </FieldDescription>
            )}
          </Field>
        </form>
      )}
    </SettingsSection>
  );
}
