"use client";
import type { Metadata } from "next";
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


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <html lang="en" className={`${manrope.variable} ${geistMono.variable}`}>
      {/* Global providers (Redux, Toast, etc.) can wrap children here */}

      <body className="antialiased font-sans">
        {" "}


        {isLoginPage ? (
          <>{children}</>
        ) : (
          <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
              <SiteHeader />
              <Toaster />
              <main className="w-full">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        )}
      </body>
    </html>
  );
}
