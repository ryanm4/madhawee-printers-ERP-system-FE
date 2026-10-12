import Image from "next/image";
import { LoginForm } from "./loginForm";

/** Process colours, solid then as tints: the control strip printed on every press sheet */
const COLOUR_BAR = ["#00AEEF", "#EC008C", "#FFDE00", "#231F20"];

export default function LoginPage() {
  return (
    <main className="grid min-h-svh bg-white lg:h-svh lg:grid-cols-2">
      {/* Sign in */}
      <section className="flex flex-col px-6 py-8 sm:px-12 sm:py-10 lg:overflow-y-auto">
        <div className="flex flex-1 items-center py-12">
          <div className="mx-auto flex w-full max-w-[360px] flex-col gap-12">
            <Image
              src="/images/madhawee_logo.svg"
              alt="Madhawee Printers (Pvt) Ltd"
              width={260}
              height={38}
              priority
              unoptimized
              className="-ml-2 h-auto w-[220px]"
            />
            <LoginForm />
          </div>
        </div>

        <p className="text-sm text-[#5B6474]">© {new Date().getFullYear()} Madhawee Printers (Pvt) Ltd</p>
      </section>

      {/* What the system is, with a look at it. The screenshot uses sample figures, never live data */}
      <section
        aria-label="About PaperTrail ERP"
        className="relative hidden flex-col overflow-hidden bg-[#F2F4F8] pt-20 pl-16 lg:flex xl:pt-24 xl:pl-20"
      >
        <div className="max-w-[34rem] pr-16">
          <h2 className="text-[2rem] leading-[1.2] font-semibold tracking-[-0.02em] text-balance text-[#14213D] xl:text-[2.25rem]">
            Every print job, from the first quotation to the last dispatch.
          </h2>
          <div className="mt-6 flex items-end justify-between gap-8">
            <p className="max-w-[34ch] text-[0.9375rem] leading-relaxed text-pretty text-[#4B5567]">
              Quotations, purchase orders, job tickets, stock and dispatch, kept in one place.
            </p>
            <div aria-hidden className="mb-1.5 flex shrink-0">
              {COLOUR_BAR.map((colour) => (
                <span key={colour} className="h-2.5 w-4" style={{ backgroundColor: colour }} />
              ))}
              {COLOUR_BAR.map((colour) => (
                <span key={`${colour}-tint`} className="h-2.5 w-4" style={{ backgroundColor: colour, opacity: 0.5 }} />
              ))}
            </div>
          </div>
        </div>

        {/* Runs off the right and bottom edges, so only its top-left corner is rounded */}
        <div className="mt-14 min-h-0 flex-1 xl:mt-16">
          <div className="w-[1040px] overflow-hidden rounded-tl-[20px] border-t-[7px] border-l-[7px] border-white bg-white shadow-[0_24px_60px_-20px_rgb(20_33_61/0.25)] ring-1 ring-[#DDE3EC] xl:w-[1180px]">
            <Image
              src="/images/login-dashboard.webp"
              alt="The PaperTrail dashboard, showing revenue, quotations, production, dispatch and stock"
              width={2880}
              height={1800}
              priority
              sizes="1180px"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
