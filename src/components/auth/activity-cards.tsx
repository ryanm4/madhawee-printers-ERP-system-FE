"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  FileText,
  Layers,
  PackageCheck,
  Receipt,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

type ActivityTone = "success" | "primary" | "warning";

interface ActivityEvent {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  status: string;
  tone: ActivityTone;
}

/** Sample activity for the sign-in panel. Nobody is signed in yet, so these are made-up figures, never live data. */
const EVENTS: ActivityEvent[] = [
  { icon: FileText, title: "Q-1042 accepted", subtitle: "Lak Print House · 5,000 cartons", status: "Accepted", tone: "success" },
  { icon: Layers, title: "JT-0871 started", subtitle: "Press 2 · 4 colours, both sides", status: "Printing", tone: "primary" },
  { icon: PackageCheck, title: "GRN-0315 received", subtitle: "40 reams · 300 gsm board", status: "In stock", tone: "success" },
  { icon: Truck, title: "DSP-0412 dispatched", subtitle: "120 bundles · Colombo 10", status: "On the road", tone: "primary" },
  { icon: Receipt, title: "INV-0221 paid", subtitle: "Lak Print House · Rs. 485,000", status: "Paid", tone: "success" },
  { icon: AlertTriangle, title: "Ink cyan running low", subtitle: "2 cans left · reorder level 4", status: "Reorder", tone: "warning" },
];

const TICK_MS = 4000;
const GAP_PX = 80;

/** Where a card sits: -1 is entering above the stack, 0-2 are the visible slots, 3 is leaving. */
function slotStyle(slot: number): React.CSSProperties {
  if (slot < 0) return { transform: `translateY(-60px)`, opacity: 0 };
  if (slot > 2) return { transform: `translateY(${GAP_PX * 2 + 40}px) scale(0.91)`, opacity: 0 };
  const scale = [1, 0.97, 0.94][slot];
  const opacity = [1, 0.78, 0.56][slot];
  return { transform: `translateY(${GAP_PX * slot}px) scale(${scale})`, opacity };
}

const TONE: Record<ActivityTone, string> = {
  success: "bg-green-600/15 text-green-700",
  primary: "bg-primary/10 text-primary",
  warning: "bg-amber-500/15 text-amber-800",
};

function ActivityCard({ event }: { event: ActivityEvent }) {
  const Icon = event.icon;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#E3E7EF] bg-white p-3.5 shadow-sm">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-[#14213D] tabular-nums">{event.title}</span>
        <span className="truncate text-xs text-[#5B6474] tabular-nums">{event.subtitle}</span>
      </span>
      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", TONE[event.tone])}>
        {event.status}
      </span>
    </div>
  );
}

/**
 * A stack of three sample activity cards; every few seconds a new one slides in
 * on top and the bottom one fades away. Decorative only.
 *
 * Each card's key is an ever-increasing id, not its event, because the events
 * repeat in the loop. `added` mounts the next card above the stack and `shown`
 * moves everything down a frame later, so the new card has a starting position
 * to transition from.
 */
export default function ActivityCards() {
  const reduce = usePrefersReducedMotion();
  const [added, setAdded] = useState(2);
  const [shown, setShown] = useState(2);

  useEffect(() => {
    if (reduce) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      if (!timer && !document.hidden) timer = setInterval(() => setAdded((n) => n + 1), TICK_MS);
    };
    const stop = () => {
      clearInterval(timer);
      timer = undefined;
    };
    // Paused while the tab is hidden, so it doesn't run up a backlog of cards.
    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce]);

  useEffect(() => {
    if (added === shown) return;
    // Two frames: one to paint the new card in its starting place, one to move it.
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setShown(added));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [added, shown]);

  // From the card just added down to the one leaving at the bottom
  const ids = [];
  for (let id = added; id >= Math.max(0, shown - 3); id--) ids.push(id);

  return (
    <div className="relative h-[232px] w-full">
      {ids.map((id) => (
        <div
          key={id}
          className="absolute inset-x-0 top-0 origin-top transition-[transform,opacity] duration-700 ease-out will-change-transform"
          style={slotStyle(shown - id)}
        >
          <ActivityCard event={EVENTS[id % EVENTS.length]} />
        </div>
      ))}
    </div>
  );
}
