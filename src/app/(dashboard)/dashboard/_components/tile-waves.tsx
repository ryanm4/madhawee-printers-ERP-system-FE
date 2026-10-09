"use client";
import { useSyncExternalStore } from "react";
import GradientWaves from "@/components/GradientWaves";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * Slow navy waves rolling under the welcome tile, like sheets moving through a press.
 * Held still for people who ask for reduced motion. Purely decorative.
 */
export function TileWaves({ className }: { className?: string }) {
  const reduceMotion = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true
  );

  // GradientWaves.css sets its own position, so the wrapper does the placing
  return (
    <div className={className} aria-hidden>
      <GradientWaves
        horizonColor="#223F7A"
        waveColor="#5A86D8"
        crestColor="#C6D8F8"
        speed={reduceMotion ? 0 : 0.15}
        amplitude={4}
        height={4}
        fogDepth={26}
        brightness={1}
        opacity={1}
        mouseInteraction={false}
        grainIntensity={0.03}
      />
    </div>
  );
}
