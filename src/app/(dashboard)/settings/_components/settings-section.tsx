import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * One panel of the settings screen: a heading, a line saying what the setting changes,
 * and the controls. Most settings change what everyone sees, so that is stated where
 * the change is made rather than hidden in a tooltip.
 */
export function SettingsSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  /** A button belonging to the whole section, e.g. "Add account" */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight text-[#14213D]">{title}</h2>
          {description && (
            <p className="max-w-prose text-sm leading-relaxed text-[#4B5567]">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SettingsDivider() {
  return <div className="h-px w-full bg-[#E4E8F0]" role="presentation" />;
}

/** Placeholder rows while a panel loads */
export function PanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-busy className="flex flex-col divide-y divide-[#EEF1F5] rounded-lg border border-[#E4E8F0] bg-white">
      <span className="sr-only">Loading</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-4 flex-1 bg-[#E3E8EF]" style={{ maxWidth: `${40 + ((i * 17) % 45)}%` }} />
          <Skeleton className="ml-auto size-8 bg-[#E3E8EF]" />
        </div>
      ))}
    </div>
  );
}
