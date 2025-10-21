import type { Metadata } from "next";
import "./globals.css";
import { FullLoadingProvider } from "@/components/providers/full-loading-provider";
import { Suspense } from "react";
import { AlertDialogProvider } from "@/components/providers/alert-provider";
import { HelperProvider } from "@/components/providers/helper-provider";

export const metadata: Metadata = {
  title: "bearhouse merchandise",
  description: "subearhousensu merchandise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased relative mx-auto select-none w-[100vw] md:w-[600px] h-[100dvh] overflow-scroll`}
      >
        <Suspense fallback={<div></div>}>
          <FullLoadingProvider>
            <AlertDialogProvider>
              <HelperProvider>
                <div className="containter">{children}</div>
              </HelperProvider>
            </AlertDialogProvider>
          </FullLoadingProvider>
        </Suspense>
      </body>
    </html>
  );
}
