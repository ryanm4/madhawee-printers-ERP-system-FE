import Link from "next/link";
import { ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** White bento tile with a fine border; hierarchy comes from size, not shadow */
export function Tile({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-2xl border border-[#E4E8F0] bg-white p-6",
        className
      )}
    >
      {children}
    </section>
  );
}

/** Tile heading: icon, title, and an optional link to the matching part of the app */
export function TileHeader({
  icon: Icon,
  title,
  href,
  linkLabel,
  children,
}: {
  icon: LucideIcon;
  title: string;
  href?: string;
  linkLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#223F7A]/[0.07] text-[#223F7A]">
        <Icon className="size-4" aria-hidden />
      </span>
      <h2 className="text-[15px] font-semibold text-[#1B2433]">{title}</h2>
      <div className="ml-auto flex items-center gap-2">
        {children}
        {href && (
          <Link
            href={href}
            className="flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[13px] font-medium text-[#5B6474] transition-colors hover:bg-[#F1F3F8] hover:text-[#223F7A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#223F7A]/30"
          >
            {linkLabel ?? "Open"}
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>
    </header>
  );
}

/** A thin progress bar with its share written out, e.g. "18 of 24 completed" */
export function ProgressLine({
  value,
  tone = "navy",
  label,
}: {
  /** 0–100 */
  value: number;
  tone?: "navy" | "green" | "amber";
  label: string;
}) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const fill = { navy: "bg-[#223F7A]", green: "bg-[#16A34A]", amber: "bg-[#D97706]" }[tone];
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[#EEF1F6]"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className={cn("h-full rounded-full", fill)} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[13px] text-[#5B6474]">{label}</p>
    </div>
  );
}

export type CurrencyCode = "LKR" | "USD";

/** LKR / USD switch for a chart tile */
export function CurrencyToggle({
  value,
  onChange,
  label,
}: {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  label: string;
}) {
  return (
    <div className="flex gap-0.5 rounded-lg bg-[#F1F3F8] p-0.5 text-xs" role="group" aria-label={label}>
      {(["LKR", "USD"] as const).map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={value === code}
          onClick={() => onChange(code)}
          className={cn(
            "rounded-md px-2.5 py-1 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#223F7A]/30",
            value === code ? "bg-white text-[#1B2433] shadow-sm" : "text-[#5B6474] hover:text-[#1B2433]"
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
