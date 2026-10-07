"use client";
import { useSyncExternalStore } from "react";
import LightRays from "@/components/LightRays";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * Light falling on the press room from above. Skipped for people who ask for reduced
 * motion, and during server rendering, where the static glow behind it shows instead.
 */
export function LoginRays() {
  const animate = useSyncExternalStore(
    subscribe,
    () => !window.matchMedia(REDUCED_MOTION).matches,
    () => false
  );

  if (!animate) return null;

  // LightRays.css sets its own position, so the wrapper does the placing
  return (
    <div className="absolute inset-0">
      <LightRays
        raysOrigin="top-center"
        raysColor="#FFFFFF"
        raysSpeed={0.6}
        lightSpread={1.1}
        rayLength={2.2}
        fadeDistance={1.2}
        followMouse
        mouseInfluence={0.08}
        noiseAmount={0.05}
        distortion={0.04}
      />
    </div>
  );
}
