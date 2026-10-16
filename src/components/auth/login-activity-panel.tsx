"use client";

import { lazy, Suspense } from "react";
import { useMediaQuery } from "@/hooks/use-reduced-motion";

// Fetched only once it renders: after the form has painted, and never on a phone.
const ActivityCards = lazy(() => import("./activity-cards"));

const COLOUR_BAR = ["#00AEEF", "#EC008C", "#FFDE00", "#231F20"];

/**
 * The right-hand side of sign-in. Below 860px (the page grid's breakpoint too) the column is hidden, and the
 * cards are not mounted at all, so phones never download or run them.
 */
export function LoginActivityPanel() {
  const wide = useMediaQuery("(min-width: 860px)");

  return (
    <aside
      aria-hidden="true"
      className="relative hidden items-center justify-center overflow-hidden bg-[#F2F4F8] px-10 py-16 min-[860px]:flex"
    >
      {/* Halftone: a fine dot grid, fading out toward the edges */}
      <div
        className="pointer-events-none absolute inset-0 text-primary/20"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1.2px)",
          backgroundSize: "14px 14px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
        }}
      />
      <div className="relative flex w-full max-w-[460px] flex-col gap-8">
        <div className="flex flex-col gap-4">
          <p className="text-2xl font-semibold tracking-tight text-balance text-[#14213D]">
            From quote to <span className="text-primary">dispatch</span>, in one place.
          </p>
          {/* Process colours, solid then as tints: the control strip printed on every press sheet */}
          <div className="flex">
            {COLOUR_BAR.map((colour) => (
              <span key={colour} className="h-2.5 w-4" style={{ backgroundColor: colour }} />
            ))}
            {COLOUR_BAR.map((colour) => (
              <span key={`${colour}-tint`} className="h-2.5 w-4" style={{ backgroundColor: colour, opacity: 0.5 }} />
            ))}
          </div>
        </div>
        <div className="relative">
          {/* Soft glow behind the stack, so the cards read as lifted */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 size-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,--theme(--color-primary/12%),transparent)]" />
          {wide && (
            <Suspense fallback={null}>
              <ActivityCards />
            </Suspense>
          )}
        </div>
      </div>
    </aside>
  );
}
