import { CircleCheck, CircleDashed, CirclePlus, CircleX, Clock, Factory, Truck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** "IN PRODUCTION" -> "In production" */
export const sentenceCase = (value?: string) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replace(/_/g, " ") : "";

/** One colour per stage, shared by the card edge and the status dots */
export const toneFor = (status?: string) => {
    const s = (status || "").toUpperCase();
    if (["COMPLETED", "DISPATCHED", "APPROVED"].includes(s)) return { bar: "bg-[#16A34A]", dot: "bg-[#16A34A]" };
    if (["CANCELLED", "REJECTED"].includes(s)) return { bar: "bg-[#DC2626]", dot: "bg-[#DC2626]" };
    if (s === "CREATED" || s === "PENDING") return { bar: "bg-[#223F7A]", dot: "bg-[#223F7A]" };
    if (s.includes("PARTIAL")) return { bar: "bg-[#EA580C]", dot: "bg-[#EA580C]" };
    return { bar: "bg-[#D97706]", dot: "bg-[#D97706]" };
};

/** An icon and soft colour per stage, so the state reads before the word does */
const pillFor = (status?: string): { icon: LucideIcon; className: string } => {
    const s = (status || "").toUpperCase();
    if (["COMPLETED", "APPROVED"].includes(s)) return { icon: CircleCheck, className: "bg-[#E8F6EE] text-[#166534]" };
    if (s === "DISPATCHED") return { icon: Truck, className: "bg-[#E8F6EE] text-[#166534]" };
    if (["CANCELLED", "REJECTED"].includes(s)) return { icon: CircleX, className: "bg-[#FDECEC] text-[#B42318]" };
    if (s === "CREATED") return { icon: CirclePlus, className: "bg-[#EAF0FA] text-[#223F7A]" };
    if (s === "PENDING") return { icon: Clock, className: "bg-[#EAF0FA] text-[#223F7A]" };
    if (s.includes("PARTIAL")) return { icon: CircleDashed, className: "bg-[#FFF1E6] text-[#B54708]" };
    if (s.includes("PRODUCTION")) return { icon: Factory, className: "bg-[#FEF4E2] text-[#93500A]" };
    return { icon: Clock, className: "bg-[#FEF4E2] text-[#93500A]" };
};

/** The icon for a status, as used on the pills */
export const statusIconFor = (status?: string) => pillFor(status).icon;

/** Status as a soft pill with an icon */
export function StatusPill({ status, label, className }: { status?: string; label?: string; className?: string }) {
    if (!status) return null;
    const { icon: Icon, className: tone } = pillFor(status);
    return (
        <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full py-0.5 pr-2.5 pl-2 text-[13px] font-semibold", tone, className)}>
            <Icon className="size-3.5" aria-hidden />
            {label ?? sentenceCase(status)}
        </span>
    );
}

/** Status as a coloured dot and plain text */
export function StatusText({ status, size = "md" }: { status?: string; size?: "sm" | "md" }) {
    if (!status) return null;
    return (
        <span className={cn("inline-flex items-center gap-1.5 font-medium text-[#14213D]", size === "md" ? "text-[13px]" : "text-xs")}>
            <span aria-hidden className={cn("size-2 shrink-0 rounded-full", toneFor(status).dot)} />
            {sentenceCase(status)}
        </span>
    );
}
