import Image from "next/image";
import { FileText, ShoppingCart, ClipboardCheck, Truck } from "lucide-react";
import { LoginForm } from "./loginForm";
import { LoginRays } from "./loginRays";
import { companyData } from "@/modules/quotations/mockData";

/** The path every job takes through the system, with the same icons as the sidebar */
const STAGES = [
  { label: "Quotation", icon: FileText },
  { label: "Purchase order", icon: ShoppingCart },
  { label: "Job ticket", icon: ClipboardCheck },
  { label: "Dispatch", icon: Truck },
];

/** Process colours, solid then as 50% tints — the control strip printed on every press sheet */
const COLOUR_BAR = ["#00AEEF", "#EC008C", "#FFDE00", "#231F20"];

export default function LoginPage() {
  return (
    <main className="grid min-h-svh grid-rows-[auto_1fr] bg-white lg:grid-rows-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <section className="login-panel relative isolate flex h-44 flex-col overflow-hidden px-6 py-6 text-white sm:h-56 sm:px-10 sm:py-10 lg:h-auto lg:px-14 lg:py-14">
        <div aria-hidden className="absolute inset-0 -z-10">
          <LoginRays />
        </div>

        <Image
          src="/images/madhawee_logo.svg"
          alt="Madhawee Printers (Pvt) Ltd"
          width={260}
          height={38}
          priority
          unoptimized
          className="h-auto w-[210px] brightness-0 invert sm:w-[250px]"
        />

        <div className="hidden flex-1 flex-col items-center justify-center py-16 text-center lg:flex">
          <h2 className="max-w-[16ch] text-[2.75rem] leading-[1.08] font-bold tracking-[-0.025em] text-balance">
            From quotation to dispatch
          </h2>
          <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-pretty text-white/75">
            Quotations, purchase orders, job tickets and dispatch for every print job, kept
            in one place.
          </p>

          <div className="relative mt-14 w-full max-w-[520px]">
            {/* A light carries the job along the line; at each stage a ring closes around
                the icon before the light moves on */}
            <div aria-hidden className="absolute inset-x-[12.5%] top-[22px] h-px bg-white/30">
              <span className="login-pulse absolute -top-[1px] h-[3px] w-16 rounded-full" />
            </div>
            <ol className="relative grid grid-cols-4">
              {STAGES.map(({ label, icon: Icon }, index) => (
                <li key={label} className="flex flex-col items-center gap-3">
                  <span className="relative flex size-11 items-center justify-center rounded-full border border-white/35 bg-[#0B3A7E]">
                    <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                    <svg
                      aria-hidden
                      viewBox="0 0 60 60"
                      className="pointer-events-none absolute left-1/2 top-1/2 size-[60px] -translate-x-1/2 -translate-y-1/2 rotate-180 overflow-visible"
                    >
                      <circle
                        className={`login-ring login-ring-${index + 1}`}
                        cx="30"
                        cy="30"
                        r="28"
                        pathLength={100}
                      />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-white/85">{label}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="hidden items-end justify-between gap-8 lg:flex">
          <p className="max-w-[26ch] text-sm leading-relaxed text-white/70">
            {companyData.address}
          </p>
          <div aria-hidden className="flex shrink-0">
            {COLOUR_BAR.map((colour) => (
              <span key={colour} className="h-3 w-5" style={{ backgroundColor: colour }} />
            ))}
            {COLOUR_BAR.map((colour) => (
              <span
                key={`${colour}-tint`}
                className="h-3 w-5"
                style={{ backgroundColor: colour, opacity: 0.55 }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-start px-6 py-10 sm:px-12 sm:py-14 lg:items-center lg:px-20">
        <LoginForm className="w-full max-w-[380px] lg:mx-auto" />
      </section>
    </main>
  );
}
