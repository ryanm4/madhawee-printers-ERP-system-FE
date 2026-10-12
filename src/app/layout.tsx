"use client";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { usePathname } from "next/navigation";
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { StoreProvider } from "@/store/store-provider";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en" className={`${manrope.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans">
        <StoreProvider>
          {/* The app has no dark mode, so toasts stay light even when the device is set to dark */}
          <Toaster position="bottom-right" theme="light" closeButton />
          {isLoginPage ? (
            <>{children}</>
          ) : (
            <SidebarProvider>
              <AppSidebar variant="inset" />
              <SidebarInset>
                <SiteHeader />
                <main className="w-full relative flex-1 flex flex-col">
                  {children}
                </main>
              </SidebarInset>
            </SidebarProvider>
          )}
        </StoreProvider>
      </body>
    </html>
  );
}
