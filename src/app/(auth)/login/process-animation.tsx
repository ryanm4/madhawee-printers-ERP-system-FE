"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

const NAVY = "#14213D";
const MUTED = "#8A93A3";
const CMYK = ["#00AEEF", "#EC008C", "#FFDE00", "#231F20"];
const KRAFT = "#C89B6A";

const STEPS = [
  { label: "Quotation", caption: "The customer accepts the quotation." },
  { label: "Purchase order", caption: "Their purchase order comes in." },
  { label: "Job ticket", caption: "A job ticket goes up on the board." },
  { label: "On press", caption: "Printed one colour at a time." },
  { label: "Dispatch", caption: "The cartons are packed and loaded." },
  { label: "Delivered", caption: "On its way to the customer." },
];

/* ------------------------------------------------------------------ isometric drawing
   World units: x runs to the lower right, y to the lower left, z up. One unit is S px. */
const S = 9;
const OX = 215;
const OY = 160;
const VW = 670;
const VH = 560;
const COS = 0.866;


const P = (x: number, y: number, z = 0): [number, number] => [(x - y) * COS * S + OX, (x + y) * 0.5 * S - z * S + OY];
const pts = (...points: [number, number, number?][]) =>
  points.map(([x, y, z]) => P(x, y, z ?? 0).map((n) => n.toFixed(1)).join(",")).join(" ");

/** The lorry is drawn at full size and shrunk toward its rear corner by the shop, so it stays backed up to the loading side */
const LORRY_AT = [36, 23.4] as const;
const LORRY_SIZE = 0.7;
const LORRY_SCALE = (() => {
  const [ax, ay] = P(...LORRY_AT);
  return `translate(${ax} ${ay}) scale(${LORRY_SIZE}) translate(${-ax} ${-ay})`;
})();

/** Screen offset for moving something by (dx, dy, dz) world units */
const along = (dx: number, dy: number, dz = 0) => ({ x: (dx - dy) * COS * S, y: (dx + dy) * 0.5 * S - dz * S });

/** Lighten (amount > 0) or darken (amount < 0) a hex colour */
function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(amount > 0 ? c + (255 - c) * amount : c * (1 + amount));
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix);
  return `rgb(${r},${g},${b})`;
}

/** A solid box, lit from the upper left: the top is lightest and the right face darkest */
function Box({ x, y, z = 0, w, d, h, color, top, className }: { x: number; y: number; z?: number; w: number; d: number; h: number; color: string; top?: string; className?: string }) {
  return (
    <g className={className}>
      <polygon points={pts([x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h])} fill={shade(color, -0.16)} />
      <polygon points={pts([x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h])} fill={color} />
      <polygon points={pts([x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h])} fill={top ?? shade(color, 0.2)} />
    </g>
  );
}

/** Transforms that lay flat drawing onto a surface: the floor plane, or a side facing +y (the back wall is one) */
const onTop = (x: number, y: number, z: number) => {
  const [e, f] = P(x, y, z);
  return `matrix(${COS * S} ${0.5 * S} ${-COS * S} ${0.5 * S} ${e} ${f})`;
};
const onSideY = (x: number, y: number, z: number) => {
  const [e, f] = P(x, y, z);
  return `matrix(${COS} 0.5 0 1 ${e} ${f})`;
};
const onBackWall = (x: number, z: number) => onSideY(x, 0, z);
/**
 * A person standing at (x, y), drawn flat like an illustration. Arms and legs are separate groups
 * hinged at the shoulder and hip, so they can swing; `id` names them for the animation.
 */
function Person({ id, x, y, shirt, pants = "#2B3245", skin, hair, cap, apron, face = "right", carrying }: {
  id: string; x: number; y: number; shirt: string; pants?: string; skin: string; hair: string;
  cap?: boolean; apron?: boolean; face?: "left" | "right"; carrying?: boolean;
}) {
  const [px, py] = P(x, y);
  const limb = (cls: string, colour: string, width: number, length: number, end: React.ReactNode) => (
    <g className={cls}>
      <line x1="0" y1="0" x2="0.6" y2={length} stroke={colour} strokeWidth={width} strokeLinecap="round" />
      {end}
    </g>
  );
  const shoe = <ellipse cx="1.6" cy="17.8" rx="3.2" ry="1.7" fill="#1B1F2A" />;
  const hand = <circle cx="0.6" cy="13.6" r="2.2" fill={skin} />;
  return (
    <g className={`person person-${id}`}>
      <g transform={`translate(${px.toFixed(1)} ${py.toFixed(1)}) scale(1.3)`}>
        <ellipse cx="0" cy="0" rx="9" ry="3.2" fill={NAVY} opacity="0.12" />
        <g className={`flip-${id}`} transform={face === "left" ? "scale(-1 1)" : undefined}>
          <g className={`bob-${id}`}>
            {/* Far side first, a shade darker */}
            <g transform="translate(-2.4 -19)">{limb(`legB-${id}`, shade(pants, -0.25), 5, 16.5, shoe)}</g>
            <g transform="translate(-5.2 -35)">{limb(`armB-${id}`, shade(shirt, -0.22), 4.2, 12.5, hand)}</g>
            <g transform="translate(2.4 -19)">{limb(`legF-${id}`, pants, 5, 16.5, shoe)}</g>

            <path d="M-7 -35.5 Q-7 -39 -3.5 -39 H3.5 Q7 -39 7 -35.5 V-21 Q7 -18.5 4.5 -18.5 H-4.5 Q-7 -18.5 -7 -21 Z" fill={shirt} />
            {apron && (
              <g>
                <path d="M-4.6 -33 H4.6 V-19.5 Q4.6 -18.5 3.6 -18.5 H-3.6 Q-4.6 -18.5 -4.6 -19.5 Z" fill="#F7F9FC" />
                <path d="M-3.4 -33 L-2 -38.6 M3.4 -33 L2 -38.6" stroke="#F7F9FC" strokeWidth="1.4" />
              </g>
            )}
            <rect x="-1.7" y="-42.5" width="3.4" height="4.5" rx="1.2" fill={shade(skin, -0.12)} />

            {/* Head, facing right: hair at the back, one eye and a small smile at the front */}
            <circle cx="0" cy="-48" r="6.9" fill={skin} />
            <path d="M-6.9 -47 A6.9 6.9 0 0 1 6.6 -50 Q2 -51.2 -0.6 -49 Q-3.4 -46.8 -4.6 -42.6 Q-7.4 -44 -6.9 -47 Z" fill={hair} />
            <circle cx="3.6" cy="-48.2" r="0.95" fill="#1B1F2A" />
            <path d="M3.2 -44.6 Q4.6 -43.7 5.9 -44.8" fill="none" stroke="#1B1F2A" strokeWidth="0.8" strokeLinecap="round" />
            {cap && (
              <g>
                <path d="M-7.2 -49 A7.2 7.2 0 0 1 7.2 -49 Z" fill="#223F7A" />
                <rect x="1" y="-50" width="9.5" height="2" rx="1" fill="#14213D" />
              </g>
            )}

            {carrying && (
              <g className={`carry-${id}`}>
                <polygon points="5,-33 13,-36.5 21,-33 13,-29.5" fill={shade(KRAFT, 0.2)} />
                <polygon points="5,-33 13,-29.5 13,-21.5 5,-25" fill={KRAFT} />
                <polygon points="13,-29.5 21,-33 21,-25 13,-21.5" fill={shade(KRAFT, -0.16)} />
              </g>
            )}
            <g transform="translate(4.6 -35)">{limb(`armF-${id}`, shirt, 4.2, 12.5, hand)}</g>
          </g>
        </g>
      </g>
    </g>
  );
}

/** A small forklift facing +x, with its forks (the "fork-carriage") able to rise; (x, y) is its back corner */
function Forklift({ x, y }: { x: number; y: number }) {
  const post = (px: number, py: number) => <Box x={px} y={py} z={1.55} w={0.2} d={0.2} h={3.1} color="#2B3245" />;
  const [hx, hy] = P(x + 1.15, y + 1.35, 4.2);
  return (
    <g className="forklift">
      <polygon points={pts([x - 0.6, y, 0], [x + 6.2, y, 0], [x + 6.2, y + 2.7, 0], [x - 0.6, y + 2.7, 0])} fill={NAVY} opacity="0.12" />
      {/* Mast and the forks on it */}
      <Box x={x + 3} y={y + 0.35} z={0.35} w={0.3} d={0.3} h={4.4} color="#3A4256" />
      <g className="fork-carriage">
        <Box x={x + 3.3} y={y + 0.2} z={0.45} w={0.2} d={2.2} h={1.5} color="#3A4256" />
        <Box x={x + 3.5} y={y + 0.3} z={0.45} w={2.6} d={0.35} h={0.15} color="#8A93A3" />
        <Box x={x + 3.5} y={y + 1.9} z={0.45} w={2.6} d={0.35} h={0.15} color="#8A93A3" />
      </g>
      <Box x={x + 3} y={y + 1.95} z={0.35} w={0.3} d={0.3} h={4.4} color="#3A4256" />
      {/* Body, back posts, driver, front posts, roof */}
      <Box x={x - 0.5} y={y} z={0.35} w={0.7} d={2.6} h={1.9} color="#D98F1F" />
      <Box x={x + 0.2} y={y} z={0.35} w={2.8} d={2.6} h={1.2} color="#F2A93B" />
      {post(x + 0.3, y + 0.1)}
      {post(x + 2.5, y + 0.1)}
      <Box x={x + 0.6} y={y + 0.6} z={1.55} w={0.9} d={1.4} h={0.8} color="#2B3245" />
      <Box x={x + 0.8} y={y + 1} z={2.35} w={0.7} d={0.7} h={1.3} color="#3B6FB6" />
      <circle cx={hx} cy={hy} r={0.6 * S} fill="#8D5A3B" />
      <path d={`M${hx - 0.62 * S} ${hy - 1} A${0.62 * S} ${0.62 * S} 0 0 1 ${hx + 0.62 * S} ${hy - 1} Z`} fill="#223F7A" />
      {post(x + 0.3, y + 2.3)}
      {post(x + 2.5, y + 2.3)}
      <Box x={x + 0.2} y={y} z={4.65} w={2.6} d={2.6} h={0.2} color="#2B3245" />
      {[x + 0.7, x + 2.5].map((wx) => (
        <g key={wx} transform={onSideY(wx, y + 2.62, 0.5)}>
          <circle r={0.5 * S} fill="#1B2433" />
          <circle r={0.2 * S} fill="#C5CCD8" />
        </g>
      ))}
    </g>
  );
}

/** A tall potted plant whose leaves sway a little */
function Plant({ x, y }: { x: number; y: number }) {
  const [bx, by] = P(x + 1, y + 1, 2.2);
  const leaves: [number, number, string][] = [
    [-34, 30, "#2F6B40"], [-20, 40, "#3F7D4E"], [-8, 48, "#2F6B40"], [4, 44, "#5B9A5F"],
    [16, 38, "#3F7D4E"], [28, 30, "#5B9A5F"], [-2, 34, "#6FAE6C"],
  ];
  return (
    <g>
      <Box x={x} y={y} w={2} d={2} h={2.2} color="#2B3245" />
      <Box x={x - 0.1} y={y - 0.1} z={2} w={2.2} d={2.2} h={0.3} color="#3A4256" />
      <g transform={`translate(${bx.toFixed(1)} ${by.toFixed(1)})`}>
        <g className="plant-leaves">
          {leaves.map(([angle, length, colour], k) => (
            <path
              key={k}
              transform={`rotate(${angle})`}
              d={`M0 0 Q${length * 0.16} ${-length * 0.55} 0 ${-length} Q${-length * 0.16} ${-length * 0.55} 0 0 Z`}
              fill={colour}
            />
          ))}
        </g>
      </g>
    </g>
  );
}

/** A floating label above a station, pointing down at it */
function Callout({ at, text, dot, className }: { at: [number, number, number]; text: string; dot: string; className?: string }) {
  const [x, y] = P(...at);
  const w = text.length * 6.1 + 34;
  return (
    <g className={className} style={{ opacity: 0 }}>
      <rect x={x - w / 2 + 2} y={y - 36} width={w} height="26" rx="13" fill={NAVY} opacity="0.1" />
      <rect x={x - w / 2} y={y - 38} width={w} height="26" rx="13" fill="#FFFFFF" stroke="#DDE3EC" />
      <path d={`M${x - 6} ${y - 13} L${x} ${y - 5} L${x + 6} ${y - 13} Z`} fill="#FFFFFF" />
      <circle cx={x - w / 2 + 15} cy={y - 25} r="4.5" fill={dot} />
      <text x={x - w / 2 + 26} y={y - 21} fontSize="11.5" fontWeight="600" fill={NAVY}>{text}</text>
    </g>
  );
}

/** One order of 5,000 cartons, followed through the print shop and out of the gate. Sample figures only */
export function ProcessAnimation() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add({ desktop: "(min-width: 1024px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
        const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
        // The panel is hidden below desktop, so there is nothing to animate
        if (!desktop) return;

        const q = gsap.utils.selector(root);
        // With reduced motion the steps still change, but nothing moves
        const d = (seconds: number) => (reduce ? 0 : seconds);
        const hold = reduce ? 3.5 : 1.7;

        // How many cartons the packer has put on the pallet this round, and whether it still takes more
        const packing = { placed: 0, open: true };
        if (!reduce) bringToLife(q, packing);

        const tl = gsap.timeline({ repeat: -1, defaults: { ease: "power2.out" } });

        // ---- Start of every loop
        tl.set(q(".stage"), { autoAlpha: 1 });
        tl.set(q(".caption, .callout"), { autoAlpha: 0 });
        tl.set(q(".rail-fill"), { scaleX: 0 });
        tl.set(q(".rail-dot"), { backgroundColor: "#FFFFFF", borderColor: "#C5CCD8" });
        tl.set(q(".rail-label"), { color: MUTED, fontWeight: 500 });
        tl.set(q(".po-envelope"), { autoAlpha: 0, x: 0, y: 0 });
        tl.set(q(".jt-card"), { autoAlpha: 0 });
        tl.set(q(".pr-lamp"), { fill: "#5D6B85" });
        tl.set(q(".pr-sheet"), { autoAlpha: 0, x: 0, y: 0 });
        tl.set(q(".pr-print"), { autoAlpha: 0 });
        tl.set(q(".pk-box"), { autoAlpha: 0, y: 0 });
        tl.set(q(".pk-load"), { autoAlpha: 1, x: 0, y: 0 });
        tl.set(q(".forklift"), { x: 0, y: 0 });
        tl.set(q(".fork-carriage"), { y: 0 });
        tl.call(() => { packing.placed = 0; packing.open = true; });
        tl.set(q(".lorry"), { x: 0, y: 0 });

        STEPS.forEach((_, i) => {
          const at = `step${i}`;
          tl.addLabel(at, i === 0 ? "+=0.3" : "+=0");

          tl.to(q(".rail-fill"), { scaleX: i / (STEPS.length - 1), duration: d(0.6), ease: "power1.inOut" }, at);
          tl.to(q(`.rail-dot-${i}`), { backgroundColor: NAVY, borderColor: NAVY, duration: d(0.25) }, `${at}+=${d(0.35)}`);
          tl.to(q(`.rail-label-${i}`), { color: NAVY, fontWeight: 600, duration: d(0.2) }, "<");
          if (i > 0) {
            tl.to(q(`.rail-label-${i - 1}`), { color: MUTED, fontWeight: 500, duration: d(0.2) }, "<");
            tl.to(q(`.caption-${i - 1}, .callout-${i - 1}`), { autoAlpha: 0, duration: d(0.25) }, at);
          }
          tl.to(q(`.caption-${i}`), { autoAlpha: 1, duration: d(0.35) }, `${at}+=${d(0.3)}`);

          STATIONS[i]({ tl, q, d, reduce, at, packing });
          tl.fromTo(q(`.callout-${i}`), { autoAlpha: 0, y: reduce ? 0 : 6 }, { autoAlpha: 1, y: 0, duration: d(0.3), ease: "back.out(2)" });
          tl.to({}, { duration: i === STEPS.length - 1 ? hold + 1 : hold });
        });

        // ---- Wind back to the start in view, so the loop never blanks: the rail empties,
        // the next lorry backs in and an empty pallet is set down for the packer
        const last = STEPS.length - 1;
        tl.addLabel("reset");
        tl.to(q(`.caption-${last}, .callout-${last}`), { autoAlpha: 0, duration: d(0.3) }, "reset");
        tl.to(q(".rail-fill"), { scaleX: 0, duration: d(0.9), ease: "power1.inOut" }, "reset");
        tl.to(q(".rail-dot"), { backgroundColor: "#FFFFFF", borderColor: "#C5CCD8", duration: d(0.4) }, "reset");
        tl.to(q(".rail-label"), { color: MUTED, fontWeight: 500, duration: d(0.3) }, "reset");
        tl.to(q(".jt-card, .pr-print"), { autoAlpha: 0, duration: d(0.5) }, "reset");
        tl.to(q(".pr-lamp"), { fill: "#5D6B85", duration: d(0.5) }, "reset");
        tl.to(q(".lorry"), { x: 0, y: 0, duration: d(2.4), ease: "power2.out" }, "reset");
        tl.to(q(".wheel"), { rotation: 0, transformOrigin: "50% 50%", duration: d(2.4), ease: "power2.out" }, "reset");
        tl.set(q(".pk-box"), { autoAlpha: 0, y: 0 }, "reset");
        tl.set(q(".pk-load"), { x: 0, y: 0 }, "reset");
        tl.to(q(".pk-load"), { autoAlpha: 1, duration: d(0.4) }, `reset+=${d(0.6)}`);
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex min-h-0 flex-1 flex-col">
      {/* The steps, read in order */}
      <ol aria-label="How an order moves through Madhawee Printers" className="relative mt-8 mr-16 flex max-w-[34rem] justify-between">
        <span aria-hidden className="absolute top-[5px] right-8 left-8 h-px bg-[#D3D9E3]">
          <span className="rail-fill absolute inset-0 origin-left bg-[#14213D]" />
        </span>
        {STEPS.map((step, i) => (
          <li key={step.label} className="relative flex w-16 flex-col items-center gap-2 text-center">
            <span className={cn(`rail-dot rail-dot-${i}`, "size-[11px] rounded-full border-2 border-[#14213D] bg-[#14213D]")} />
            <span className={cn(`rail-label rail-label-${i}`, "text-[11px] leading-tight font-medium text-[#14213D]")}>{step.label}</span>
          </li>
        ))}
      </ol>

      <div aria-hidden className="relative mt-5 h-6 pr-16">
        {STEPS.map((step, i) => (
          <p key={step.label} className={cn(`caption caption-${i}`, "absolute inset-x-0 text-[15px] font-medium text-[#14213D]", i > 0 && "invisible opacity-0")}>
            {step.caption}
          </p>
        ))}
      </div>

      {/* The print shop in cutaway, with the yard outside. Bleeds to the panel's edges */}
      <div aria-hidden className="stage relative mt-2 -ml-16 min-h-[300px] flex-1 overflow-hidden xl:-ml-20">
        <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
          <g>
            {/* Shop floor, then the yard outside its open side, then the tiles */}
            <Box x={0} y={0} z={-1.2} w={34} d={26} h={1.2} color="#B8C2D3" />
            <Box x={34} y={0} z={-1.2} w={64} d={26} h={1.2} color="#A9B3C4" top="#D0D6E0" />
            {/* The road out: two lanes, driving on the left */}
            <polygon points={pts([34, 15], [98, 15], [98, 24.4], [34, 24.4])} fill="#B7C0CE" />
            {[15.5, 23.9].map((y) => (
              <line key={y} x1={P(34, y)[0]} y1={P(34, y)[1]} x2={P(98, y)[0]} y2={P(98, y)[1]} stroke="#FFFFFF" strokeWidth="1.6" />
            ))}
            <line x1={P(36, 19.7)[0]} y1={P(36, 19.7)[1]} x2={P(98, 19.7)[0]} y2={P(98, 19.7)[1]} stroke="#FFFFFF" strokeWidth="2.2" strokeDasharray="12 10" />
            {Array.from({ length: 13 }, (_, j) =>
              Array.from({ length: 17 }, (_, i) => (
                <polygon
                  key={`${i}-${j}`}
                  points={pts([i * 2, j * 2], [i * 2 + 2, j * 2], [i * 2 + 2, j * 2 + 2], [i * 2, j * 2 + 2])}
                  fill={(i + j) % 2 ? "#E3E8EF" : "#EEF1F5"}
                />
              )),
            )}

            {/* Walls: back (y = 0) and left (x = 0), with panelling below */}
            <polygon points={pts([0, 0, 0], [34, 0, 0], [34, 0, 14], [0, 0, 14])} fill="#EEF1F6" />
            <polygon points={pts([0, 0, 0], [34, 0, 0], [34, 0, 4], [0, 0, 4])} fill="#C9D3E3" />
            {Array.from({ length: 16 }, (_, k) => (
              <line key={k} x1={P(2 + k * 2, 0, 0.4)[0]} y1={P(2 + k * 2, 0, 0.4)[1]} x2={P(2 + k * 2, 0, 3.6)[0]} y2={P(2 + k * 2, 0, 3.6)[1]} stroke="#B3C0D4" />
            ))}
            <polygon points={pts([0, 0, 0], [0, 26, 0], [0, 26, 14], [0, 0, 14])} fill="#E2E7EF" />
            <polygon points={pts([0, 0, 0], [0, 26, 0], [0, 26, 4], [0, 0, 4])} fill="#BCC8DA" />
            {Array.from({ length: 12 }, (_, k) => (
              <line key={k} x1={P(0, 2 + k * 2, 0.4)[0]} y1={P(0, 2 + k * 2, 0.4)[1]} x2={P(0, 2 + k * 2, 3.6)[0]} y2={P(0, 2 + k * 2, 3.6)[1]} stroke="#A9B7CC" />
            ))}
            <polygon points={pts([-0.8, -0.8, 14], [34, -0.8, 14], [34, 0, 14], [0, 0, 14], [0, 26, 14], [-0.8, 26, 14])} fill="#B8C2D3" />
            <polygon points={pts([34, -0.8, 0], [34, 0, 0], [34, 0, 14], [34, -0.8, 14])} fill="#A3AEC2" />
            <polygon points={pts([-0.8, 26, 0], [0, 26, 0], [0, 26, 14], [-0.8, 26, 14])} fill="#C3CCDB" />

            {/* Window on the left wall */}
            <polygon points={pts([0, 4, 5.5], [0, 13, 5.5], [0, 13, 11.5], [0, 4, 11.5])} fill="#FFFFFF" />
            <polygon points={pts([0, 4.5, 6], [0, 12.5, 6], [0, 12.5, 11], [0, 4.5, 11])} fill="#CFE3F5" />
            <polygon points={pts([0, 4.5, 6], [0, 7, 6], [0, 12.5, 11], [0, 10, 11])} fill="#E3EFFA" />
            <line x1={P(0, 8.5, 6)[0]} y1={P(0, 8.5, 6)[1]} x2={P(0, 8.5, 11)[0]} y2={P(0, 8.5, 11)[1]} stroke="#FFFFFF" strokeWidth="2" />

            {/* Shop sign and colour strip on the back wall */}
            <g transform={onBackWall(19, 11.2)}>
              <rect x="-6" y="-13" width="128" height="22" rx="4" fill={NAVY} />
              <text x="58" y="2" fontSize="11" fontWeight="600" fill="#FFFFFF" textAnchor="middle">Madhawee Printers</text>
            </g>
            <g transform={onBackWall(19, 7.2)}>
              {CMYK.map((c, k) => <rect key={c} x={k * 10} y="0" width="10" height="5" fill={c} />)}
            </g>

            {/* Job board with tickets pinned up */}
            <polygon points={pts([4, 0, 6], [14, 0, 6], [14, 0, 11.5], [4, 0, 11.5])} fill={KRAFT} />
            <polygon points={pts([4.3, 0, 6.3], [13.7, 0, 6.3], [13.7, 0, 11.2], [4.3, 0, 11.2])} fill="#D9B183" />
            {[[5, 9.8], [7.6, 9.6], [5.2, 7.2]].map(([x, z]) => (
              <polygon key={`${x}-${z}`} points={pts([x, 0, z - 2], [x + 2, 0, z - 2], [x + 2, 0, z], [x, 0, z])} fill="#FFFFFF" />
            ))}
            <g className="jt-card">
              <polygon points={pts([10.4, 0, 7], [13, 0, 7], [13, 0, 10.6], [10.4, 0, 10.6])} fill="#FFFFFF" />
              <polygon points={pts([10.4, 0, 10.1], [13, 0, 10.1], [13, 0, 10.6], [10.4, 0, 10.6])} fill="#223F7A" />
              <circle cx={P(11.7, 0, 10.6)[0]} cy={P(11.7, 0, 10.6)[1]} r="2.2" fill="#DC2626" />
              {[9.4, 8.7, 8].map((z) => (
                <line key={z} x1={P(10.8, 0, z)[0]} y1={P(10.8, 0, z)[1]} x2={P(12.6, 0, z)[0]} y2={P(12.6, 0, z)[1]} stroke="#C5CCD8" strokeWidth="1.5" />
              ))}
            </g>

            {/* Board stock on a pallet under the window */}
            <Box x={1} y={5} w={3.6} d={7} h={0.6} color="#A87A48" />
            <Box x={1.3} y={5.3} z={0.6} w={3} d={6.4} h={3} color="#ECE8DD" top="#F8F6F0" />
            <Box x={1.3} y={5.3} z={3.6} w={3} d={6.4} h={0.3} color="#D9D3C4" />

            {/* Office: desk, screen and papers, with a plant in the corner */}
            <Plant x={1.4} y={22.6} />
            <Box x={2.5} y={15.6} w={7} d={3.4} h={3.2} color="#B98B5E" top="#D2A97E" />
            <Box x={3} y={16} z={3.2} w={0.5} d={2.4} h={2} color="#2B3245" />
            <Box x={5.4} y={16.8} z={3.2} w={2} d={1.4} h={0.12} color="#FFFFFF" top="#FFFFFF" />

            {/* Paper waiting to be printed */}
            <Box x={7.2} y={10} w={3} d={4} h={0.5} color="#A87A48" />
            <Box x={7.4} y={10.2} z={0.5} w={2.6} d={3.6} h={2} color="#ECE8DD" top="#FFFFFF" />

            <Person id="office" x={6.6} y={21} shirt="#D9822B" skin="#8D5A3B" hair="#1B1B1B" />

            {/* The press: four colour units on one base, a lamp on each */}
            <Box x={11} y={9} w={18} d={6} h={4.6} color="#223F7A" />
            <polygon points={pts([11, 15, 3.2], [29, 15, 3.2], [29, 15, 3.7], [11, 15, 3.7])} fill={NAVY} />
            {CMYK.map((c, u) => {
              const ux = 12 + u * 4.2;
              const [lx, ly] = P(ux + 1.7, 14.5, 6.2);
              return (
                <g key={c}>
                  <Box x={ux} y={9.6} z={4.6} w={3.4} d={4.9} h={3.2} color="#2E4F91" />
                  <Box x={ux} y={9.6} z={7.8} w={3.4} d={4.9} h={0.5} color={c} />
                  <circle className={`pr-lamp pr-lamp-${u}`} data-colour={c} cx={lx} cy={ly} r="3.2" fill={c} />
                </g>
              );
            })}
            {/* Sheets travelling over the units */}
            {[0, 1, 2].map((k) => (
              <g key={k} className="pr-sheet" style={{ opacity: 0 }}>
                <g transform={onTop(8.6, 10.8, 8.6)}>
                  <rect x="0" y="0" width="2.6" height="3.4" fill="#FFFFFF" stroke="#C5CCD8" strokeWidth="0.08" />
                </g>
              </g>
            ))}

            {/* Printed sheets coming off the press */}
            <Box x={29.6} y={10} w={3} d={4} h={0.5} color="#A87A48" />
            <Box x={29.8} y={10.2} z={0.5} w={2.6} d={3.6} h={1.6} color="#ECE8DD" top="#FFFFFF" />
            <g className="pr-print" transform={onTop(29.8, 10.2, 2.1)}>
              <rect x="0" y="0" width="2.6" height="3.6" fill={CMYK[0]} opacity="0.8" />
              <circle cx="1.3" cy="1.2" r="0.55" fill={CMYK[1]} />
              <rect x="0" y="2.2" width="2.6" height="0.35" fill={CMYK[2]} />
              <rect x="0.5" y="2.8" width="1.6" height="0.18" fill={CMYK[3]} />
            </g>

            <Person id="checker" x={31.2} y={16.2} shirt="#3B6FB6" pants="#223F7A" skin="#C68B5E" hair="#2B1B12" cap />
            <Person id="operator" x={12} y={17.2} shirt="#3B6FB6" pants="#223F7A" skin="#6B4128" hair="#111111" cap apron />
            <Person id="packer" x={27} y={16.8} shirt="#5B8C5A" skin="#8D5A3B" hair="#1B1B1B" face="left" carrying />

            <Forklift x={17} y={21} />

            {/* Packing: a carton goes onto the pallet each time the packer brings one */}
            <g className="pk-load">
            <Box x={28.2} y={19.2} w={5.6} d={5.6} h={0.6} color="#A87A48" />
            <g className="pk-stack">
              {[0, 1].flatMap((layer) =>
                [0, 1].flatMap((cx) =>
                  [0, 1].map((cy) => (
                    <Box key={`${layer}-${cx}-${cy}`} className="pk-box" x={28.4 + cx * 2.7} y={19.4 + cy * 2.7} z={0.6 + layer * 2.2} w={2.5} d={2.5} h={2.2} color={KRAFT} />
                  )),
                ),
              )}
            </g>
            </g>

            {/* The lorry, backed up to the open side, cab facing the road out */}
            <g className="lorry">
              <g transform={LORRY_SCALE}>
              <polygon points={pts([36, 17.2, 0], [53, 17.2, 0], [53, 23.4, 0], [36, 23.4, 0])} fill={NAVY} opacity="0.14" />
              <Box x={36.4} y={17.4} z={0.7} w={15.8} d={4.8} h={0.7} color="#1B2433" />
              <Box x={36} y={17} z={1.4} w={10.4} d={5.6} h={6.8} color="#F1F4F9" top="#FFFFFF" />
              <polygon points={pts([36, 22.6, 2], [46.4, 22.6, 2], [46.4, 22.6, 2.8], [36, 22.6, 2.8])} fill="#223F7A" />
              <g transform={onSideY(36.8, 22.6, 5.6)}>
                <text x="0" y="0" fontSize="9.5" fontWeight="700" fill={NAVY}>Madhawee Printers</text>
                {CMYK.map((c, k) => <rect key={c} x={k * 9} y="6" width="9" height="4" fill={c} />)}
              </g>

              {/* Cab: body and hood, then the cabin with its windscreen */}
              <Box x={46.6} y={17.2} z={1.4} w={5.6} d={5.2} h={2.8} color="#223F7A" />
              <Box x={46.6} y={17.2} z={4.2} w={4.4} d={5.2} h={2.6} color="#223F7A" />
              <polygon points={pts([51, 17.6, 4.5], [51, 22, 4.5], [51, 22, 6.5], [51, 17.6, 6.5])} fill="#BFD3F2" />
              <polygon points={pts([51, 18.4, 4.5], [51, 19.4, 4.5], [51, 20.6, 6.5], [51, 19.6, 6.5])} fill="#E3EEFB" />
              <polygon points={pts([47.2, 22.4, 4.5], [50.4, 22.4, 4.5], [50.4, 22.4, 6.4], [47.2, 22.4, 6.4])} fill="#BFD3F2" />
              <line x1={P(47.2, 22.4, 1.6)[0]} y1={P(47.2, 22.4, 1.6)[1]} x2={P(47.2, 22.4, 4.2)[0]} y2={P(47.2, 22.4, 4.2)[1]} stroke="#1B2433" strokeOpacity="0.5" />
              <polygon points={pts([48.6, 22.4, 3.4], [49.6, 22.4, 3.4], [49.6, 22.4, 3.7], [48.6, 22.4, 3.7])} fill="#C5CCD8" />
              <Box x={50.6} y={22.4} z={5} w={0.3} d={0.7} h={1.2} color="#1B2433" />

              {/* Front: grille, headlights, bumper */}
              <polygon points={pts([52.2, 18.9, 1.9], [52.2, 20.7, 1.9], [52.2, 20.7, 3.5], [52.2, 18.9, 3.5])} fill="#1B2433" />
              {[2.3, 2.7, 3.1].map((z) => (
                <line key={z} x1={P(52.2, 19.1, z)[0]} y1={P(52.2, 19.1, z)[1]} x2={P(52.2, 20.5, z)[0]} y2={P(52.2, 20.5, z)[1]} stroke="#5B6474" />
              ))}
              {[17.6, 21.2].map((y) => (
                <polygon key={y} points={pts([52.2, y, 2.8], [52.2, y + 0.9, 2.8], [52.2, y + 0.9, 3.5], [52.2, y, 3.5])} fill="#FFF4C2" />
              ))}
              <Box x={52.2} y={17.1} z={1.1} w={0.5} d={5.4} h={0.8} color="#5B6474" />

              {[39.2, 41.7, 49.4].map((wx) => (
                <g key={wx} transform={onSideY(wx, 22.7, 1.15)}>
                  <circle r={1.15 * S} fill="#1B2433" />
                  <g className="wheel">
                    <circle r={0.52 * S} fill="#C5CCD8" />
                    <path d={`M0 ${-0.52 * S} V${0.52 * S} M${-0.52 * S} 0 H${0.52 * S}`} stroke={MUTED} strokeWidth="1.4" />
                  </g>
                </g>
              ))}
              </g>
            </g>

            {/* An envelope flying in through the window */}
            <g className="po-envelope" style={{ opacity: 0 }}>
              <g transform={`translate(${P(0, 8.5, 8.5)[0]} ${P(0, 8.5, 8.5)[1]})`}>
                <rect x="-11" y="-7" width="22" height="14" rx="2" fill="#FFFFFF" stroke="#223F7A" strokeWidth="1.5" />
                <path d="M-11 -7 L0 1 L11 -7" fill="none" stroke="#223F7A" strokeWidth="1.5" />
              </g>
            </g>

            {/* Labels over each station */}
            <Callout className="callout callout-0" at={[6, 17.2, 6]} text="Q-1042 accepted" dot="#16A34A" />
            <Callout className="callout callout-1" at={[6, 17.2, 6]} text="PO-2318 received" dot="#223F7A" />
            <Callout className="callout callout-2" at={[11.7, 0, 12.4]} text="JT-0871, 5,000 cartons" dot="#EA580C" />
            <Callout className="callout callout-3" at={[19, 11.5, 10.5]} text="Cyan, magenta, yellow, black" dot="#EC008C" />
            <Callout className="callout callout-4" at={[31, 21.5, 6.5]} text="5,000 cartons loaded" dot="#16A34A" />
            <Callout className="callout callout-5" at={[47, 21.6, 6.5]} text="Out for delivery" dot="#16A34A" />
          </g>
        </svg>
      </div>
    </div>
  );
}

type StationContext = {
  tl: gsap.core.Timeline;
  q: (selector: string) => Element[];
  d: (seconds: number) => number;
  reduce: boolean;
  at: string;
  packing: { placed: number; open: boolean };
};

/** What happens at each station, in step order */
const STATIONS: ((ctx: StationContext) => void)[] = [
  // Quotation: a beat on the office before the label appears
  ({ tl, at }) => {
    tl.to({}, { duration: 0.6 }, at);
  },

  // Purchase order: an envelope comes in through the window and lands on the desk
  ({ tl, q, d, at }) => {
    const [x0, y0] = P(0, 8.5, 8.5);
    const [x1, y1] = P(5.8, 17.4, 3.6);
    tl.to(q(".po-envelope"), { autoAlpha: 1, duration: d(0.2) }, `${at}+=0.9`);
    tl.to(q(".po-envelope"), { x: x1 - x0, y: y1 - y0, duration: d(1), ease: "power1.inOut" }, "<");
  },

  // Job ticket: the new ticket is pinned up
  ({ tl, q, d, at }) => {
    tl.to(q(".po-envelope"), { autoAlpha: 0, duration: d(0.2) }, at);
    tl.fromTo(q(".jt-card"), { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 0%" }, { autoAlpha: 1, scale: 1, duration: d(0.4), ease: "back.out(2)" }, `${at}+=1`);
  },

  // On press: sheets glide over the units, each lamp lights as they pass, the pile comes out printed
  ({ tl, q, d, at }) => {
    const glide = d(2.4);
    const over = along(21, 0);
    const drop = along(21.3, -0.6, -6.5);
    tl.addLabel("pressRun", `${at}+=1`);
    q(".pr-sheet").forEach((sheet, k) => {
      const start = `pressRun+=${(k * d(0.55)).toFixed(2)}`;
      tl.set(sheet, { x: 0, y: 0 }, start);
      tl.to(sheet, { autoAlpha: 1, duration: d(0.15) }, start);
      tl.to(sheet, { ...over, duration: glide, ease: "none" }, start);
      tl.to(sheet, { ...drop, autoAlpha: 0, duration: d(0.3), ease: "power1.in" }, ">");
    });
    CMYK.forEach((_, u) => {
      const lamp = q(`.pr-lamp-${u}`)[0] as SVGElement;
      tl.to(lamp, { fill: lamp.dataset.colour, duration: d(0.2) }, `pressRun+=${(glide * (0.18 + u * 0.2)).toFixed(2)}`);
    });
    tl.to(q(".pr-print"), { autoAlpha: 1, duration: d(0.4) }, `pressRun+=${(glide + d(0.4)).toFixed(2)}`);
  },

  // Dispatch: the last cartons go on, the forklift lifts the pallet and drives it into the lorry
  ({ tl, q, d, at, packing }) => {
    const LIFT = 1.2 * S;
    tl.call(() => {
      packing.open = false;
      // Whatever the packer hasn't brought yet goes on now, so the pallet is full
      const left = q(".pk-box").slice(packing.placed);
      packing.placed = q(".pk-box").length;
      gsap.fromTo(left, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: d(0.25), stagger: d(0.12), ease: "back.out(2)" });
    }, undefined, `${at}+=0.5`);
    tl.to({}, { duration: d(1.1) });
    // Drive up and slide the forks under the pallet
    tl.to(q(".forklift"), { ...along(8.1, 0), duration: d(1.5), ease: "power1.inOut" });
    // Lift
    tl.to(q(".fork-carriage, .pk-load"), { y: `-=${LIFT}`, duration: d(0.6), ease: "power1.inOut" }, "+=0.2");
    // Carry it into the back of the lorry
    const carry = along(8, 0);
    const end = along(16.1, 0);
    tl.to(q(".forklift"), { x: end.x, y: end.y, duration: d(1.5), ease: "power1.inOut" }, "+=0.1");
    tl.to(q(".pk-load"), { x: carry.x, y: carry.y - LIFT, duration: d(1.5), ease: "power1.inOut" }, "<");
    tl.to(q(".pk-load"), { autoAlpha: 0, duration: d(0.3) });
    // Lower the forks and back out
    tl.to(q(".fork-carriage"), { y: 0, duration: d(0.4) });
    tl.to(q(".forklift"), { x: 0, y: 0, duration: d(1.8), ease: "power1.inOut" });
  },

  // Delivered: the lorry pulls away down the road, wheels turning
  ({ tl, q, d, at }) => {
    const drive = d(2.6);
    tl.to(q(".lorry"), { ...along(36, 0), duration: drive, ease: "power1.in" }, `${at}+=0.2`);
    tl.to(q(".wheel"), { rotation: 900, transformOrigin: "50% 50%", duration: drive, ease: "power1.in" }, "<");
  },
];

/* ------------------------------------------------------------------ people at work
   These loop on their own, apart from the story, so the shop never stands still. */

type Q = (selector: string) => Element[];
type Pose = { legF?: number; legB?: number; armF?: number; armB?: number; bob?: number };

/** Set a person's limbs: angles in degrees (negative swings forward), bob in px (negative is up) */
function pose(q: Q, id: string, { legF = 0, legB = 0, armF = 0, armB = 0, bob = 0 }: Pose) {
  const set = (cls: string, value: string) => q(`.${cls}-${id}`).forEach((el) => el.setAttribute("transform", value));
  set("legF", `rotate(${legF.toFixed(1)})`);
  set("legB", `rotate(${legB.toFixed(1)})`);
  set("armF", `rotate(${armF.toFixed(1)})`);
  set("armB", `rotate(${armB.toFixed(1)})`);
  set("bob", `translate(0 ${bob.toFixed(2)})`);
}

const face = (q: Q, id: string, dir: "left" | "right") =>
  q(`.flip-${id}`).forEach((el) => (dir === "left" ? el.setAttribute("transform", "scale(-1 1)") : el.removeAttribute("transform")));

/** A walking stride that can be paused and resumed; `carrying` holds the arms out in front */
function stride(q: Q, id: string, state: { carrying: boolean }) {
  const swing = { t: -1 };
  return gsap.to(swing, {
    t: 1,
    duration: 0.36,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
    paused: true,
    onUpdate: () => {
      const t = swing.t;
      pose(q, id, {
        legF: 26 * t,
        legB: -26 * t,
        armF: state.carrying ? -64 : -22 * t,
        armB: state.carrying ? -58 : 22 * t,
        bob: -(1 - t * t) * 1.6,
      });
    },
  });
}

/**
 * Walk a person along a route of legs (world offsets, one after another), pausing at the far end,
 * then back the same way. Each end has a hook so the person can do something there.
 */
function route(
  q: Q,
  id: string,
  legs: [number, number][],
  opts: { state?: { carrying: boolean }; atFar?: (tl: gsap.core.Timeline) => void; atHome?: (tl: gsap.core.Timeline) => void } = {},
) {
  const state = opts.state ?? { carrying: false };
  const walk = stride(q, id, state);
  const person = q(`.person-${id}`);
  const stand = () => {
    walk.pause();
    pose(q, id, { armF: state.carrying ? -64 : 0, armB: state.carrying ? -58 : 0 });
  };
  const points: [number, number][] = [[0, 0]];
  legs.forEach(([dx, dy]) => {
    const [x, y] = points[points.length - 1];
    points.push([x + dx, y + dy]);
  });
  const tl = gsap.timeline({ repeat: -1 });
  const go = (from: [number, number], to: [number, number]) => {
    const [dx, dy] = [to[0] - from[0], to[1] - from[1]];
    // Facing follows which way the leg runs across the screen
    tl.call(() => { face(q, id, dx - dy >= 0 ? "right" : "left"); walk.play(); });
    tl.to(person, { ...along(...to), duration: Math.hypot(dx, dy) / 3.2, ease: "none" });
  };
  for (let k = 1; k < points.length; k++) go(points[k - 1], points[k]);
  tl.call(stand);
  if (opts.atFar) opts.atFar(tl);
  else tl.to({}, { duration: 0.9 });
  for (let k = points.length - 1; k > 0; k--) go(points[k], points[k - 1]);
  tl.call(stand);
  if (opts.atHome) opts.atHome(tl);
  else tl.to({}, { duration: 0.9 });
  return tl;
}

function bringToLife(q: Q, packing: { placed: number; open: boolean }) {
  // The operator walks the length of the press and back
  route(q, "operator", [[12, 0]], {
    atFar: (tl) => tl.call(() => face(q, "operator", "right")).to({}, { duration: 1 }),
  });

  // The packer takes a carton from the press to the pallet, puts it down, and goes back for another
  const packer = { carrying: true };
  const carton = q(".carry-packer");
  const pile = q(".pk-box");
  route(q, "packer", [[0, 2.2]], {
    state: packer,
    atFar: (tl) =>
      tl.call(() => {
        packer.carrying = false;
        gsap.set(carton, { autoAlpha: 0 });
        pose(q, "packer", {});
        // The carton he set down joins the pile, until the pallet is full or has gone out
        if (packing.open && packing.placed < pile.length) {
          gsap.fromTo(pile[packing.placed], { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "back.out(2)" });
          packing.placed += 1;
        }
      }).to({}, { duration: 0.7 }),
    atHome: (tl) =>
      tl.call(() => { packer.carrying = true; gsap.set(carton, { autoAlpha: 1 }); pose(q, "packer", { armF: -64, armB: -58 }); }).to({}, { duration: 0.8 }),
  });

  // The office worker types for a while, takes a ticket over to the job board, and comes back
  const keys = { t: -1 };
  const typing = gsap.to(keys, {
    t: 1, duration: 0.16, repeat: -1, yoyo: true, ease: "sine.inOut", paused: true,
    onUpdate: () => pose(q, "office", { armF: -62 + 7 * keys.t, armB: -56 - 7 * keys.t }),
  });
  const pin = { a: 0 };
  const type = (tl: gsap.core.Timeline) =>
    tl.call(() => { face(q, "office", "right"); typing.play(); }).to({}, { duration: 3.2 }).call(() => { typing.pause(); pose(q, "office", {}); });
  const office = route(q, "office", [[4, 0], [0, -12.6]], {
    atFar: (tl) =>
      tl.call(() => face(q, "office", "right"))
        .to(pin, { a: 1, duration: 0.4, ease: "power2.out", onUpdate: () => pose(q, "office", { armF: -150 * pin.a }) })
        .to({}, { duration: 0.6 })
        .to(pin, { a: 0, duration: 0.35, onUpdate: () => pose(q, "office", { armF: -150 * pin.a }) }),
    atHome: type,
  });
  // Start at the desk, typing
  const start = gsap.timeline();
  type(start);
  office.pause();
  start.call(() => { office.play(0); });

  // The checker looks over the printed sheets, steps along the press end, and looks again
  const reach = { a: 0 };
  const check = (tl: gsap.core.Timeline) =>
    tl.call(() => face(q, "checker", "right"))
      .to(reach, { a: 1, duration: 0.6, ease: "sine.inOut", onUpdate: () => pose(q, "checker", { armF: -105 * reach.a, armB: -20 * reach.a }) })
      .to(reach, { a: 0, duration: 0.6, ease: "sine.inOut", onUpdate: () => pose(q, "checker", { armF: -105 * reach.a, armB: -20 * reach.a }) })
      .to({}, { duration: 0.5 });
  route(q, "checker", [[2.2, 0]], { atFar: check, atHome: check });

  // Leaves sway in the air from the door
  const sway = { a: -1 };
  const leaves = q(".plant-leaves");
  gsap.to(sway, {
    a: 1, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut",
    onUpdate: () => leaves.forEach((el) => el.setAttribute("transform", `rotate(${(3 * sway.a).toFixed(2)})`)),
  });
}
