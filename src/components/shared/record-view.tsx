/**
 * Building blocks for read-only "View ..." pages: a header naming the record, sections of
 * labelled values, and plain tables. Records are shown as text to read, not as disabled form
 * fields, and empty values say "Not set" instead of leaving a blank box.
 */
import { format } from "date-fns";
import { Info } from "lucide-react";
import { StatusBadge, StatusType } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";

/** "IN PRODUCTION" -> "In production" */
export const sentenceCase = (value?: string | null) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replace(/_/g, " ") : "";

/** 02 Oct 2026, or null when there is no usable date */
export const formatViewDate = (value?: Date | string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : format(date, "dd MMM yyyy");
};

export const formatAmount = (value: number | string | null | undefined, digits = 2) => {
  const n = Number(value);
  return Number.isFinite(n)
    ? n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : "";
};

const isEmpty = (value: React.ReactNode) =>
  value === null || value === undefined || value === "" || value === false || value === "null" || value === "undefined";

/** One labelled value */
export function Detail({
  label,
  value,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  className?: string;
}) {
  const empty = isEmpty(value);
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-1 text-sm break-words whitespace-pre-line",
          empty ? "text-muted-foreground" : "font-medium text-[#1B2433]"
        )}
      >
        {empty ? "Not set" : value}
      </dd>
    </div>
  );
}

/** A grid of Details; columns collapse on phones */
export function DetailGrid({
  columns = 3,
  className,
  children,
}: {
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  children: React.ReactNode;
}) {
  const cols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  }[columns];
  return <dl className={cn("grid gap-x-6 gap-y-5", cols, className)}>{children}</dl>;
}

/** A titled white panel */
export function ViewSection({
  title,
  aside,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("min-w-0 rounded-xl border border-[#E4E8F0] bg-white", className)}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF1F5] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-[#1B2433]">{title}</h2>
        {aside}
      </header>
      <div className={cn("px-5 py-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** The record's name, status and one line of context, with the page actions beside it */
export function ViewHeader({
  title,
  status,
  statusType,
  subtitle,
  actions,
}: {
  title?: React.ReactNode;
  status?: string | null;
  statusType?: StatusType;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      {title && (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight break-words text-[#1B2433]">{title}</h2>
            {status && statusType && <ViewStatus status={status} type={statusType} />}
          </div>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      {actions && <div className="ml-auto flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function ViewStatus({ status, type, size = "md" }: { status: string; type: StatusType; size?: "sm" | "md" }) {
  return (
    <StatusBadge
      status={status}
      label={sentenceCase(status)}
      type={type}
      className={cn(
        "shrink-0 rounded-md normal-case tracking-normal",
        size === "md" ? "px-2.5 py-1 text-xs font-semibold" : "px-2 py-0.5 text-xs font-medium"
      )}
    />
  );
}

export function ViewError({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 rounded-xl border border-[#E4E8F0] bg-white px-5 py-8 text-sm text-muted-foreground">
      <Info className="size-4 shrink-0" aria-hidden />
      {children}
    </p>
  );
}

export interface ViewColumn<T> {
  header: string;
  cell: (row: T, index: number) => React.ReactNode;
  /** Numbers line up on the right */
  align?: "left" | "right";
  /** Secondary columns are greyed */
  muted?: boolean;
  className?: string;
}

/**
 * A plain read-only table. On phones each row becomes a block: the first column as the
 * heading and the rest as label/value pairs.
 */
export function ViewTable<T>({
  columns,
  rows,
  rowKey,
  footer,
  empty = "Nothing to show.",
}: {
  columns: ViewColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => React.Key;
  /** Rendered as the last table row, e.g. totals; label sits under all but the last column */
  footer?: { label: React.ReactNode; value: React.ReactNode };
  empty?: string;
}) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  const [first, ...rest] = columns;

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[13px] text-muted-foreground">
              {columns.map((col) => (
                <th
                  key={col.header}
                  className={cn("pb-3 pr-4 font-normal last:pr-0", col.align === "right" && "text-right")}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF1F5] border-t border-[#EEF1F5]">
            {rows.map((row, i) => (
              <tr key={rowKey(row, i)} className="align-top">
                {columns.map((col) => (
                  <td
                    key={col.header}
                    className={cn(
                      "py-3 pr-4 last:pr-0",
                      col.align === "right" && "text-right tabular-nums",
                      col.muted ? "text-muted-foreground" : "text-[#1B2433]",
                      col.className
                    )}
                  >
                    {col.cell(row, i)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {footer && (
            <tfoot>
              <tr className="border-t border-[#E4E8F0]">
                <td colSpan={columns.length - 1} className="pt-3 pr-4 text-right text-muted-foreground">
                  {footer.label}
                </td>
                <td className="pt-3 text-right font-semibold tabular-nums text-[#1B2433]">{footer.value}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <ul className="divide-y divide-[#EEF1F5] md:hidden">
        {rows.map((row, i) => (
          <li key={rowKey(row, i)} className="py-3 first:pt-0">
            <div className="text-sm font-medium text-[#1B2433]">{first.cell(row, i)}</div>
            {rest.length > 0 && (
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                {rest.map((col) => (
                  <div key={col.header} className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{col.header}</dt>
                    <dd className="text-sm break-words text-[#1B2433]">{col.cell(row, i)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        ))}
        {footer && (
          <li className="flex justify-between pt-3 text-sm">
            <span className="text-muted-foreground">{footer.label}</span>
            <span className="font-semibold tabular-nums text-[#1B2433]">{footer.value}</span>
          </li>
        )}
      </ul>
    </>
  );
}
