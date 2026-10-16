"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Download, FileText, Layers, LifeBuoy, PackageCheck, Receipt, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import company_logo from "@/assets/Images/company_logo.jpeg";

/**
 * The rings, inner to outer: diameter as a share of the visual's width, and how
 * slowly each turns, alternating direction. A plain circle looks still however
 * it turns, so each ring carries a small dot (and the third is dashed).
 */
const RINGS = [
  { size: 160 / 520, seconds: 140, reverse: false },
  { size: 280 / 520, seconds: 120, reverse: true },
  { size: 400 / 520, seconds: 100, reverse: false },
  { size: 1, seconds: 90, reverse: true },
];

/** ring: 2-4 counting out from the centre; angle: degrees clockwise from the top */
const PILLS = [
  { ring: 2, angle: 300, icon: FileText, label: "Quote accepted", done: true },
  { ring: 3, angle: 20, icon: Layers, label: "Job printing", done: false },
  { ring: 4, angle: 200, icon: PackageCheck, label: "Goods received", done: true },
  { ring: 3, angle: 140, icon: Receipt, label: "Invoice paid", done: true },
];

const TRUST = [
  { icon: ShieldCheck, label: "Secure sign-in" },
  { icon: Download, label: "Export anytime" },
  { icon: LifeBuoy, label: "Support when you need it" },
];

const PULSE_CYCLE = 20;

function Pill({ pill, index }: { pill: (typeof PILLS)[number]; index: number }) {
  const Icon = pill.icon;
  // The ring's radius as a share of the visual's height, up from the centre
  const top = 50 - (RINGS[pill.ring - 1].size * 100) / 2;

  return (
    // The arm sets the angle; the zero-size anchor sits on the ring there and
    // turns back by it, so the pill stays upright.
    <div className="absolute inset-0" style={{ transform: `rotate(${pill.angle}deg)` }}>
      <div
        className="absolute left-1/2 flex size-0 items-center justify-center"
        style={{ top: `${top}%`, transform: `rotate(${-pill.angle}deg)` }}
      >
        <div
          className="motion-reduce:animate-none!"
          style={{
            animation: `orbit-drift ${5 + index * 1.3}s ease-in-out infinite alternate`,
            animationDelay: `${-index * 1.7}s`,
          }}
        >
          <div
            className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium whitespace-nowrap text-[#14213D] shadow-lg shadow-black/15 motion-reduce:animate-none!"
            style={{
              animation: `orbit-pulse ${PULSE_CYCLE}s ease-in-out infinite`,
              animationDelay: `${index * 5}s`,
            }}
          >
            <Icon className="size-3.5 text-primary" />
            <span className={cn("size-1.5 rounded-full", pill.done ? "bg-green-600" : "bg-amber-500")} />
            {pill.label}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The right-hand side of sign-in: concentric rings turning slowly around the
 * company mark, with a few status pills resting on them. Decorative only. CSS
 * animations throughout, so reduced motion stops them; they also pause while
 * the tab is hidden. Below 860px (the page grid's breakpoint) it is hidden.
 */
export function OrbitPanel() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const sync = () => root.current?.toggleAttribute("data-orbit-paused", document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return (
    <aside
      ref={root}
      className="relative hidden flex-col items-center justify-center gap-10 overflow-hidden bg-[linear-gradient(150deg,#2D4F93_0%,#223F7A_45%,#14213D_100%)] px-10 py-12 text-white min-[860px]:flex"
    >
      {/* A soft light behind the logo, so the centre reads as the source */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[42%] left-1/2 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(120,160,230,0.35),transparent)]"
      />

      <div
        aria-hidden
        className="relative aspect-square max-w-full"
        // Leaves room for the text below at any laptop height, never past full size.
        style={{ width: "min(520px, 100%, 52svh)" }}
      >
        {RINGS.map((ring, i) => (
          <div
            key={ring.size}
            className="absolute top-1/2 left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2"
            style={{ width: `${ring.size * 100}%` }}
          >
            <div
              className={cn(
                "size-full rounded-full border border-white/20 motion-reduce:animate-none!",
                i === 2 && "border-dashed border-white/30"
              )}
              style={{ animation: `spin ${ring.seconds}s linear infinite${ring.reverse ? " reverse" : ""}` }}
            >
              {/* The dot that shows the ring turning, set off a different way on each */}
              <div className="absolute inset-0" style={{ transform: `rotate(${i * 97 + 40}deg)` }}>
                <span className="absolute top-0 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
              </div>
            </div>
          </div>
        ))}

        {PILLS.map((pill, index) => (
          <Pill key={pill.label} pill={pill} index={index} />
        ))}

        <div className="absolute top-1/2 left-1/2 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-white shadow-2xl shadow-black/30 ring-8 ring-white/10">
          <Image src={company_logo} alt="" width={52} height={52} className="object-contain" priority />
        </div>
      </div>

      <div className="relative flex w-[460px] max-w-full flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-lg font-medium">Welcome back.</p>
          <p className="text-sm text-white/70">Pick up your jobs right where you left off.</p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/70">
          {TRUST.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-1.5">
              <Icon className="size-3.5" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
