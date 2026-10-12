/**
 * Placeholders shaped like the content that is about to load, shown in place of a spinner.
 * Each matches the layout it stands in for, so the page does not jump when data arrives.
 */
import { Skeleton as BaseSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** The default skeleton grey is too faint on white panels; use a firmer one */
function Skeleton({
  className,
  ...props
}: React.ComponentProps<typeof BaseSkeleton>) {
  return <BaseSkeleton className={cn("bg-[#E3E8EF]", className)} {...props} />;
}

function Loading({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={className}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** A list table: header row and a few body rows */
export function TableSkeleton({
  rows = 8,
  columns = 6,
  label = "Loading list",
}: {
  rows?: number;
  columns?: number;
  label?: string;
}) {
  return (
    <Loading
      label={label}
      className="overflow-hidden rounded-lg border border-[#E4E8F0] bg-white"
    >
      <div className="flex gap-4 border-b border-[#E4E8F0] bg-[#F7F8FA] px-4 py-3">
        {Array.from({ length: columns }, (_, c) => (
          <Skeleton
            key={c}
            className={cn("h-3.5", c === 0 ? "w-10" : "flex-1")}
          />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 border-b border-[#EEF1F5] px-4 py-3.5 last:border-0"
        >
          {Array.from({ length: columns }, (_, c) => (
            <Skeleton
              key={c}
              className={cn("h-4", c === 0 ? "w-10" : "flex-1")}
              // Vary widths a little so rows read as text, not bars
              style={
                c === 0
                  ? undefined
                  : { maxWidth: `${55 + ((r * 7 + c * 13) % 40)}%` }
              }
            />
          ))}
        </div>
      ))}
    </Loading>
  );
}

/** A grid of record cards, like the purchase order and job ticket cards */
export function CardGridSkeleton({
  cards = 6,
  label = "Loading cards",
}: {
  cards?: number;
  label?: string;
}) {
  return (
    <Loading
      label={label}
      className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(min(100%,380px),1fr))]"
    >
      {Array.from({ length: cards }, (_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-lg border border-[#D9DFE8] bg-white pl-1"
        >
          <div className="flex flex-col gap-2.5 px-5 pt-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-20" />
            </div>
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
          <div className="flex items-end justify-between px-5 pt-5">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[#EEF1F5] px-5 py-4">
            {[0, 1, 2].map((c) => (
              <div key={c} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </Loading>
  );
}

function SectionSkeleton({
  fields = 6,
  columns = 2,
  className,
}: {
  fields?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-xl border border-[#E4E8F0] bg-white", className)}
    >
      <div className="border-b border-[#EEF1F5] px-5 py-4">
        <Skeleton className="h-4 w-36" />
      </div>
      <div
        className={cn(
          "grid gap-x-6 gap-y-5 px-5 py-5",
          columns === 3 ? "grid-cols-3" : "grid-cols-2"
        )}
      >
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** A "View ..." page: title line, two detail panels and a table panel */
export function RecordViewSkeleton({
  label = "Loading details",
}: {
  label?: string;
}) {
  return (
    <Loading label={label} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <SectionSkeleton fields={6} columns={3} className="lg:col-span-2" />
        <SectionSkeleton fields={4} />
      </div>
      <div className="rounded-xl border border-[#E4E8F0] bg-white">
        <div className="border-b border-[#EEF1F5] px-5 py-4">
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex flex-col gap-4 px-5 py-5">
          {[0, 1, 2, 3].map((r) => (
            <div key={r} className="flex gap-4">
              <Skeleton className="h-4 flex-[3]" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </Loading>
  );
}

/** A create/edit form: two panels of label + input pairs */
export function FormSkeleton({ label = "Loading form" }: { label?: string }) {
  const field = (key: number) => (
    <div key={key} className="flex flex-col gap-2">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
  return (
    <Loading label={label} className="flex flex-col gap-5">
      <div className="flex justify-end gap-3">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {[0, 1].map((panel) => (
          <div
            key={panel}
            className="flex flex-col gap-4 rounded-xl border border-[#E4E8F0] bg-white p-6"
          >
            <Skeleton className="h-4 w-32" />
            {[0, 1, 2, 3].map(field)}
          </div>
        ))}
      </div>
    </Loading>
  );
}

/** Whole page while a route loads: title, toolbar and a table */
export function PageSkeleton() {
  return (
    <div className="mt-3 flex flex-1 flex-col gap-5 p-4 pt-0 sm:p-6 sm:pt-0">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-7 w-64" />
      </div>
      <div className="flex justify-end gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>
      <TableSkeleton label="Loading page" />
    </div>
  );
}
